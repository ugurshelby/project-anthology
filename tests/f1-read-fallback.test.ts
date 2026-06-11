/**
 * Read-layer fallback contract for lib/data/f1.ts (Council KRİTİK #4):
 * DB → static → live proxy, with the live tier reserved for the current
 * season, plus the staleness bypass and content-invalid guard.
 *
 * Modules are re-imported per test (vi.resetModules) because the staleness
 * calendar memo in f1.ts is module-scoped.
 */

import { beforeEach, describe, expect, it, vi } from 'vitest';
import { CURRENT_SEASON } from '@/lib/f1Calendar';
import type { Json } from '@/types/database';

const HISTORICAL = 2019;

// (season, type, round|null) → { data, fetched_at } | null
const mockDbRow = vi.fn<
  (season: unknown, type: unknown, round: unknown) => { data: Json; fetched_at: string } | null
>(() => null);
const mockFetchSiteJson = vi.fn<(path: string) => Promise<unknown>>(async () => null);
const mockReadPublicJson = vi.fn<(path: string) => Promise<unknown>>(async () => null);

vi.mock('@/lib/supabase', () => ({
  getSupabaseClient: () => ({
    from: () => {
      const filters: Record<string, unknown> = {};
      const builder = {
        select: () => builder,
        order: () => builder,
        limit: () => builder,
        eq: (col: string, val: unknown) => {
          filters[col] = val;
          return builder;
        },
        is: (col: string, val: unknown) => {
          filters[col] = val;
          return builder;
        },
        returns: async () => ({ data: [], error: null }),
        maybeSingle: async () => ({
          data: mockDbRow(filters.season, filters.type, filters.round ?? null),
          error: null,
        }),
      };
      return builder;
    },
  }),
}));

vi.mock('@/lib/data/siteUrl', () => ({
  getSiteUrl: () => 'http://test.local',
  fetchSiteJson: (path: string) => mockFetchSiteJson(path),
}));

vi.mock('@/lib/data/fs', () => ({
  readPublicJson: (path: string) => mockReadPublicJson(path),
}));

vi.mock('@/lib/data/logger', () => ({
  logFallback: () => {},
  logSupabaseCall: () => {},
  timed: async <T>(fn: () => Promise<T>) => ({ result: await fn(), durationMs: 0 }),
}));

async function loadF1() {
  vi.resetModules();
  return import('@/lib/data/f1');
}

function calendarMrData(raceName = 'Test GP', date = '2026-03-01'): Json {
  return {
    MRData: {
      RaceTable: {
        Races: [{ round: '1', raceName, date, time: '12:00:00Z' }],
      },
    },
  } as unknown as Json;
}

function isoDaysAgo(days: number): string {
  return new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();
}

beforeEach(() => {
  mockDbRow.mockReset().mockReturnValue(null);
  mockFetchSiteJson.mockReset().mockResolvedValue(null);
  mockReadPublicJson.mockReset().mockResolvedValue(null);
});

describe('fetchSeasonSnapshotTyped — tier order', () => {
  it('serves a fresh DB snapshot without touching static or proxy (historical)', async () => {
    const dbData = calendarMrData('Historical GP', '2019-03-17');
    mockDbRow.mockReturnValue({ data: dbData, fetched_at: isoDaysAgo(1) });

    const { fetchSeasonSnapshotTyped } = await loadF1();
    const result = await fetchSeasonSnapshotTyped(HISTORICAL, 'calendar');

    expect(result).toEqual(dbData);
    expect(mockReadPublicJson).not.toHaveBeenCalled();
    expect(mockFetchSiteJson).not.toHaveBeenCalled();
  });

  it('falls back to the static file when the DB is empty', async () => {
    const staticData = calendarMrData('Static GP', '2019-03-17');
    mockReadPublicJson.mockResolvedValue(staticData);

    const { fetchSeasonSnapshotTyped } = await loadF1();
    const result = await fetchSeasonSnapshotTyped(HISTORICAL, 'calendar');

    expect(result).toEqual(staticData);
    expect(mockReadPublicJson).toHaveBeenCalledWith(`data/f1/${HISTORICAL}/calendar.json`);
    expect(mockFetchSiteJson).not.toHaveBeenCalled();
  });

  it('never proxies live Jolpica for a historical season (archive integrity)', async () => {
    const { fetchSeasonSnapshotTyped } = await loadF1();
    const result = await fetchSeasonSnapshotTyped(HISTORICAL, 'calendar');

    expect(result).toBeNull();
    expect(mockFetchSiteJson).not.toHaveBeenCalled();
  });

  it('proxies live Jolpica for the current season when DB and static are empty', async () => {
    const liveData = calendarMrData('Live GP');
    mockFetchSiteJson.mockResolvedValue(liveData);

    const { fetchSeasonSnapshotTyped } = await loadF1();
    const result = await fetchSeasonSnapshotTyped(CURRENT_SEASON, 'calendar');

    expect(result).toEqual(liveData);
    expect(mockFetchSiteJson).toHaveBeenCalledWith(`/api/f1-season?path=${CURRENT_SEASON}`);
  });
});

