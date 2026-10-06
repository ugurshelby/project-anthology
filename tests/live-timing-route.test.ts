/**
 * Route-level simulation of /api/live-timing across a race session timeline
 * (Master-plan 1.1): live window + post-finish grace, edge-cache header,
 * stampede guard, TTL memo, serve-stale on upstream failure/timeout.
 *
 * OpenF1 is stubbed with a deterministic session; the route module is
 * re-imported per test because its memo + in-flight guard are module-scoped.
 */

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { NextRequest } from 'next/server';

const SESSION_START = Date.parse('2026-10-04T07:00:00Z');
const SESSION_END = Date.parse('2026-10-04T09:00:00Z');
const MIN = 60_000;

const mockSession = vi.fn();
const mockDrivers = vi.fn();
const mockPositions = vi.fn();
const mockIntervals = vi.fn();
const mockRateLimit = vi.fn();

vi.mock('@/lib/f1/sources/openf1', () => ({
  fetchLatestSession: () => mockSession(),
  fetchLiveDrivers: (key: number) => mockDrivers(key),
  fetchLivePositions: (key: number) => mockPositions(key),
  fetchLiveIntervals: (key: number) => mockIntervals(key),
}));

vi.mock('@/lib/rateLimit', () => ({
  applyRateLimit: (...args: unknown[]) => mockRateLimit(...args),
}));

function raceSession(overrides: Record<string, unknown> = {}) {
  return {
    session_key: 11731,
    session_name: 'Race',
    circuit_short_name: 'Sepang',
    date_start: new Date(SESSION_START).toISOString(),
    date_end: new Date(SESSION_END).toISOString(),
    ...overrides,
  };
}

function seedLiveData() {
  mockSession.mockResolvedValue(raceSession());
  mockDrivers.mockResolvedValue([
    { driver_number: 4, name_acronym: 'NOR', full_name: 'Lando Norris', team_name: 'McLaren', team_colour: 'FF8000' },
    { driver_number: 1, name_acronym: 'VER', full_name: 'Max Verstappen', team_name: 'Red Bull Racing', team_colour: '#3671C6' },
  ]);
  // Position time-series: VER led early, NOR took the lead later — only the newest row per driver counts.
  mockPositions.mockResolvedValue([
    { date: '2026-10-04T07:10:00Z', driver_number: 1, position: 1 },
    { date: '2026-10-04T07:10:00Z', driver_number: 4, position: 2 },
    { date: '2026-10-04T07:50:00Z', driver_number: 4, position: 1 },
    { date: '2026-10-04T07:50:00Z', driver_number: 1, position: 2 },
  ]);
  mockIntervals.mockResolvedValue([
    { date: '2026-10-04T07:49:00Z', driver_number: 1, gap_to_leader: 0.5, interval: 0.5 },
    { date: '2026-10-04T07:50:00Z', driver_number: 1, gap_to_leader: 1.4256, interval: 1.4256 },
    { date: '2026-10-04T07:50:00Z', driver_number: 4, gap_to_leader: null, interval: null },
  ]);
}

async function loadRoute() {
  vi.resetModules();
  return import('@/app/api/live-timing/route');
}

const request = () => new NextRequest('http://localhost/api/live-timing');

