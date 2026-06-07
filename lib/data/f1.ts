/**
 * F1 snapshot read layer — 3-tier fallback (Masterplan Karar E):
 *   1. Supabase `f1_snapshots` (DB — the single source of truth)
 *   2. build-time static JSON under public/data/f1 (if present)
 *   3. Jolpica proxy via /api/f1-season (last resort, live only)
 *
 * Current-season rows also pass a race-calendar staleness check: when the DB
 * cache is older than expected (post-quali / post-race), we bypass it and read
 * live Jolpica so standings/results stay fresh between cron runs.
 *
 * Historical data is always served from the DB (F1DB seed has written it);
 * Jolpica is never used for historical seasons. All reads are server-side (RSC).
 */

import { getSupabaseClient } from '@/lib/supabase';
import type { Json, SnapshotType } from '@/types/database';
import { logFallback, logSupabaseCall, timed } from '@/lib/data/logger';
import { fetchSiteJson } from '@/lib/data/siteUrl';
import { CURRENT_SEASON, type CalendarRace } from '@/lib/f1Calendar';
import {
  isCalendarSnapshotStale,
  isRoundSnapshotStale,
  isStandingsSnapshotStale,
} from '@/lib/f1/snapshotStaleness';
import { getRacesFromCalendar } from '@/lib/f1/mrdata';
import { readPublicJson } from '@/lib/data/fs';

/** Ergast/Jolpica envelope — kept as opaque Json; UI consumes the shape directly. */
export type MrData = { MRData?: Record<string, unknown> } & Record<string, unknown>;

/** Season-level snapshot types (round IS NULL). */
type SeasonSnapshotType = Extract<
  SnapshotType,
  'calendar' | 'standings_drivers' | 'standings_constructors'
>;

/** Map a season snapshot type to its Jolpica path suffix (proxy fallback). */
const SEASON_TYPE_TO_PROXY: Record<SeasonSnapshotType, string> = {
  calendar: '', // {year}.json
  standings_drivers: 'driverStandings',
  standings_constructors: 'constructorStandings',
};

/** Map a season snapshot type to its static-file name under public/data/f1/{year}/. */
const SEASON_TYPE_TO_STATIC: Record<SeasonSnapshotType, string> = {
  calendar: 'calendar.json',
  standings_drivers: 'driverStandings.json',
  standings_constructors: 'constructorStandings.json',
};

interface DbSnapshotRow {
  data: Json;
  fetched_at: string;
}

function hasMrData(json: unknown): json is MrData {
  return Boolean(json && typeof json === 'object' && 'MRData' in (json as object));
}

async function fetchDbSnapshotRow(
  season: number,
  type: SnapshotType,
  round: number | null,
): Promise<DbSnapshotRow | null> {
  try {
    const supabase = getSupabaseClient();
    let query = supabase
      .from('f1_snapshots')
      .select('data, fetched_at')
      .eq('season', season)
      .eq('type', type)
      .order('fetched_at', { ascending: false })
      .limit(1);

    if (round === null) {
      query = query.is('round', null);
    } else {
      query = query.eq('round', round);
    }

    const { result, durationMs } = await timed(async () => query.maybeSingle<DbSnapshotRow>());
    logSupabaseCall(
      'f1_snapshots',
      `season=${season} round=${round ?? 'null'} type=${type}`,
      durationMs,
    );

    if (!result.error && result.data?.data && hasMrData(result.data.data)) {
      return result.data;
    }
  } catch (err) {
    logFallback('supabase f1_snapshots', 'static', (err as Error).message);
  }
  return null;
}

/** Calendar races from DB only — breaks staleness recursion. */
async function fetchCalendarRacesFromDb(season: number): Promise<CalendarRace[]> {
  const row = await fetchDbSnapshotRow(season, 'calendar', null);
  if (!row) return [];
  return getRacesFromCalendar(row.data as MrData);
}

/** Races for staleness checks: DB calendar → live proxy. */
async function getRacesForStaleness(season: number): Promise<CalendarRace[]> {
  const fromDb = await fetchCalendarRacesFromDb(season);
  if (fromDb.length > 0) return fromDb;

  const proxied = await fetchSiteJson<MrData>(`/api/f1-season?path=${season}`);
  return getRacesFromCalendar(proxied);
}

