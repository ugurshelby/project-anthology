/**
 * Cron: sync-f1 (Masterplan Karar B + E)
 *
 * Syncs current-season F1 data from Jolpica into f1_snapshots.
 * - Auth: Authorization: Bearer ${CRON_SECRET} (legacy CRON_SECRET_KEY also accepted)
 * - scope=live   → race-calendar windows (quali / sprint / results) for active rounds
 * - scope=season → full season backfill (all rounds past results sync window)
 * - Idempotent: a Jolpica snapshot fetched ≥ SNAPSHOT_SETTLE_AFTER_MS after its
 *   due window is final and is never fetched again, so each session is pulled
 *   from upstream (at most) once after it settles, not on every hourly run.
 *   `?force=1` ignores that and re-fetches everything in scope.
 *
 * - After the Jolpica steps, OpenF1 provisional results + standings for the
 *   race that just finished (lib/f1/provisionalSync.ts); Jolpica's rows replace
 *   them once Jolpica publishes.
 *
 * Response shape: { source, scope, season, upserted, skipped, settled, provisional, errors, durationMs }
 */

import { NextRequest, NextResponse } from 'next/server';
import { isCronAuthorized, isCronTriggerAllowed } from '@/lib/cronAuth';
import { CURRENT_SEASON, isRaceWeekend, getLiveOrNextRace, type CalendarRace } from '@/lib/f1Calendar';
import { getCircuitFacts } from '@/data/circuits/facts';
import { fetchLiveCircuitWeather, circuitLocationFromCalendar, fetchTimeZoneForCoords } from '@/lib/data/circuits';
import {
  fetchCalendar,
  fetchDriverStandings,
  fetchConstructorStandings,
  fetchResults,
  fetchQualifying,
  fetchSprint,
  fetchPitStops,
  hasRaces,
  hasDriverStandings,
  hasConstructorStandings,
  hasResults,
  hasQualifyingResults,
  hasSprintResults,
  hasPitStops,
} from '@/lib/f1/sources/jolpica';
import {
  ingestSeasonSnapshot,
  ingestRoundSnapshot,
  loadSnapshotFetchTimes,
  snapshotKey,
  type IngestStats,
} from '@/lib/f1Ingest';
import {
  isRoundInLiveScope,
  isSnapshotSettled,
  latestStandingsDueMs,
  qualiSyncDueMs,
  raceResultsSyncDueMs,
  shouldFetchQualifying,
  shouldFetchResults,
  shouldFetchSprint,
  shouldFetchStandings,
  sprintSyncDueMs,
} from '@/lib/f1/syncSchedule';
import { getSupabaseAdmin } from '@/lib/supabase';
import { keepProvisionalStandings, syncProvisionalFromOpenF1, type ProvisionalOutcome } from '@/lib/f1/provisionalSync';
import { sendExpoPushNotifications } from '@/lib/push/sendExpoPush';
import type { ExpoPushMessage } from 'expo-server-sdk';
import type { Json, SnapshotType } from '@/types/database';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 300;

function authError(): NextResponse {
  return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
}

interface DriverStandingRow {
  Driver?: { driverId?: string; familyName?: string };
}
interface ConstructorStandingRow {
  Constructor?: { constructorId?: string; name?: string };
}

function extractDriverLeaderId(data: unknown): string | null {
  const list = (data as {
    MRData?: { StandingsTable?: { StandingsLists?: Array<{ DriverStandings?: DriverStandingRow[] }> } };
  })?.MRData?.StandingsTable?.StandingsLists?.[0]?.DriverStandings;
  return list?.[0]?.Driver?.driverId ?? null;
}

function extractConstructorLeaderId(data: unknown): string | null {
  const list = (data as {
    MRData?: { StandingsTable?: { StandingsLists?: Array<{ ConstructorStandings?: ConstructorStandingRow[] }> } };
  })?.MRData?.StandingsTable?.StandingsLists?.[0]?.ConstructorStandings;
  return list?.[0]?.Constructor?.constructorId ?? null;
}

/**
 * Build push notification messages for a leader change and append them to
 * `out`. Subscribers are NOT fetched here — the caller fetches them once and
 * passes them in, so multiple championship changes never hit the DB twice.
 */
