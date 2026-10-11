/**
 * sync-f1 step: provisional post-race results + standings from OpenF1
 * (see lib/f1/provisional.ts for the why). Runs after the Jolpica steps.
 *
 * Fires only for the latest started race whose Jolpica results are not in the
 * DB yet, within PROVISIONAL_WINDOW_MS of its start, once the OpenF1 race
 * session has ended. Writes `source='openf1'` rows once per round (results and
 * both standings), then stays idle until Jolpica's rows replace them.
 */

import { CURRENT_SEASON, getLastFinishedRace, raceStartMs, type CalendarRace } from '@/lib/f1Calendar';
import { buildIdentityMap, buildProvisionalResults, buildProvisionalStandings } from '@/lib/f1/provisional';
import {
  fetchChampionshipDrivers,
  fetchChampionshipTeams,
  fetchLiveDrivers,
  fetchRaceSessionsOfYear,
  fetchSessionResult,
} from '@/lib/f1/sources/openf1';
import { isOpenF1Restricted } from '@/lib/f1/sources/openf1Errors';
import { upsertF1Snapshot, type IngestStats } from '@/lib/f1Ingest';
import { getSupabaseAdmin } from '@/lib/supabase';
import type { Json, SnapshotSource, SnapshotType } from '@/types/database';

/** Stop trying after this long (Jolpica will have caught up by then). */
export const PROVISIONAL_WINDOW_MS = 3 * 24 * 60 * 60 * 1000;
/** Give OpenF1 a moment after the session's official end. */
const AFTER_SESSION_END_MS = 5 * 60 * 1000;

export type ProvisionalStatus =
  | 'no-race'
  | 'jolpica-has-results'
  | 'already-written'
  | 'session-not-found'
  | 'session-running'
  | 'locked'
  | 'not-published'
  | 'written'
  | 'error';

export interface ProvisionalOutcome {
  status: ProvisionalStatus;
  round: number | null;
  results?: boolean;
  standings?: boolean;
}

export interface StandingsSnapshots {
  drivers: unknown;
  constructors: unknown;
}

interface SnapshotRow {
  round: number | null;
  type: SnapshotType;
  source: SnapshotSource;
  data: unknown;
}

async function loadRows(season: number, round: number): Promise<SnapshotRow[]> {
  const db = getSupabaseAdmin();
  const { data, error } = await db
    .from('f1_snapshots')
    .select('round, type, source, data')
    .eq('season', season)
    .or(`round.eq.${round},round.eq.${round - 1},round.is.null`)
    .in('type', ['results', 'qualifying', 'sprint', 'standings_drivers', 'standings_constructors']);
  if (error) throw new Error(`f1_snapshots read: ${error.message}`);
  return (data ?? []) as SnapshotRow[];
}

function standingsRound(snapshot: unknown): number | null {
  const r = Number(
    (snapshot as { MRData?: { StandingsTable?: { round?: string } } } | null)?.MRData?.StandingsTable?.round,
  );
  return Number.isFinite(r) ? r : null;
}

/** Same calendar day (UTC) as the race, within a day either side (late-night/early-morning races). */
function sessionMatchesRace(dateStart: string, race: CalendarRace): boolean {
  const start = raceStartMs(race);
  const t = Date.parse(dateStart);
  return start !== null && Number.isFinite(t) && Math.abs(t - start) < 24 * 60 * 60 * 1000;
}

