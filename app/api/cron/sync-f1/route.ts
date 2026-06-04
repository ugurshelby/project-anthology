/**
 * Cron: sync-f1 (Masterplan Karar B + E)
 *
 * Syncs current-season F1 data from Jolpica into f1_snapshots.
 * - Auth: Authorization: Bearer ${CRON_SECRET_KEY}  (Vercel Cron sends this automatically)
 * - Scope: current season only (F1DB handles historical; never Jolpica for past years)
 * - scope=live  → only rounds done in the last 7 days (race-weekend fast path)
 * - scope=season (default) → full season: calendar + standings + all finished rounds
 * - isRaceWeekend short-circuit: if scope not forced, defaults to 'live' during a race weekend
 *
 * Response shape: { source, scope, season, upserted, skipped, errors, durationMs }
 */

import { NextRequest, NextResponse } from 'next/server';
import {
  CURRENT_SEASON,
  isRaceWeekend,
  isRaceDone,
  type CalendarRace,
} from '@/lib/f1Calendar';
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
  upsertF1Snapshot,
  ingestSeasonSnapshot,
  ingestRoundSnapshot,
  type IngestStats,
} from '@/lib/f1Ingest';
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

    // 3) Upsert calendar
    if (hasRaces(calendarData)) {
      await ingestSeasonSnapshot(CURRENT_SEASON, 'calendar', calendarData as unknown as Json, 'jolpica', stats);
    }

    // 4) Driver + constructor standings
    const driverSt = await fetchDriverStandings(CURRENT_SEASON);
    if (hasDriverStandings(driverSt)) {
      await ingestSeasonSnapshot(CURRENT_SEASON, 'standings_drivers', driverSt as unknown as Json, 'jolpica', stats);
    }

    const constrSt = await fetchConstructorStandings(CURRENT_SEASON);
    if (hasConstructorStandings(constrSt)) {
      await ingestSeasonSnapshot(CURRENT_SEASON, 'standings_constructors', constrSt as unknown as Json, 'jolpica', stats);
    }

    // 5) Per-round data
    const now = new Date();
    const cutoff = scope === 'live' ? new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000) : null;

    for (const race of races) {
      if (!isRaceDone(race, now)) continue;

      // live scope: only rounds whose race date is within the last 7 days
      if (cutoff && race.date) {
        const raceDate = new Date(`${race.date}T23:59:59Z`);
        if (raceDate < cutoff) {
          stats.skipped++;
          continue;
        }
      }

      const round = Number(race.round);
      if (!round) continue;

      // Results
      const results = await fetchResults(CURRENT_SEASON, round);
      if (hasResults(results)) {
        await ingestRoundSnapshot(CURRENT_SEASON, round, 'results', results as unknown as Json, 'jolpica', stats);
      }

      // Qualifying
      const qual = await fetchQualifying(CURRENT_SEASON, round);
      if (hasQualifyingResults(qual)) {
        await ingestRoundSnapshot(CURRENT_SEASON, round, 'qualifying', qual as unknown as Json, 'jolpica', stats);
      }

      // Sprint (optional — skip if no sprint data)
      const sprint = await fetchSprint(CURRENT_SEASON, round);
      if (hasSprintResults(sprint)) {
        await ingestRoundSnapshot(CURRENT_SEASON, round, 'sprint', sprint as unknown as Json, 'jolpica', stats);
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
