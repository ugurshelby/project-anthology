/**
 * Cron: sync-f1 (Masterplan Karar B + E)
 *
 * Syncs current-season F1 data from Jolpica into f1_snapshots.
 * - Auth: Authorization: Bearer ${CRON_SECRET} (legacy CRON_SECRET_KEY also accepted)
 * - scope=live   → race-calendar windows (quali / sprint / results) for active rounds
 * - scope=season → full season backfill (all rounds past results sync window)
 *
 * Response shape: { source, scope, season, upserted, skipped, errors, durationMs }
 */

import { NextRequest, NextResponse } from 'next/server';
import { isCronAuthorized, isCronTriggerAllowed } from '@/lib/cronAuth';
import { CURRENT_SEASON, isRaceWeekend, type CalendarRace } from '@/lib/f1Calendar';
import {
  fetchCalendar,
  fetchDriverStandings,
  fetchConstructorStandings,
  fetchResults,
  fetchQualifying,
  fetchSprint,
  hasRaces,
  hasDriverStandings,
  hasConstructorStandings,
  hasResults,
  hasQualifyingResults,
  hasSprintResults,
} from '@/lib/f1/sources/jolpica';
import {
  ingestSeasonSnapshot,
  ingestRoundSnapshot,
  type IngestStats,
} from '@/lib/f1Ingest';
import {
  isRoundInLiveScope,
  shouldFetchQualifying,
  shouldFetchResults,
  shouldFetchSprint,
  shouldFetchStandings,
} from '@/lib/f1/syncSchedule';
import { getSupabaseAdmin } from '@/lib/supabase';
import { sendExpoPushNotifications } from '@/lib/push/sendExpoPush';
import type { ExpoPushMessage } from 'expo-server-sdk';
import type { Json } from '@/types/database';

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

const MIN_TRIGGER_INTERVAL_MS = 60_000;

export async function GET(req: NextRequest): Promise<NextResponse> {
  if (!isCronAuthorized(req)) return authError();
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

    // 3) Upsert calendar (always — picks up postponements)
    if (hasRaces(calendarData)) {
      await ingestSeasonSnapshot(CURRENT_SEASON, 'calendar', calendarData as unknown as Json, 'jolpica', stats);
    }

    // 4) Standings — refresh when any race results window has passed
    const refreshStandings = scope === 'season' || shouldFetchStandings(races, now);
    if (refreshStandings) {
      const db = getSupabaseAdmin();

      // ── Read previous leaders before overwriting ──────────────────────────
      // upsertF1Snapshot updates rows in-place — no history after the write.
      // Both snapshot types are fetched in a single parallel round-trip.
      const [prevDriverRow, prevConstrRow] = await Promise.all([
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (db.from('f1_snapshots') as any)
          .select('data')
          .eq('season', CURRENT_SEASON)
          .is('round', null)
          .eq('type', 'standings_drivers')
          .maybeSingle(),
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (db.from('f1_snapshots') as any)
          .select('data')
          .eq('season', CURRENT_SEASON)
          .is('round', null)
          .eq('type', 'standings_constructors')
          .maybeSingle(),
      ]);
      const prevDriverLeaderId = extractDriverLeaderId(prevDriverRow.data?.data ?? null);
      const prevConstrLeaderId = extractConstructorLeaderId(prevConstrRow.data?.data ?? null);

      // ── Fetch new standings ───────────────────────────────────────────────
      const driverSt = await fetchDriverStandings(CURRENT_SEASON);
      const constrSt = await fetchConstructorStandings(CURRENT_SEASON);

      if (hasDriverStandings(driverSt)) {
        await ingestSeasonSnapshot(CURRENT_SEASON, 'standings_drivers', driverSt as unknown as Json, 'jolpica', stats);
      }
      if (hasConstructorStandings(constrSt)) {
        await ingestSeasonSnapshot(CURRENT_SEASON, 'standings_constructors', constrSt as unknown as Json, 'jolpica', stats);
      }

      // ── Consolidated push notifications ───────────────────────────────────
      // Fetch push_subscriptions once; build all messages into one array;
      // call sendExpoPushNotifications once (even if two changes happened).
      const pendingMessages: ExpoPushMessage[] = [];

      const newDriverLeaderId = extractDriverLeaderId(driverSt as unknown);
      const newConstrLeaderId = extractConstructorLeaderId(constrSt as unknown);

      const needsNotification =
        (prevDriverLeaderId && newDriverLeaderId && prevDriverLeaderId !== newDriverLeaderId) ||
        (prevConstrLeaderId && newConstrLeaderId && prevConstrLeaderId !== newConstrLeaderId);

      if (needsNotification) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { data: subs } = await (db.from('push_subscriptions') as any)
          .select('token, preferences')
          .not('token', 'is', null);
        const subscribers: { token: string; preferences: Record<string, boolean> }[] = subs ?? [];

        if (prevDriverLeaderId && newDriverLeaderId && prevDriverLeaderId !== newDriverLeaderId) {
          buildLeaderChangeMessages('driver', driverSt as unknown, subscribers, pendingMessages);
        }
        if (prevConstrLeaderId && newConstrLeaderId && prevConstrLeaderId !== newConstrLeaderId) {
          buildLeaderChangeMessages('constructor', constrSt as unknown, subscribers, pendingMessages);
        }

        if (pendingMessages.length > 0) {
          await sendExpoPushNotifications(pendingMessages);
        }
      }
    }

    // 5) Per-round data — race-calendar-aware session fetches
    for (const race of races) {
      const round = Number(race.round);
      if (!round) continue;

      const fetchQuali = shouldFetchQualifying(race, now);
      const fetchSprintData = shouldFetchSprint(race, now);
      const fetchRaceResults = shouldFetchResults(race, now);

      const inScope =
        scope === 'live'
          ? isRoundInLiveScope(race, now)
          : fetchQuali || fetchSprintData || fetchRaceResults;

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

      if (!fetchQuali && !fetchSprintData && !fetchRaceResults) {
        stats.skipped++;
      }
    }

    return NextResponse.json({
      source: 'jolpica',
      scope,
      season: CURRENT_SEASON,
      upserted: stats.upserted,
      skipped: stats.skipped,
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
