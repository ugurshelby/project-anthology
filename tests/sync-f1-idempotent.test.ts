/**
 * Master-plan 1.3 — idempotent ingest: a Jolpica snapshot fetched long enough
 * after its due window is final and the sync-f1 cron never pulls it again.
 *
 * Pure helpers first, then the route with every collaborator stubbed so the
 * assertions are about WHICH upstream fetches happen, nothing else.
 */

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { NextRequest } from 'next/server';
import {
  SNAPSHOT_SETTLE_AFTER_MS,
  isSnapshotSettled,
  latestStandingsDueMs,
} from '@/lib/f1/syncSchedule';
import type { CalendarRace } from '@/lib/f1Calendar';

const H = 60 * 60 * 1000;

// ── Pure helpers ────────────────────────────────────────────────────────────

describe('isSnapshotSettled', () => {
  const due = Date.parse('2026-03-15T17:30:00Z');

  it('is settled only once fetched ≥ SNAPSHOT_SETTLE_AFTER_MS after the due window', () => {
    expect(isSnapshotSettled(due + SNAPSHOT_SETTLE_AFTER_MS, due)).toBe(true);
    expect(isSnapshotSettled(due + SNAPSHOT_SETTLE_AFTER_MS - 1, due)).toBe(false);
    expect(isSnapshotSettled(due + H, due)).toBe(false);
  });

  it('is never settled without a fetch time or a due time', () => {
    expect(isSnapshotSettled(undefined, due)).toBe(false);
    expect(isSnapshotSettled(null, due)).toBe(false);
    expect(isSnapshotSettled(due + 48 * H, null)).toBe(false);
  });

  it('un-settles automatically when a postponement pushes the due time later', () => {
    const fetchedAt = due + 30 * H;
    expect(isSnapshotSettled(fetchedAt, due)).toBe(true);
    expect(isSnapshotSettled(fetchedAt, due + 7 * 24 * H)).toBe(false);
  });
});

describe('latestStandingsDueMs', () => {
  const races: CalendarRace[] = [
    { round: '1', date: '2026-03-15', time: '15:00:00Z' },
    { round: '2', date: '2026-03-29', time: '15:00:00Z' },
    { round: '3', date: '2026-04-12', time: '15:00:00Z' },
  ];

  it('returns the most recent standings window that has already passed', () => {
    const now = new Date('2026-04-01T00:00:00Z');
    expect(latestStandingsDueMs(races, now)).toBe(Date.parse('2026-03-29T18:00:00Z'));
  });

  it('is null before the first race window', () => {
    expect(latestStandingsDueMs(races, new Date('2026-03-01T00:00:00Z'))).toBeNull();
  });
});

// ── Route ───────────────────────────────────────────────────────────────────

const mockFetchCalendar = vi.fn();
const mockFetchResults = vi.fn();
const mockFetchQualifying = vi.fn();
const mockFetchSprint = vi.fn();
const mockFetchPitStops = vi.fn();
const mockFetchDriverStandings = vi.fn();
const mockFetchConstructorStandings = vi.fn();
const mockIngestSeason = vi.fn();
const mockIngestRound = vi.fn();
const mockLoadFetchTimes = vi.fn();

vi.mock('@/lib/cronAuth', () => ({
  isCronAuthorized: () => true,
  isCronTriggerAllowed: async () => true,
}));

vi.mock('@/lib/f1/sources/jolpica', () => ({
  fetchCalendar: (...a: unknown[]) => mockFetchCalendar(...a),
  fetchResults: (...a: unknown[]) => mockFetchResults(...a),
  fetchQualifying: (...a: unknown[]) => mockFetchQualifying(...a),
  fetchSprint: (...a: unknown[]) => mockFetchSprint(...a),
  fetchPitStops: (...a: unknown[]) => mockFetchPitStops(...a),
  fetchDriverStandings: (...a: unknown[]) => mockFetchDriverStandings(...a),
  fetchConstructorStandings: (...a: unknown[]) => mockFetchConstructorStandings(...a),
  hasRaces: () => true,
  hasDriverStandings: () => true,
  hasConstructorStandings: () => true,
  hasResults: () => true,
  hasQualifyingResults: () => true,
  hasSprintResults: () => true,
  hasPitStops: () => true,
}));