function buildLeaderChangeMessages(
  kind: 'driver' | 'constructor',
  data: unknown,
  subscribers: { token: string; preferences: Record<string, boolean> }[],
  out: ExpoPushMessage[],
): void {
  const leaderName =
    kind === 'driver'
      ? (data as { MRData?: { StandingsTable?: { StandingsLists?: Array<{ DriverStandings?: DriverStandingRow[] }> } } })
          ?.MRData?.StandingsTable?.StandingsLists?.[0]?.DriverStandings?.[0]?.Driver?.familyName
      : (data as { MRData?: { StandingsTable?: { StandingsLists?: Array<{ ConstructorStandings?: ConstructorStandingRow[] }> } } })
          ?.MRData?.StandingsTable?.StandingsLists?.[0]?.ConstructorStandings?.[0]?.Constructor?.name;

  const targets = subscribers.filter((s) => s.preferences?.standings === true);
  if (targets.length === 0) return;

  for (const s of targets) {
    out.push({
      to: s.token,
      sound: 'default',
      title: kind === 'driver' ? 'New championship leader' : "New constructors' leader",
      body: leaderName
        ? `${leaderName} now leads the ${kind === 'driver' ? "drivers'" : "constructors'"} championship.`
        : 'The championship lead has changed.',
      data: { kind },
    });
  }
}

/**
 * Push a "new championship leader" message when the leader differs between
 * the previous and the new standings (drivers and/or constructors). Shared by
 * the Jolpica standings step and the OpenF1 provisional step, so whichever
 * source lands first notifies once and the other sees no change.
 */
async function notifyLeaderChanges(
  db: ReturnType<typeof getSupabaseAdmin>,
  prev: { drivers: unknown; constructors: unknown },
  next: { drivers: unknown; constructors: unknown },
): Promise<void> {
  const prevDriverLeaderId = extractDriverLeaderId(prev.drivers);
  const prevConstrLeaderId = extractConstructorLeaderId(prev.constructors);
  const newDriverLeaderId = extractDriverLeaderId(next.drivers);
  const newConstrLeaderId = extractConstructorLeaderId(next.constructors);
  const driverChanged = Boolean(prevDriverLeaderId && newDriverLeaderId && prevDriverLeaderId !== newDriverLeaderId);
  const constrChanged = Boolean(prevConstrLeaderId && newConstrLeaderId && prevConstrLeaderId !== newConstrLeaderId);
  if (!driverChanged && !constrChanged) return;

  const { data: subs } = await db.from('push_subscriptions')
    .select('token, preferences')
    .not('token', 'is', null);
  // `preferences` is jsonb: keep only boolean flags (anything else = no preference).
  const subscribers: { token: string; preferences: Record<string, boolean> }[] = (subs ?? []).map((s) => ({
    token: s.token,
    preferences:
      s.preferences && typeof s.preferences === 'object' && !Array.isArray(s.preferences)
        ? Object.fromEntries(
            Object.entries(s.preferences).filter((e): e is [string, boolean] => typeof e[1] === 'boolean'),
          )
        : {},
  }));

  const pendingMessages: ExpoPushMessage[] = [];
  if (driverChanged) buildLeaderChangeMessages('driver', next.drivers, subscribers, pendingMessages);
  if (constrChanged) buildLeaderChangeMessages('constructor', next.constructors, subscribers, pendingMessages);
  if (pendingMessages.length > 0) await sendExpoPushNotifications(pendingMessages);
}

const MIN_TRIGGER_INTERVAL_MS = 60_000;

