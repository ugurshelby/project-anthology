/**
 * Cron: sync-f1 (Masterplan Karar B + E)
 *
 * Syncs current-season F1 data from Jolpica into f1_snapshots.
 * - Auth: Authorization: Bearer ${CRON_SECRET_KEY}
 * - scope=live   → race-calendar windows (quali / sprint / results) for active rounds
 * - scope=season → full season backfill (all rounds past results sync window)
 *
 * Response shape: { source, scope, season, upserted, skipped, errors, durationMs }
 */

import { NextRequest, NextResponse } from 'next/server';
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
import type { Json } from '@/types/database';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 300;

function authError(): NextResponse {
  return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
}

function isAuthorized(req: NextRequest): boolean {
  const secret = process.env.CRON_SECRET_KEY;
  if (!secret) return false;
  const header = req.headers.get('authorization') ?? '';
  return header === `Bearer ${secret}`;
}

export async function GET(req: NextRequest): Promise<NextResponse> {
  if (!isAuthorized(req)) return authError();

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
      const driverSt = await fetchDriverStandings(CURRENT_SEASON);
      if (hasDriverStandings(driverSt)) {
        await ingestSeasonSnapshot(CURRENT_SEASON, 'standings_drivers', driverSt as unknown as Json, 'jolpica', stats);
      }

      const constrSt = await fetchConstructorStandings(CURRENT_SEASON);
      if (hasConstructorStandings(constrSt)) {
        await ingestSeasonSnapshot(CURRENT_SEASON, 'standings_constructors', constrSt as unknown as Json, 'jolpica', stats);
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

      if (fetchQuali) {
        const qual = await fetchQualifying(CURRENT_SEASON, round);
        if (hasQualifyingResults(qual)) {
          await ingestRoundSnapshot(CURRENT_SEASON, round, 'qualifying', qual as unknown as Json, 'jolpica', stats);
        }
      }

      if (fetchSprintData) {
        const sprint = await fetchSprint(CURRENT_SEASON, round);
        if (hasSprintResults(sprint)) {
          await ingestRoundSnapshot(CURRENT_SEASON, round, 'sprint', sprint as unknown as Json, 'jolpica', stats);
        }
      }

      if (fetchRaceResults) {
        const results = await fetchResults(CURRENT_SEASON, round);
        if (hasResults(results)) {
          await ingestRoundSnapshot(CURRENT_SEASON, round, 'results', results as unknown as Json, 'jolpica', stats);
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
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json(
      {
        error: msg,
        upserted: stats.upserted,
        skipped: stats.skipped,
        errors: stats.errors,
        durationMs: Date.now() - startedAt,
      },
      { status: 500 },
    );
  }
}