vi.mock('@/lib/f1Ingest', () => ({
  ingestSeasonSnapshot: (...a: unknown[]) => mockIngestSeason(...a),
  ingestRoundSnapshot: (...a: unknown[]) => mockIngestRound(...a),
  loadSnapshotFetchTimes: (...a: unknown[]) => mockLoadFetchTimes(...a),
  snapshotKey: (round: number | null, type: string) => `${round ?? 'season'}|${type}`,
}));

/** Permissive chainable Supabase stub: every call returns the builder, awaiting it yields no rows. */
vi.mock('@/lib/supabase', () => {
  const builder: unknown = new Proxy(function () {}, {
    get: (_t, prop) =>
      prop === 'then'
        ? (resolve: (v: unknown) => void) => resolve({ data: [], error: null })
        : builder,
    apply: () => builder,
  });
  return { getSupabaseAdmin: () => ({ from: () => builder }) };
});

vi.mock('@/lib/data/circuits', () => ({
  fetchLiveCircuitWeather: async () => null,
  circuitLocationFromCalendar: () => null,
  fetchTimeZoneForCoords: async () => null,
}));
vi.mock('@/data/circuits/facts', () => ({ getCircuitFacts: () => undefined }));
vi.mock('@/lib/push/sendExpoPush', () => ({ sendExpoPushNotifications: async () => {} }));

const CALENDAR: CalendarRace[] = [
  {
    round: '1',
    raceName: 'Alpha GP',
    date: '2026-03-15',
    time: '15:00:00Z',
    Qualifying: { date: '2026-03-14', time: '15:00:00Z' },
    Circuit: { circuitId: 'alpha', circuitName: 'Alpha' },
  },
  {
    round: '2',
    raceName: 'Beta GP',
    date: '2026-03-29',
    time: '15:00:00Z',
    Qualifying: { date: '2026-03-28', time: '15:00:00Z' },
    Sprint: { date: '2026-03-28', time: '11:00:00Z' },
    Circuit: { circuitId: 'beta', circuitName: 'Beta' },
  },
];

/** After both weekends are over and every 24h settle window has elapsed. */
const NOW = '2026-04-05T12:00:00Z';
const SETTLED_AT = Date.parse('2026-04-01T00:00:00Z');

function allSettled(): Map<string, number> {
  const m = new Map<string, number>();
  for (const round of [1, 2]) {
    for (const type of ['qualifying', 'results', 'pitstops']) m.set(`${round}|${type}`, SETTLED_AT);
  }
  m.set('2|sprint', SETTLED_AT);
  m.set('season|standings_drivers', SETTLED_AT);
  m.set('season|standings_constructors', SETTLED_AT);
  return m;
}

async function runSync(query = 'scope=season') {
  vi.resetModules();
  const { GET } = await import('@/app/api/cron/sync-f1/route');
  const res = await GET(new NextRequest(`http://localhost/api/cron/sync-f1?${query}`));
  return { res, body: await res.json() };
}