export async function GET(req: NextRequest): Promise<NextResponse> {
  if (!(await isCronAuthorized(req))) return authError();
  if (!(await isCronTriggerAllowed('sync-f1', MIN_TRIGGER_INTERVAL_MS))) {
    return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
  }

  const startedAt = Date.now();
  const stats: IngestStats = { upserted: 0, skipped: 0, errors: [] };

  try {
    const searchParams = req.nextUrl.searchParams;
    const forcedScope = searchParams.get('scope') as 'live' | 'season' | null;

    // 1) Fetch calendar to determine race-weekend status
    const calendarData = await fetchCalendar(CURRENT_SEASON);
    const races = (
      (calendarData.MRData as { RaceTable?: { Races?: CalendarRace[] } })?.RaceTable?.Races ?? []
    );

    // 2) Determine effective scope
    const onRaceWeekend = isRaceWeekend(races);
    const scope: 'live' | 'season' = forcedScope ?? (onRaceWeekend ? 'live' : 'season');

    const now = new Date();

    // Which snapshots are already final? One query; fails open (empty map).
    const force = searchParams.get('force') === '1';
    const fetchTimes = force ? new Map<string, number>() : await loadSnapshotFetchTimes(CURRENT_SEASON);
    let settledSkips = 0;
    const isSettled = (round: number | null, type: SnapshotType, dueAt: number | null): boolean =>
      isSnapshotSettled(fetchTimes.get(snapshotKey(round, type)), dueAt);

    // 3) Upsert calendar (always — picks up postponements)
    if (hasRaces(calendarData)) {
      await ingestSeasonSnapshot(CURRENT_SEASON, 'calendar', calendarData as unknown as Json, 'jolpica', stats);
    }

    // 4) Standings — refresh when any race results window has passed
    const wantStandings = scope === 'season' || shouldFetchStandings(races, now);
    const standingsDue = latestStandingsDueMs(races, now);
    const standingsSettled =
      wantStandings &&
      isSettled(null, 'standings_drivers', standingsDue) &&
      isSettled(null, 'standings_constructors', standingsDue);
    if (standingsSettled) settledSkips++;
    const refreshStandings = wantStandings && !standingsSettled;
    if (refreshStandings) {
      const db = getSupabaseAdmin();

      // ── Read previous standings before overwriting ────────────────────────
      // upsertF1Snapshot updates rows in-place — no history after the write.
      const [prevDriverRow, prevConstrRow, jolpicaResults] = await Promise.all([
        db.from('f1_snapshots')
          .select('data, source')
          .eq('season', CURRENT_SEASON)
          .is('round', null)
          .eq('type', 'standings_drivers')
          .maybeSingle(),
        db.from('f1_snapshots')
          .select('data, source')
          .eq('season', CURRENT_SEASON)
          .is('round', null)
          .eq('type', 'standings_constructors')
          .maybeSingle(),
        db.from('f1_snapshots')
          .select('round')
          .eq('season', CURRENT_SEASON)
          .eq('type', 'results')
          .eq('source', 'jolpica'),
      ]);
      const jolpicaResultRounds = new Set((jolpicaResults.data ?? []).map((r) => r.round));

      // OpenF1 provisional standings stay until Jolpica has the race they include.
      if (keepProvisionalStandings(prevDriverRow.data, (round) => jolpicaResultRounds.has(round))) {
        stats.skipped++;
      } else {
        // ── Fetch new standings ─────────────────────────────────────────────
        const driverSt = await fetchDriverStandings(CURRENT_SEASON);
        const constrSt = await fetchConstructorStandings(CURRENT_SEASON);

        if (hasDriverStandings(driverSt)) {
          await ingestSeasonSnapshot(CURRENT_SEASON, 'standings_drivers', driverSt as unknown as Json, 'jolpica', stats);
        }
        if (hasConstructorStandings(constrSt)) {
          await ingestSeasonSnapshot(CURRENT_SEASON, 'standings_constructors', constrSt as unknown as Json, 'jolpica', stats);
        }

        await notifyLeaderChanges(
          db,
          { drivers: prevDriverRow.data?.data ?? null, constructors: prevConstrRow.data?.data ?? null },
          { drivers: driverSt, constructors: constrSt },
        );
      }
    }

    // 5) Per-round data — race-calendar-aware session fetches
    for (const race of races) {
      const round = Number(race.round);
      if (!round) continue;

      const qualiDue = shouldFetchQualifying(race, now);
      const sprintDue = shouldFetchSprint(race, now);
      const resultsDue = shouldFetchResults(race, now);
      const raceDueAt = raceResultsSyncDueMs(race);

      // Due AND not yet final. Results and pit stops are gated separately: pit
      // stops are often published later than results, so a settled `results`
      // row must not stop a still-missing `pitstops` row from being fetched.
      const fetchQuali = qualiDue && !isSettled(round, 'qualifying', qualiSyncDueMs(race));
      const fetchSprintData = sprintDue && !isSettled(round, 'sprint', sprintSyncDueMs(race));
      const fetchRaceResults = resultsDue && !isSettled(round, 'results', raceDueAt);
      const fetchRacePitStops = resultsDue && !isSettled(round, 'pitstops', raceDueAt);
      const anyDue = qualiDue || sprintDue || resultsDue;
      const anyToFetch = fetchQuali || fetchSprintData || fetchRaceResults || fetchRacePitStops;
      if (anyDue && !anyToFetch) settledSkips++;

      const inScope = scope === 'live' ? isRoundInLiveScope(race, now) : anyToFetch;

      if (!inScope) {
        stats.skipped++;
        continue;
      }

      // Each session fetch is wrapped in its own try/catch so a Jolpica
      // network error or timeout for one session does not abort the remaining
      // rounds. The error is recorded in stats.errors and the loop continues.
      if (fetchQuali) {
        try {
          const qual = await fetchQualifying(CURRENT_SEASON, round);
          if (hasQualifyingResults(qual)) {
            await ingestRoundSnapshot(CURRENT_SEASON, round, 'qualifying', qual as unknown as Json, 'jolpica', stats);
          }
        } catch (err) {
          const msg = `R${round} qualifying: ${err instanceof Error ? err.message : String(err)}`;
          stats.errors.push(msg);
          console.warn(`[sync-f1] ${msg}`);
        }
      }

      if (fetchSprintData) {
        try {
          const sprint = await fetchSprint(CURRENT_SEASON, round);
          if (hasSprintResults(sprint)) {
            await ingestRoundSnapshot(CURRENT_SEASON, round, 'sprint', sprint as unknown as Json, 'jolpica', stats);
          }
        } catch (err) {
          const msg = `R${round} sprint: ${err instanceof Error ? err.message : String(err)}`;
          stats.errors.push(msg);
          console.warn(`[sync-f1] ${msg}`);
        }
      }

      if (fetchRaceResults) {
        try {
          const results = await fetchResults(CURRENT_SEASON, round);
          if (hasResults(results)) {
            await ingestRoundSnapshot(CURRENT_SEASON, round, 'results', results as unknown as Json, 'jolpica', stats);
          }
        } catch (err) {
          const msg = `R${round} results: ${err instanceof Error ? err.message : String(err)}`;
          stats.errors.push(msg);
          console.warn(`[sync-f1] ${msg}`);
        }
      }

      if (fetchRacePitStops) {
        // Pit stops are only published once the race has run — same due window as results.
        try {
          const pitstops = await fetchPitStops(CURRENT_SEASON, round);
          if (hasPitStops(pitstops)) {
            await ingestRoundSnapshot(CURRENT_SEASON, round, 'pitstops', pitstops as unknown as Json, 'jolpica', stats);
          }
        } catch (err) {
          const msg = `R${round} pitstops: ${err instanceof Error ? err.message : String(err)}`;
          stats.errors.push(msg);
          console.warn(`[sync-f1] ${msg}`);
        }
      }

      if (!anyToFetch) {
        stats.skipped++;
      }
    }

    // 5b) Circuit locations — persist each calendar circuit's coordinates into
    // circuits.data.location (merged, so editorial keys are never overwritten).
    // Source is the calendar Jolpica already returned — no extra API call.
    try {
      const db = getSupabaseAdmin();
      const ids = races.map((r) => r.Circuit?.circuitId).filter((id): id is string => !!id);
      const { data: existing } = await db.from('circuits').select('id, data').in('id', ids);
      const existingById = new Map<string, Record<string, unknown>>(
        ((existing ?? []) as Array<{ id: string; data: Record<string, unknown> | null }>).map((r) => [
          r.id,
          r.data ?? {},
        ]),
      );
      const pending = races.flatMap((r) => {
        const id = r.Circuit?.circuitId;
        const loc = circuitLocationFromCalendar(r.Circuit);
        if (!id || !loc) return [];
        const prev = existingById.get(id) as { location?: { timeZone?: string } } | undefined;
        return [{ id, loc, name: r.Circuit?.circuitName, prevTz: prev?.location?.timeZone }];
      });
      // Time zone comes from coordinates (any new circuit works with no static data);
      // looked up once per circuit, then persisted and reused.
      const rows = await Promise.all(
        pending.map(async ({ id, loc, name, prevTz }) => {
          const timeZone =
            prevTz ?? (await fetchTimeZoneForCoords(loc.lat, loc.lon)) ?? getCircuitFacts(id)?.timeZone;
          return {
            id,
            data: {
              ...(existingById.get(id) ?? {}),
              location: { ...loc, name, ...(timeZone ? { timeZone } : {}) },
            },
          };
        }),
      );
      if (rows.length > 0) {
        const { error } = await db.from('circuits').upsert(rows, { onConflict: 'id' });
        if (error) stats.errors.push(`circuits location upsert: ${error.message}`);
      }
    } catch (err) {
      const msg = `circuits location: ${err instanceof Error ? err.message : String(err)}`;
      stats.errors.push(msg);
      console.warn(`[sync-f1] ${msg}`);
    }

    // 6) Circuit weather — forward-looking only (Open-Meteo forecast for the
    // live/next race's circuit). Every run refreshes that one row and drops
    // any other circuit_weather row so a finished race's forecast never
    // lingers — see migration 20260929000002 for the retention rationale.
    try {
      const db = getSupabaseAdmin();
      const liveOrNext = getLiveOrNextRace(races, now);
      const round = liveOrNext?.round != null ? Number(liveOrNext.round) : null;
      const circuitId = liveOrNext?.Circuit?.circuitId;

      if (round != null && Number.isFinite(round) && circuitId) {
        const facts = getCircuitFacts(circuitId);
        // Coordinates: curated facts first, else the calendar's own Circuit.Location.
        const fallback = circuitLocationFromCalendar(liveOrNext?.Circuit);
        const weather = await fetchLiveCircuitWeather(
          facts?.lat ?? fallback?.lat,
          facts?.lon ?? fallback?.lon,
        );
        if (weather) {
          const { error } = await db.from('circuit_weather').upsert(
            {
              circuit_id: circuitId,
              season: CURRENT_SEASON,
              round,
              data: { ...weather },
              fetched_at: new Date().toISOString(),
            },
            { onConflict: 'season,round' },
          );
          if (error) stats.errors.push(`circuit_weather upsert: ${error.message}`);
        }
        await db.from('circuit_weather')
          .delete()
          .eq('season', CURRENT_SEASON)
          .neq('round', round);
      } else {
        // Season over, nothing live/upcoming — no forward-looking forecast to keep.
        await db.from('circuit_weather').delete().eq('season', CURRENT_SEASON);
      }
      // Belt-and-braces: drop anything left over from a prior season (year rollover).
      await db.from('circuit_weather').delete().neq('season', CURRENT_SEASON);
    } catch (err) {
      const msg = `circuit_weather: ${err instanceof Error ? err.message : String(err)}`;
      stats.errors.push(msg);
      console.warn(`[sync-f1] ${msg}`);
    }

    // 6) OpenF1 provisional results + standings for the race that just finished.
    const provisional: ProvisionalOutcome = await syncProvisionalFromOpenF1({
      races,
      now,
      stats,
      onStandings: (prev, next) => notifyLeaderChanges(getSupabaseAdmin(), prev, next),
    });

    return NextResponse.json({
      source: 'jolpica',
      scope,
      season: CURRENT_SEASON,
      upserted: stats.upserted,
      skipped: stats.skipped,
      settled: settledSkips,
      provisional,
      errors: stats.errors,
      durationMs: Date.now() - startedAt,
    });
  } catch (err) {
    // Generic client-facing message; full detail goes to logs/Sentry (B-7).
    console.error('[cron sync-f1] failed:', err);
    return NextResponse.json(
      {
        error: 'Sync failed',
        upserted: stats.upserted,
        skipped: stats.skipped,
        errors: stats.errors,
        durationMs: Date.now() - startedAt,
      },
      { status: 500 },
    );
  }
}