describe('fetchSeasonSnapshotTyped — staleness and content guards', () => {
  it('bypasses a stale current-season DB calendar and serves live data', async () => {
    // 10-day-old snapshot off race weekend (> 7-day max age) → stale.
    mockDbRow.mockReturnValue({ data: calendarMrData(), fetched_at: isoDaysAgo(10) });
    const liveData = calendarMrData('Fresh GP');
    mockFetchSiteJson.mockResolvedValue(liveData);

    const { fetchSeasonSnapshotTyped } = await loadF1();
    const result = await fetchSeasonSnapshotTyped(CURRENT_SEASON, 'calendar');

    expect(result).toEqual(liveData);
  });

  it('keeps serving the DB row when the live bypass fails (stale > nothing)', async () => {
    const dbData = calendarMrData();
    mockDbRow.mockReturnValue({ data: dbData, fetched_at: isoDaysAgo(10) });
    mockFetchSiteJson.mockResolvedValue(null);

    const { fetchSeasonSnapshotTyped } = await loadF1();
    const result = await fetchSeasonSnapshotTyped(CURRENT_SEASON, 'calendar');

    expect(result).toEqual(dbData);
  });

  it('treats a placeholder calendar (blank raceNames) as invalid even when fresh', async () => {
    mockDbRow.mockReturnValue({
      data: calendarMrData(''),
      fetched_at: new Date().toISOString(),
    });
    const liveData = calendarMrData('Real GP');
    mockFetchSiteJson.mockResolvedValue(liveData);

    const { fetchSeasonSnapshotTyped } = await loadF1();
    const result = await fetchSeasonSnapshotTyped(CURRENT_SEASON, 'calendar');

    expect(result).toEqual(liveData);
  });
});

describe('fetchRoundSnapshot — tier order', () => {
  it('serves the DB snapshot first', async () => {
    const dbData = { MRData: { RaceTable: { Races: [{ round: '1', Results: [] }] } } } as unknown as Json;
    mockDbRow.mockImplementation((_s, type) =>
      type === 'results' ? { data: dbData, fetched_at: isoDaysAgo(1) } : null,
    );

    const { fetchRoundSnapshot } = await loadF1();
    const result = await fetchRoundSnapshot(HISTORICAL, 1, 'results');

    expect(result).toEqual(dbData);
    expect(mockFetchSiteJson).not.toHaveBeenCalled();
  });

  it('falls back to static, and never proxies for historical rounds', async () => {
    const staticData = calendarMrData('Static Round', '2019-03-17');
    mockReadPublicJson.mockResolvedValue(staticData);

    const { fetchRoundSnapshot } = await loadF1();
    const result = await fetchRoundSnapshot(HISTORICAL, 1, 'results');

    expect(result).toEqual(staticData);
    expect(mockReadPublicJson).toHaveBeenCalledWith(`data/f1/${HISTORICAL}/rounds/1/results.json`);
    expect(mockFetchSiteJson).not.toHaveBeenCalled();

    // Static empty too → null, still no proxy.
    mockReadPublicJson.mockResolvedValue(null);
    const empty = await fetchRoundSnapshot(HISTORICAL, 2, 'results');
    expect(empty).toBeNull();
    expect(mockFetchSiteJson).not.toHaveBeenCalled();
  });

  it('proxies live for a current-season round when DB and static are empty', async () => {
    const liveData = calendarMrData('Live Round');
    mockFetchSiteJson.mockResolvedValue(liveData);

    const { fetchRoundSnapshot } = await loadF1();
    const result = await fetchRoundSnapshot(CURRENT_SEASON, 3, 'qualifying');

    expect(result).toEqual(liveData);
    expect(mockFetchSiteJson).toHaveBeenCalledWith(
      `/api/f1-season?path=${CURRENT_SEASON}/3/qualifying`,
    );
  });
});