export async function syncProvisionalFromOpenF1(opts: {
  races: CalendarRace[];
  now: Date;
  stats: IngestStats;
  /** Called with (previous, new) standings before the new rows are written. */
  onStandings?: (prev: StandingsSnapshots, next: StandingsSnapshots) => Promise<void>;
}): Promise<ProvisionalOutcome> {
  const { races, now, stats } = opts;
  const race = getLastFinishedRace(races, now);
  const round = Number(race?.round);
  const start = race ? raceStartMs(race) : null;
  if (!race || !round || start === null || now.getTime() - start > PROVISIONAL_WINDOW_MS) {
    return { status: 'no-race', round: null };
  }

  try {
    const rows = await loadRows(CURRENT_SEASON, round);
    const find = (type: SnapshotType, r: number | null) => rows.find((x) => x.type === type && x.round === r);

    const results = find('results', round);
    if (results?.source === 'jolpica') return { status: 'jolpica-has-results', round };

    const prevDrivers = find('standings_drivers', null);
    const prevConstructors = find('standings_constructors', null);
    const standingsDone = prevDrivers?.source === 'openf1' && standingsRound(prevDrivers.data) === round;
    if (results?.source === 'openf1' && standingsDone) return { status: 'already-written', round };

    const sessions = await fetchRaceSessionsOfYear(CURRENT_SEASON);
    const session = sessions.find((s) => sessionMatchesRace(s.date_start, race));
    if (!session) return { status: 'session-not-found', round };
    const end = Date.parse(session.date_end);
    if (!Number.isFinite(end) || now.getTime() < end + AFTER_SESSION_END_MS) return { status: 'session-running', round };

    const classification = await fetchSessionResult(session.session_key);
    if (classification.length === 0) return { status: 'not-published', round };

    const roster = await fetchLiveDrivers(session.session_key);
    const ids = buildIdentityMap({
      entryLists: [find('qualifying', round)?.data, find('sprint', round)?.data, find('results', round - 1)?.data].filter(
        (x) => x !== undefined,
      ),
      driverStandings: prevDrivers?.data,
      constructorStandings: prevConstructors?.data,
    });

    const outcome: ProvisionalOutcome = { status: 'written', round, results: false, standings: false };

    if (results?.source !== 'openf1') {
      const snapshot = buildProvisionalResults({ season: CURRENT_SEASON, race, results: classification, roster, ids });
      if (snapshot) {
        await upsertF1Snapshot(CURRENT_SEASON, round, 'results', snapshot as Json, 'openf1');
        stats.upserted++;
        outcome.results = true;
      }
    }

    if (!standingsDone) {
      const [drivers, teams] = await Promise.all([
        fetchChampionshipDrivers(session.session_key),
        fetchChampionshipTeams(session.session_key),
      ]);
      const winner = classification.find((r) => r.position === 1)?.driver_number ?? null;
      const built = buildProvisionalStandings({ season: CURRENT_SEASON, round, drivers, teams, roster, ids, winnerNumber: winner });
      if (built) {
        await opts.onStandings?.(
          { drivers: prevDrivers?.data ?? null, constructors: prevConstructors?.data ?? null },
          { drivers: built.drivers, constructors: built.constructors },
        );
        await upsertF1Snapshot(CURRENT_SEASON, null, 'standings_drivers', built.drivers as Json, 'openf1');
        await upsertF1Snapshot(CURRENT_SEASON, null, 'standings_constructors', built.constructors as Json, 'openf1');
        stats.upserted += 2;
        outcome.standings = true;
      }
    }

    return outcome;
  } catch (err) {
    if (isOpenF1Restricted(err)) return { status: 'locked', round };
    stats.errors.push(`provisional R${round}: ${err instanceof Error ? err.message : String(err)}`);
    return { status: 'error', round };
  }
}

/**
 * Should the Jolpica standings step leave the current standings alone?
 * Yes while they are OpenF1 provisional standings for a round Jolpica has no
 * results for yet: Jolpica's standings then cannot include that race (R17
 * 2026: Jolpica already said "round 17" with only the sprint counted), and
 * overwriting would flip the table back and forth every run.
 */
export function keepProvisionalStandings(prev: { source?: string | null; data?: unknown } | null, jolpicaHasResultsFor: (round: number) => boolean): boolean {
  if (prev?.source !== 'openf1') return false;
  const round = standingsRound(prev.data);
  return round !== null && !jolpicaHasResultsFor(round);
}