describe('GET /api/live-timing — session timeline simulation', () => {
  beforeEach(() => {
    vi.useFakeTimers({ toFake: ['Date', 'setTimeout', 'clearTimeout'] });
    vi.setSystemTime(SESSION_START + 50 * MIN);
    mockSession.mockReset();
    mockDrivers.mockReset();
    mockPositions.mockReset();
    mockIntervals.mockReset();
    mockRateLimit.mockReset();
    mockRateLimit.mockResolvedValue({ success: true, retryAfter: 0 });
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it('serves the live classification: latest row per driver, sorted, gaps formatted', async () => {
    seedLiveData();
    const { GET } = await loadRoute();
    const res = await GET(request());
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.live).toBe(true);
    expect(body.sessionName).toBe('Race');
    expect(body.circuitShortName).toBe('Sepang');
    expect(body.rows.map((r: { code: string; position: number }) => [r.position, r.code])).toEqual([
      [1, 'NOR'],
      [2, 'VER'],
    ]);
    expect(body.rows[0]).toMatchObject({ gapToLeader: null, interval: null, teamColour: '#FF8000' });
    expect(body.rows[1]).toMatchObject({ gapToLeader: '+1.426', interval: '+1.426', teamColour: '#3671C6' });
  });

  it('sets the shared edge-cache header (5s fresh, 15s stale-while-revalidate)', async () => {
    seedLiveData();
    const { GET } = await loadRoute();
    const res = await GET(request());
    expect(res.headers.get('Cache-Control')).toBe('public, s-maxage=5, stale-while-revalidate=15');
  });

  it('stays live through the 10-minute post-finish grace window, then goes idle without hitting OpenF1 again', async () => {
    seedLiveData();
    vi.setSystemTime(SESSION_END + 9 * MIN);
    const grace = await (await loadRoute()).GET(request());
    expect((await grace.json()).live).toBe(true);

    vi.setSystemTime(SESSION_END + 11 * MIN);
    mockDrivers.mockClear();
    mockPositions.mockClear();
    mockIntervals.mockClear();
    const idle = await (await loadRoute()).GET(request());
    const body = await idle.json();
    expect(body).toEqual({ live: false, sessionName: 'Race', circuitShortName: 'Sepang', rows: [] });
    expect(mockDrivers).not.toHaveBeenCalled();
    expect(mockPositions).not.toHaveBeenCalled();
    expect(mockIntervals).not.toHaveBeenCalled();
  });

  it('is not live before the session starts, nor when OpenF1 has no session at all', async () => {
    seedLiveData();
    vi.setSystemTime(SESSION_START - MIN);
    const before = await (await loadRoute()).GET(request());
    expect((await before.json()).live).toBe(false);

    mockSession.mockResolvedValue(null);
    const none = await (await loadRoute()).GET(request());
    expect(await none.json()).toEqual({ live: false, sessionName: null, circuitShortName: null, rows: [] });
  });

  it('collapses concurrent viewers into ONE upstream round (stampede guard)', async () => {
    seedLiveData();
    const { GET } = await loadRoute();
    const responses = await Promise.all(Array.from({ length: 25 }, () => GET(request())));

    expect(responses.every((r) => r.status === 200)).toBe(true);
    expect(mockSession).toHaveBeenCalledTimes(1);
    expect(mockDrivers).toHaveBeenCalledTimes(1);
    expect(mockPositions).toHaveBeenCalledTimes(1);
    expect(mockIntervals).toHaveBeenCalledTimes(1);
  });

  it('memoises for the 5s TTL, then refreshes', async () => {
    seedLiveData();
    const { GET } = await loadRoute();
    await GET(request());
    vi.setSystemTime(SESSION_START + 50 * MIN + 4_000);
    await GET(request());
    expect(mockSession).toHaveBeenCalledTimes(1);

    vi.setSystemTime(SESSION_START + 50 * MIN + 6_000);
    await GET(request());
    expect(mockSession).toHaveBeenCalledTimes(2);
  });

  it('serves the last good result when OpenF1 starts failing', async () => {
    seedLiveData();
    const { GET } = await loadRoute();
    const first = await (await GET(request())).json();

    vi.setSystemTime(SESSION_START + 50 * MIN + 6_000);
    mockSession.mockRejectedValue(new Error('OpenF1 503'));
    const res = await GET(request());

    expect(res.status).toBe(200);
    expect(await res.json()).toEqual(first);
  });

  it('serves the last good result when OpenF1 hangs past the 8s hard ceiling', async () => {
    seedLiveData();
    const { GET } = await loadRoute();
    const first = await (await GET(request())).json();

    vi.setSystemTime(SESSION_START + 50 * MIN + 6_000);
    mockSession.mockReturnValue(new Promise(() => {})); // never settles
    const pending = GET(request());
    await vi.advanceTimersByTimeAsync(8_000);
    const res = await pending;

    expect(res.status).toBe(200);
    expect(await res.json()).toEqual(first);
  });

  it('answers 502 with a generic body (no upstream detail) when there is nothing cached', async () => {
    mockSession.mockRejectedValue(new Error('secret upstream detail'));
    const { GET } = await loadRoute();
    const res = await GET(request());

    expect(res.status).toBe(502);
    expect(await res.json()).toEqual({ error: 'Live timing unavailable' });
  });

  it('rate-limits with 429 + Retry-After before any upstream work', async () => {
    mockRateLimit.mockResolvedValue({ success: false, retryAfter: 17 });
    const { GET } = await loadRoute();
    const res = await GET(request());

    expect(res.status).toBe(429);
    expect(res.headers.get('Retry-After')).toBe('17');
    expect(mockSession).not.toHaveBeenCalled();
  });
});
