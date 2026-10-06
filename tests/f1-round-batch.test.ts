/**
 * fetchAllRound{Results,Sprints,Qualifying}: one batch DB query per type, and
 * the per-round fallback chain only where it is allowed.
 *
 * Regression: historical F1DB calendars have no `Sprint` slot, so sprint rows
 * were never read for past seasons and the season progression chart came out
 * ~30 points short of the official standings (2025: NOR 394 vs 423).
 */

import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { CalendarRace } from '@/lib/f1Calendar';
import type { Json } from '@/types/database';

const HISTORICAL = 2019;

const mockBatch = vi.fn<(type: string, rounds: number[]) => Array<{ round: number; data: Json; fetched_at: string }>>(
  () => [],
);
const mockSingle = vi.fn<(type: unknown, round: unknown) => { data: Json; fetched_at: string } | null>(() => null);

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
        is: () => builder,
        in: (col: string, val: unknown) => {
          filters[col] = val;
          return builder;
        },
        returns: async () => ({ data: mockBatch(String(filters.type), filters.round as number[]), error: null }),
        maybeSingle: async () => ({ data: mockSingle(filters.type, filters.round), error: null }),
      };
      return builder;
    },
  }),
}));

vi.mock('@/lib/data/siteUrl', () => ({ getSiteUrl: () => 'http://test.local', fetchSiteJson: async () => null }));
vi.mock('@/lib/data/fs', () => ({ readPublicJson: async () => null }));
vi.mock('@/lib/data/logger', () => ({
  logFallback: () => {},
  logSupabaseCall: () => {},
  logSlowQuery: () => {},
  timed: async <T>(fn: () => Promise<T>) => ({ result: await fn(), durationMs: 0 }),
}));

const mrData = (round: number): Json =>
  ({ MRData: { RaceTable: { Races: [{ round: String(round) }] } } }) as unknown as Json;

/** Three finished rounds; only round 2 advertises a Sprint slot. */
function races(withSprintSlot: boolean): CalendarRace[] {
  return [1, 2, 3].map((round) => ({
    round: String(round),
    date: `${HISTORICAL}-0${round}-10`,
    time: '12:00:00Z',
    ...(withSprintSlot && round === 2 ? { Sprint: { date: `${HISTORICAL}-02-09`, time: '10:00:00Z' } } : {}),
  }));
}

async function loadF1() {
  vi.resetModules();
  return import('@/lib/data/f1');
}

beforeEach(() => {
  mockBatch.mockReset().mockReturnValue([]);
  mockSingle.mockReset().mockReturnValue(null);
});

describe('fetchAllRoundSprints', () => {
  it('reads sprint rows for every finished round even when the calendar has no Sprint slot', async () => {
    mockBatch.mockImplementation((type) =>
      type === 'sprint' ? [{ round: 2, data: mrData(2), fetched_at: new Date().toISOString() }] : [],
    );
    const { fetchAllRoundSprints } = await loadF1();
    const out = await fetchAllRoundSprints(HISTORICAL, races(false));

    expect(out.map((s) => s.round)).toEqual([2]);
    expect(mockBatch).toHaveBeenCalledTimes(1);
    expect(mockBatch).toHaveBeenCalledWith('sprint', [1, 2, 3]);
  });

  it('does not run the per-round fallback for rounds without a Sprint slot', async () => {
    const { fetchAllRoundSprints } = await loadF1();
    const out = await fetchAllRoundSprints(HISTORICAL, races(false));

    expect(out).toEqual([]);
    expect(mockSingle).not.toHaveBeenCalled();
  });

  it('runs the per-round fallback only for the round that has a Sprint slot', async () => {
    const { fetchAllRoundSprints } = await loadF1();
    await fetchAllRoundSprints(HISTORICAL, races(true));

    expect(mockSingle).toHaveBeenCalledTimes(1);
    expect(mockSingle).toHaveBeenCalledWith('sprint', 2);
  });
});

describe('fetchAllRoundResults / fetchAllRoundQualifying', () => {
  it('keep the per-round fallback for every finished round missing from the batch', async () => {
    const { fetchAllRoundResults, fetchAllRoundQualifying } = await loadF1();
    await fetchAllRoundResults(HISTORICAL, races(false));
    expect(mockSingle).toHaveBeenCalledTimes(3);

    mockSingle.mockClear();
    await fetchAllRoundQualifying(HISTORICAL, races(false));
    expect(mockSingle).toHaveBeenCalledTimes(3);
    expect(mockSingle).toHaveBeenCalledWith('qualifying', 1);
  });

  it('use one batch query per type and return rows ordered by round', async () => {
    mockBatch.mockImplementation((type) =>
      type === 'results'
        ? [3, 1, 2].map((round) => ({ round, data: mrData(round), fetched_at: new Date().toISOString() }))
        : [],
    );
    const { fetchAllRoundResults } = await loadF1();
    const out = await fetchAllRoundResults(HISTORICAL, races(false));

    expect(out.map((s) => s.round)).toEqual([1, 2, 3]);
    expect(mockBatch).toHaveBeenCalledTimes(1);
    expect(mockSingle).not.toHaveBeenCalled();
  });
});