function isSeasonSnapshotStale(
  type: SeasonSnapshotType,
  fetchedAt: string,
  races: CalendarRace[],
): boolean {
  if (type === 'calendar') return isCalendarSnapshotStale(fetchedAt, races);
  return isStandingsSnapshotStale(fetchedAt, races);
}

async function fetchLiveSeasonSnapshot(
  season: number,
  type: SeasonSnapshotType,
  reason: string,
): Promise<MrData | null> {
  logFallback('supabase f1_snapshots (stale)', '/api/f1-season (proxy)', reason);
  const suffix = SEASON_TYPE_TO_PROXY[type];
  const path = suffix ? `/api/f1-season?path=${season}/${suffix}` : `/api/f1-season?path=${season}`;
  const proxied = await fetchSiteJson<MrData>(path);
  return hasMrData(proxied) ? proxied : null;
}

async function fetchLiveRoundSnapshot(
  season: number,
  round: number,
  type: Extract<SnapshotType, 'results' | 'qualifying' | 'sprint'>,
  reason: string,
): Promise<MrData | null> {
  logFallback('supabase f1_snapshots (stale)', '/api/f1-season (proxy)', reason);
  const proxied = await fetchSiteJson<MrData>(`/api/f1-season?path=${season}/${round}/${type}`);
  return hasMrData(proxied) ? proxied : null;
}

/**
 * Fetch a season-level snapshot (round IS NULL) by canonical type.
 * DB (staleness-aware) → static → Jolpica proxy.
 */
export async function fetchSeasonSnapshotTyped(
  season: number,
  type: SeasonSnapshotType,
): Promise<MrData | null> {
  const row = await fetchDbSnapshotRow(season, type, null);

  if (row && hasMrData(row.data)) {
    if (season >= CURRENT_SEASON) {
      const races = await getRacesForStaleness(season);
      if (isSeasonSnapshotStale(type, row.fetched_at, races)) {
        const live = await fetchLiveSeasonSnapshot(season, type, `${type} stale`);
        if (live) return live;
      }
    }
    return row.data as MrData;
  }

  // 2) static (build-time fallback)
  const staticJson = await readPublicJson<MrData>(
    `data/f1/${season}/${SEASON_TYPE_TO_STATIC[type]}`,
  );
  if (hasMrData(staticJson)) return staticJson;

  // 3) Jolpica proxy — live seasons only (historical must be in DB)
  if (season >= CURRENT_SEASON) {
    return fetchLiveSeasonSnapshot(season, type, 'db empty');
  }

  return null;
}

/**
 * Fetch a round-level snapshot (results / qualifying / sprint).
 * DB (staleness-aware) → static → Jolpica proxy (live only).
 */
export async function fetchRoundSnapshot(
  season: number,
  round: number,
  type: Extract<SnapshotType, 'results' | 'qualifying' | 'sprint'>,
): Promise<MrData | null> {
  const row = await fetchDbSnapshotRow(season, type, round);

  if (row && hasMrData(row.data)) {
    if (season >= CURRENT_SEASON) {
      const races = await getRacesForStaleness(season);
      if (isRoundSnapshotStale(type, round, row.fetched_at, races)) {
        const live = await fetchLiveRoundSnapshot(season, round, type, `${type} r${round} stale`);
        if (live) return live;
      }
    }
    return row.data as MrData;
  }

  // 2) static
  const staticJson = await readPublicJson<MrData>(
    `data/f1/${season}/rounds/${round}/${type}.json`,
  );
  if (hasMrData(staticJson)) return staticJson;

  // 3) Jolpica proxy — live only
  if (season >= CURRENT_SEASON) {
    return fetchLiveRoundSnapshot(season, round, type, 'db empty');
  }

  return null;
}

/** Convenience: current-season calendar races (used by getF1Context callers). */
export async function fetchCurrentCalendar(): Promise<MrData | null> {
  return fetchSeasonSnapshotTyped(CURRENT_SEASON, 'calendar');
}

export type { Json };