describe('GET /api/cron/sync-f1 — settled snapshots are not re-fetched', () => {
  beforeEach(() => {
    vi.useFakeTimers({ toFake: ['Date'] });
    vi.setSystemTime(new Date(NOW));
    for (const m of [
      mockFetchResults, mockFetchQualifying, mockFetchSprint, mockFetchPitStops,
      mockFetchDriverStandings, mockFetchConstructorStandings, mockIngestSeason, mockIngestRound,
    ]) {
      m.mockReset();
      m.mockResolvedValue({});
    }
    mockFetchCalendar.mockReset();
    mockFetchCalendar.mockResolvedValue({ MRData: { RaceTable: { Races: CALENDAR } } });
    mockLoadFetchTimes.mockReset();
    mockLoadFetchTimes.mockResolvedValue(new Map());
    vi.spyOn(console, 'warn').mockImplementation(() => {});
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it('baseline: with nothing ingested yet, every due session is fetched', async () => {
    const { body } = await runSync();

    expect(mockFetchQualifying).toHaveBeenCalledTimes(2);
    expect(mockFetchSprint).toHaveBeenCalledTimes(1);
    expect(mockFetchResults).toHaveBeenCalledTimes(2);
    expect(mockFetchPitStops).toHaveBeenCalledTimes(2);
    expect(mockFetchDriverStandings).toHaveBeenCalledTimes(1);
    expect(mockFetchConstructorStandings).toHaveBeenCalledTimes(1);
    expect(body.settled).toBe(0);
  });

  it('when everything is settled, only the calendar is refreshed — zero session fetches', async () => {
    mockLoadFetchTimes.mockResolvedValue(allSettled());
    const { res, body } = await runSync();

    expect(res.status).toBe(200);
    expect(mockFetchQualifying).not.toHaveBeenCalled();
    expect(mockFetchSprint).not.toHaveBeenCalled();
    expect(mockFetchResults).not.toHaveBeenCalled();
    expect(mockFetchPitStops).not.toHaveBeenCalled();
    expect(mockFetchDriverStandings).not.toHaveBeenCalled();
    expect(mockFetchConstructorStandings).not.toHaveBeenCalled();
    expect(mockIngestRound).not.toHaveBeenCalled();
    expect(mockIngestSeason).toHaveBeenCalledTimes(1); // calendar only
    expect(mockIngestSeason.mock.calls[0][1]).toBe('calendar');
    expect(body.settled).toBe(3); // 2 rounds + standings
  });

  it('keeps fetching pit stops when only results are settled (pit stops publish later)', async () => {
    const times = allSettled();
    times.delete('1|pitstops');
    mockLoadFetchTimes.mockResolvedValue(times);
    await runSync();

    expect(mockFetchResults).not.toHaveBeenCalled();
    expect(mockFetchPitStops).toHaveBeenCalledTimes(1);
    expect(mockFetchPitStops).toHaveBeenCalledWith(2026, 1);
  });

  it('re-fetches a snapshot that was fetched too soon after its window (corrections may follow)', async () => {
    const times = allSettled();
    // R2 results were last pulled 2h after the 17:30Z due time → still inside the settle window.
    times.set('2|results', Date.parse('2026-03-29T19:30:00Z'));
    mockLoadFetchTimes.mockResolvedValue(times);
    await runSync();

    expect(mockFetchResults).toHaveBeenCalledTimes(1);
    expect(mockFetchResults).toHaveBeenCalledWith(2026, 2);
    expect(mockFetchQualifying).not.toHaveBeenCalled();
  });

  it('?force=1 ignores the settled index and re-fetches everything in scope', async () => {
    mockLoadFetchTimes.mockResolvedValue(allSettled());
    const { body } = await runSync('scope=season&force=1');

    expect(mockLoadFetchTimes).not.toHaveBeenCalled();
    expect(mockFetchResults).toHaveBeenCalledTimes(2);
    expect(mockFetchQualifying).toHaveBeenCalledTimes(2);
    expect(mockFetchDriverStandings).toHaveBeenCalledTimes(1);
    expect(body.settled).toBe(0);
  });

  it('a postponed race is no longer settled and is fetched again', async () => {
    mockLoadFetchTimes.mockResolvedValue(allSettled());
    // R2 moved to 2026-04-04 (race + qualifying shifted); its old fetches predate the new due times.
    const postponed = CALENDAR.map((r) =>
      r.round === '2'
        ? {
            ...r,
            date: '2026-04-04',
            Qualifying: { date: '2026-04-03', time: '15:00:00Z' },
            Sprint: { date: '2026-04-03', time: '11:00:00Z' },
          }
        : r,
    );
    mockFetchCalendar.mockResolvedValue({ MRData: { RaceTable: { Races: postponed } } });
    await runSync();

    expect(mockFetchResults).toHaveBeenCalledTimes(1);
    expect(mockFetchResults).toHaveBeenCalledWith(2026, 2);
    expect(mockFetchSprint).toHaveBeenCalledTimes(1);
    expect(mockFetchQualifying).toHaveBeenCalledTimes(1);
  });
});
