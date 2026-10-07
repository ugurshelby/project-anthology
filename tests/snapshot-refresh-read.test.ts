/**
 * Stale-while-revalidate read path (master-plan 1.3): a stale-but-recent current-season
 * DB row is served immediately and a background refresh is scheduled; standings are
 * served stale without a refresh (the cron owns leader-change pushes); beyond the
 * serve-stale cap the read goes live; historical seasons never refresh.
 */

import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { Json } from '@/types/database';

const mockDbRow = vi.fn<(season: unknown, type: unknown, round: unknown) => { data: Json; fetched_at: string } | null>(() => null);
const mockFetchSiteJson = vi.fn<(path: string) => Promise<unknown>>(async () => null);
const mockSchedule = vi.fn();

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
vi.mock('@/lib/data/fs', () => ({ readPublicJson: async () => null }));
vi.mock('@/lib/data/logger', () => ({
  logFallback: () => {},
  logSupabaseCall: () => {},
  logSlowQuery: () => {},
  timed: async <T>(fn: () => Promise<T>) => ({ result: await fn(), durationMs: 0 }),
}));
vi.mock('@/lib/data/snapshotRefresh', async () => {
  const actual = await vi.importActual<typeof import('@/lib/data/snapshotRefresh')>('@/lib/data/snapshotRefresh');
  return { ...actual, scheduleSnapshotRefresh: (...a: unknown[]) => mockSchedule(...a) };
});

const H = 60 * 60 * 1000;
const isoHoursAgo = (h: number) => new Date(Date.now() - h * H).toISOString();
const dateOffset = (days: number) => new Date(Date.now() + days * 24 * H).toISOString().slice(0, 10);

/** One race `daysFromToday` away at 12:00Z — yesterday means results (+2.5h) and standings (+3h) are due. */
function calendarWithRace(daysFromToday: number): Json {
  return {
    MRData: {
      RaceTable: {
        Races: [{ round: '3', raceName: 'Test GP', date: dateOffset(daysFromToday), time: '12:00:00Z' }],
      },
    },
  } as unknown as Json;
}

const roundData = { MRData: { RaceTable: { Races: [{ round: '3', Results: [] }] } } } as unknown as Json;
const standingsData = {
  MRData: {
    StandingsTable: {
      StandingsLists: [{ DriverStandings: [{ position: '1', Driver: { driverId: 'x' }, Constructors: [{ name: 'T' }] }] }],
    },
  },
} as unknown as Json;

async function loadF1() {
  vi.resetModules();
  return import('@/lib/data/f1');
}

describe('read path — stale-while-revalidate', () => {
  beforeEach(() => {
    mockDbRow.mockReset().mockReturnValue(null);
    mockFetchSiteJson.mockReset().mockResolvedValue(null);
    mockSchedule.mockReset();
  });

  it('serves a stale round snapshot immediately and schedules a refresh (no live proxy call)', async () => {
    // Race was yesterday → results due; the stored row predates that window.
    mockDbRow.mockImplementation((_s, type) => {
      if (type === 'calendar') return { data: calendarWithRace(-1), fetched_at: isoHoursAgo(1) };
      if (type === 'results') return { data: roundData, fetched_at: isoHoursAgo(36) };
      return null;
    });
    const { fetchRoundSnapshot } = await loadF1();
    const { CURRENT_SEASON } = await import('@/lib/f1Calendar');

    const result = await fetchRoundSnapshot(CURRENT_SEASON, 3, 'results');

    expect(result).toEqual(roundData);
    expect(mockFetchSiteJson).not.toHaveBeenCalled();
    expect(mockSchedule).toHaveBeenCalledTimes(1);
    expect(mockSchedule).toHaveBeenCalledWith({ season: CURRENT_SEASON, type: 'results', round: 3 });
  });

  it('serves stale standings immediately but does NOT schedule a refresh (cron owns them)', async () => {
    mockDbRow.mockImplementation((_s, type) => {
      if (type === 'calendar') return { data: calendarWithRace(-1), fetched_at: isoHoursAgo(1) };
      if (type === 'standings_drivers') return { data: standingsData, fetched_at: isoHoursAgo(36) };
      return null;
    });
    const { fetchSeasonSnapshotTyped } = await loadF1();
    const { CURRENT_SEASON } = await import('@/lib/f1Calendar');

    const result = await fetchSeasonSnapshotTyped(CURRENT_SEASON, 'standings_drivers');

    expect(result).toEqual(standingsData);
    expect(mockFetchSiteJson).not.toHaveBeenCalled();
    expect(mockSchedule).not.toHaveBeenCalled();
  });

  it('serves a stale calendar during a race weekend and schedules a calendar refresh', async () => {
    const calendar = calendarWithRace(0);
    mockDbRow.mockReturnValue({ data: calendar, fetched_at: isoHoursAgo(10) }); // > 6h on a race weekend
    const { fetchSeasonSnapshotTyped } = await loadF1();
    const { CURRENT_SEASON } = await import('@/lib/f1Calendar');

    const result = await fetchSeasonSnapshotTyped(CURRENT_SEASON, 'calendar');

    expect(result).toEqual(calendar);
    expect(mockFetchSiteJson).not.toHaveBeenCalled();
    expect(mockSchedule).toHaveBeenCalledWith({ season: CURRENT_SEASON, type: 'calendar', round: null });
  });

  it('goes live (blocking) once the stale row exceeds the serve-stale cap', async () => {
    const live = { MRData: { RaceTable: { Races: [{ round: '3', Results: [{}] }] } } };
    mockFetchSiteJson.mockResolvedValue(live);
    mockDbRow.mockImplementation((_s, type) => {
      if (type === 'calendar') return { data: calendarWithRace(-5), fetched_at: isoHoursAgo(1) };
      // Fetched 6 days ago: always before the race (5 days ago, 12:00Z) whatever the time of day, and > 3-day cap.
      // (5 days ago failed between 14:30Z and midnight: the row then postdated the results due window.)
      if (type === 'results') return { data: roundData, fetched_at: isoHoursAgo(24 * 6) };
      return null;
    });
    const { fetchRoundSnapshot } = await loadF1();
    const { CURRENT_SEASON } = await import('@/lib/f1Calendar');

    const result = await fetchRoundSnapshot(CURRENT_SEASON, 3, 'results');

    expect(result).toEqual(live);
    expect(mockSchedule).not.toHaveBeenCalled();
  });

  it('never schedules a refresh for a historical season', async () => {
    mockDbRow.mockReturnValue({ data: roundData, fetched_at: isoHoursAgo(24 * 400) });
    const { fetchRoundSnapshot } = await loadF1();

    const result = await fetchRoundSnapshot(2019, 3, 'results');

    expect(result).toEqual(roundData);
    expect(mockSchedule).not.toHaveBeenCalled();
    expect(mockFetchSiteJson).not.toHaveBeenCalled();
  });
});
