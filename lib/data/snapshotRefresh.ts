/**
 * Background refresh for stale current-season snapshots (stale-while-revalidate).
 *
 * The read path (`lib/data/f1.ts`) serves a stale-but-recent DB row immediately and
 * calls `scheduleSnapshotRefresh` so the NEXT request finds a fresh row — a visitor
 * never waits on Jolpica. The refresh runs after the response (`after()`), reads
 * Jolpica directly, validates the payload with the same `has*` guards as the
 * sync-f1 cron and writes through the same `upsertF1Snapshot` path (`source='jolpica'`).
 *
 * Deliberately NOT refreshed here: driver/constructor standings. The sync-f1 cron
 * decides "new championship leader" push notifications by comparing the stored
 * leader with the freshly fetched one; refreshing standings from a page view would
 * overwrite the stored leader first and silence that notification. Standings stay
 * on the cron (hourly in race windows).
 *
 * Bounded cost: one in-flight/cooldown entry per snapshot per server instance
 * (COOLDOWN_MS), so a burst of viewers triggers one upstream call, not one each.
 */

import { after } from 'next/server';
import {
  fetchCalendar,
  fetchPitStops,
  fetchQualifying,
  fetchResults,
  fetchSprint,
  hasPitStops,
  hasQualifyingResults,
  hasRaces,
  hasResults,
  hasSprintResults,
  type MRData,
} from '@/lib/f1/sources/jolpica';
import { upsertF1Snapshot } from '@/lib/f1Ingest';
import type { Json, SnapshotType } from '@/types/database';

export type RefreshableSnapshotType = Extract<
  SnapshotType,
  'calendar' | 'results' | 'qualifying' | 'sprint' | 'pitstops'
>;

export interface RefreshTarget {
  season: number;
  type: RefreshableSnapshotType;
  /** null for the season calendar. */
  round: number | null;
}

/** Refresh each snapshot at most once per minute per server instance. */
export const REFRESH_COOLDOWN_MS = 60_000;

const lastScheduledAt = new Map<string, number>();

export function isRefreshable(type: SnapshotType): type is RefreshableSnapshotType {
  return (
    type === 'calendar' ||
    type === 'results' ||
    type === 'qualifying' ||
    type === 'sprint' ||
    type === 'pitstops'
  );
}

async function fetchFresh(target: RefreshTarget): Promise<MRData | null> {
  const { season, type, round } = target;
  if (type === 'calendar') {
    const data = await fetchCalendar(season);
    return hasRaces(data) ? data : null;
  }
  if (round === null) return null;
  if (type === 'results') {
    const data = await fetchResults(season, round);
    return hasResults(data) ? data : null;
  }
  if (type === 'qualifying') {
    const data = await fetchQualifying(season, round);
    return hasQualifyingResults(data) ? data : null;
  }
  if (type === 'sprint') {
    const data = await fetchSprint(season, round);
    return hasSprintResults(data) ? data : null;
  }
  const data = await fetchPitStops(season, round);
  return hasPitStops(data) ? data : null;
}

/** Fetch from Jolpica and persist. Returns true when a row was written. Never throws. */
export async function refreshSnapshot(target: RefreshTarget): Promise<boolean> {
  try {
    const data = await fetchFresh(target);
    if (!data) return false;
    await upsertF1Snapshot(target.season, target.round, target.type, data as unknown as Json, 'jolpica');
    return true;
  } catch (err) {
    console.warn(
      `[snapshot-refresh] ${target.season}/${target.round ?? 'season'} ${target.type}: ${
        err instanceof Error ? err.message : String(err)
      }`,
    );
    return false;
  }
}

/**
 * Schedule a refresh after the current response. No-ops during `next build`
 * (`after()` there would run at build time) and inside the per-snapshot cooldown.
 */
export function scheduleSnapshotRefresh(target: RefreshTarget, now: number = Date.now()): void {
  if (process.env.NEXT_PHASE === 'phase-production-build') return;
  const key = `${target.season}|${target.round ?? 'season'}|${target.type}`;
  if (now - (lastScheduledAt.get(key) ?? 0) < REFRESH_COOLDOWN_MS) return;
  lastScheduledAt.set(key, now);

  const job = () => refreshSnapshot(target).then(() => undefined);
  try {
    after(job);
  } catch {
    // Outside a request scope (scripts, tests): run it detached.
    void job();
  }
}

/** Test helper: forget cooldowns. */
export function resetRefreshCooldownsForTests(): void {
  lastScheduledAt.clear();
}
