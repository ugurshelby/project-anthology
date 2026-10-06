/**
 * Stale-while-revalidate refresh job (master-plan 1.3): reads Jolpica, validates, and
 * writes through the shared upsert path; cooldown, build-time and standings guards.
 * The read-path wiring is covered in snapshot-refresh-read.test.ts.
 */

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

// ── snapshotRefresh unit tests ────────────────────────────────────────────

const mockAfter = vi.fn<(fn: () => unknown) => void>();
const mockUpsert = vi.fn();
const mockFetchCalendar = vi.fn();
const mockFetchResults = vi.fn();
const mockHasRaces = vi.fn();
const mockHasResults = vi.fn();

vi.mock('next/server', () => ({ after: (fn: () => unknown) => mockAfter(fn) }));
vi.mock('@/lib/f1Ingest', () => ({ upsertF1Snapshot: (...a: unknown[]) => mockUpsert(...a) }));
vi.mock('@/lib/f1/sources/jolpica', () => ({
  fetchCalendar: (...a: unknown[]) => mockFetchCalendar(...a),
  fetchResults: (...a: unknown[]) => mockFetchResults(...a),
  fetchQualifying: async () => ({}),
  fetchSprint: async () => ({}),
  fetchPitStops: async () => ({}),
  hasRaces: (...a: unknown[]) => mockHasRaces(...a),
  hasResults: (...a: unknown[]) => mockHasResults(...a),
  hasQualifyingResults: () => true,
  hasSprintResults: () => true,
  hasPitStops: () => true,
}));

async function loadRefresh() {
  vi.resetModules();
  return import('@/lib/data/snapshotRefresh');
}

describe('snapshotRefresh', () => {
  beforeEach(() => {
    for (const m of [mockAfter, mockUpsert, mockFetchCalendar, mockFetchResults, mockHasRaces, mockHasResults]) m.mockReset();
    mockAfter.mockImplementation((fn) => void fn());
    mockUpsert.mockResolvedValue(undefined);
    mockFetchCalendar.mockResolvedValue({ MRData: { cal: true } });
    mockFetchResults.mockResolvedValue({ MRData: { results: true } });
    mockHasRaces.mockReturnValue(true);
    mockHasResults.mockReturnValue(true);
    vi.spyOn(console, 'warn').mockImplementation(() => {});
  });
  afterEach(() => {
    vi.restoreAllMocks();
    delete process.env.NEXT_PHASE;
  });

  it('refreshes a round snapshot after the response and persists it as jolpica', async () => {
    const { scheduleSnapshotRefresh } = await loadRefresh();
    scheduleSnapshotRefresh({ season: 2026, type: 'results', round: 7 });
    await vi.waitFor(() => expect(mockUpsert).toHaveBeenCalledTimes(1));

    expect(mockAfter).toHaveBeenCalledTimes(1);
    expect(mockFetchResults).toHaveBeenCalledWith(2026, 7);
    expect(mockUpsert).toHaveBeenCalledWith(2026, 7, 'results', { MRData: { results: true } }, 'jolpica');
  });

  it('refreshes the season calendar with a null round', async () => {
    const { scheduleSnapshotRefresh } = await loadRefresh();
    scheduleSnapshotRefresh({ season: 2026, type: 'calendar', round: null });
    await vi.waitFor(() => expect(mockUpsert).toHaveBeenCalledTimes(1));
    expect(mockUpsert).toHaveBeenCalledWith(2026, null, 'calendar', { MRData: { cal: true } }, 'jolpica');
  });

  it('collapses a burst into one refresh per snapshot per minute, then allows another', async () => {
    const { scheduleSnapshotRefresh, REFRESH_COOLDOWN_MS } = await loadRefresh();
    const t0 = 1_000_000;
    for (let i = 0; i < 25; i++) scheduleSnapshotRefresh({ season: 2026, type: 'results', round: 7 }, t0 + i);
    expect(mockAfter).toHaveBeenCalledTimes(1);

    // A different snapshot is independent.
    scheduleSnapshotRefresh({ season: 2026, type: 'results', round: 8 }, t0);
    expect(mockAfter).toHaveBeenCalledTimes(2);

    scheduleSnapshotRefresh({ season: 2026, type: 'results', round: 7 }, t0 + REFRESH_COOLDOWN_MS + 1);
    expect(mockAfter).toHaveBeenCalledTimes(3);
  });

  it('does not write when Jolpica returns an unusable payload', async () => {
    mockHasResults.mockReturnValue(false);
    const { refreshSnapshot } = await loadRefresh();
    expect(await refreshSnapshot({ season: 2026, type: 'results', round: 7 })).toBe(false);
    expect(mockUpsert).not.toHaveBeenCalled();
  });

  it('swallows upstream and DB failures (a refresh must never break a page)', async () => {
    const { refreshSnapshot } = await loadRefresh();
    mockFetchResults.mockRejectedValueOnce(new Error('Jolpica 503'));
    expect(await refreshSnapshot({ season: 2026, type: 'results', round: 7 })).toBe(false);

    mockUpsert.mockRejectedValueOnce(new Error('db down'));
    expect(await refreshSnapshot({ season: 2026, type: 'results', round: 7 })).toBe(false);
  });

  it('does nothing during `next build` (after() would run at build time)', async () => {
    process.env.NEXT_PHASE = 'phase-production-build';
    const { scheduleSnapshotRefresh } = await loadRefresh();
    scheduleSnapshotRefresh({ season: 2026, type: 'results', round: 7 });
    expect(mockAfter).not.toHaveBeenCalled();
  });

  it('falls back to a detached run outside a request scope', async () => {
    mockAfter.mockImplementation(() => {
      throw new Error('after() outside request scope');
    });
    const { scheduleSnapshotRefresh } = await loadRefresh();
    scheduleSnapshotRefresh({ season: 2026, type: 'results', round: 7 });
    await vi.waitFor(() => expect(mockUpsert).toHaveBeenCalledTimes(1));
  });

  it('never refreshes standings (the cron owns leader-change notifications)', async () => {
    const { isRefreshable } = await loadRefresh();
    expect(isRefreshable('standings_drivers')).toBe(false);
    expect(isRefreshable('standings_constructors')).toBe(false);
    expect(isRefreshable('results')).toBe(true);
    expect(isRefreshable('calendar')).toBe(true);
  });
});
