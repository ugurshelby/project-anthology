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
import {
  CURRENT_SEASON,
  F1_SEASON_MIN,
  getLastFinishedRace,
  isRaceDone,
  type CalendarRace,
} from '@/lib/f1Calendar';
import {
  isCalendarSnapshotStale,
  isRoundSnapshotStale,
  isStandingsSnapshotStale,
} from '@/lib/f1/snapshotStaleness';
import {
  getConstructorSeasonRecords,
  getConstructorStandings,
  getDriverSeasonRecords,
  getDriverStandings,
  getPerDriverRoundStats,
  type DriverRoundStats,
  getLastRaceResult,
  getQualifyingPole,
  getRaceWinner,
  getRacesFromCalendar,
  type ConstructorSeasonRecord,
  type ConstructorStandingRow,
  type DriverSeasonRecord,
  type DriverStandingRow,
  type LastRaceRecap,
  type PoleInfo,
} from '@/lib/f1/mrdata';
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

export interface OnThisDayEntry {
  season: number;
  raceName: string;
  winnerName: string;
  winnerConstructor: string;
}

/** Races on this calendar day (MM-DD) across all seasons with results snapshots. */
export async function getOnThisDay(): Promise<OnThisDayEntry[]> {
  const now = new Date();
  const todayMd = `${String(now.getUTCMonth() + 1).padStart(2, '0')}-${String(now.getUTCDate()).padStart(2, '0')}`;

  try {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase
      .from('f1_snapshots')
      .select('season, data')
      .eq('type', 'results')
      .returns<Array<{ season: number; data: Json }>>();

    if (error || !data?.length) return [];

    const entries: OnThisDayEntry[] = [];
    for (const row of data) {
      if (!hasMrData(row.data)) continue;
      const race = (
        row.data as MrData
      ).MRData?.RaceTable as { Races?: Array<{ date?: string; raceName?: string }> } | undefined;
      const first = race?.Races?.[0];
      if (!first?.date || first.date.slice(5) !== todayMd) continue;

      const winner = getRaceWinner(row.data as MrData);
      if (!winner) continue;

      entries.push({
        season: row.season,
        raceName: first.raceName ?? 'Grand Prix',
        winnerName: winner.driverName,
        winnerConstructor: winner.constructorName,
      });
    }

    return entries.sort((a, b) => b.season - a.season);
  } catch (err) {
    logFallback('getOnThisDay', 'empty', (err as Error).message);
    return [];
  }
}

export interface RoundResultSnapshot {
  round: number;
  data: MrData;
}

/** Parallel fetch of `results` snapshots for every finished round on the calendar. */
export async function fetchAllRoundResults(
  season: number,
  races: CalendarRace[],
): Promise<RoundResultSnapshot[]> {
  const finished = races.filter((r) => isRaceDone(r));
  const snapshots = await Promise.all(
    finished.map(async (race) => {
      const round = Number(race.round);
      if (!Number.isFinite(round)) return null;
      const data = await fetchRoundSnapshot(season, round, 'results');
      return data ? { round, data } : null;
    }),
  );
  return snapshots.filter((s): s is RoundResultSnapshot => s !== null);
}

export interface SeasonData {
  year: number;
  standings: DriverStandingRow[];
  constructors: ConstructorStandingRow[];
  races: CalendarRace[];
  recap: LastRaceRecap | null;
  pole: PoleInfo | null;
  driverRecords: DriverSeasonRecord[];
  constructorRecords: ConstructorSeasonRecord[];
  /** Race card key (`round` or `raceName`) closest to today for calendar centering. */
  nearestRaceKey: string | null;
  /** Per-driver wins/podiums from finished rounds (keyed by driver name). */
  driverStats: Record<string, DriverRoundStats>;
}

function nearestRaceKeyFromCalendar(races: CalendarRace[], nowMs: number): string | null {
  let key: string | null = null;
  let nearestDist = Infinity;
  for (const race of races) {
    const ms = race.date ? Date.parse(`${race.date}T00:00:00Z`) : NaN;
    if (!Number.isFinite(ms)) continue;
    const dist = Math.abs(ms - nowMs);
    if (dist < nearestDist) {
      nearestDist = dist;
      key = String(race.round ?? race.raceName);
    }
  }
  return key;
}

/** Full season bundle for the archive explorer and API route. */
export async function getSeasonData(year: number): Promise<SeasonData> {
  const [calendarData, driverData, constructorData] = await Promise.all([
    fetchSeasonSnapshotTyped(year, 'calendar'),
    fetchSeasonSnapshotTyped(year, 'standings_drivers'),
    fetchSeasonSnapshotTyped(year, 'standings_constructors'),
  ]);

  const races = getRacesFromCalendar(calendarData);
  const standings = getDriverStandings(driverData);
  const constructors = getConstructorStandings(constructorData);

  const lastRace = getLastFinishedRace(races);
  const lastRound = lastRace?.round != null ? Number(lastRace.round) : null;

  const [resultsData, qualiData, allRoundResults] = await Promise.all([
    lastRound != null
      ? fetchRoundSnapshot(year, lastRound, 'results')
      : Promise.resolve(null),
    lastRound != null
      ? fetchRoundSnapshot(year, lastRound, 'qualifying')
      : Promise.resolve(null),
    fetchAllRoundResults(year, races),
  ]);

  const recap = getLastRaceResult(resultsData);
  const pole = getQualifyingPole(qualiData);
  const roundData = allRoundResults.map((r) => r.data);

  return {
    year,
    standings,
    constructors,
    races,
    recap,
    pole,
    driverRecords: getDriverSeasonRecords(standings, roundData),
    constructorRecords: getConstructorSeasonRecords(constructors, roundData),
    nearestRaceKey: nearestRaceKeyFromCalendar(races, Date.now()),
    driverStats: getPerDriverRoundStats(roundData),
  };
}

export { F1_SEASON_MIN };

export type { Json };
