import { NextResponse, type NextRequest } from 'next/server';
import { fetchSeasonSnapshotTyped, fetchRoundSnapshot } from '@/lib/data/f1';
import { getRacesFromCalendar, getLastRaceResult } from '@/lib/f1/mrdata';
import { CURRENT_SEASON, F1_SEASON_MIN, getLastFinishedRace, isRaceWeekend } from '@/lib/f1Calendar';
import { rateLimit, getClientIP } from '@/lib/rateLimit';
import { jsonApiError, logApiError } from '@/lib/api/errors';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const RATE_LIMIT_WINDOW_MS = 60_000;
const RATE_LIMIT_MAX_REQUESTS = 60;

/**
 * Race Day Mode support endpoint — the most recently finished race's podium +
 * fastest lap, plus whether "now" falls inside a race weekend window. Shared
 * by web and mobile so both can render a live-ish weekend state without a
 * telemetry feed.
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ year: string }> },
): Promise<NextResponse> {
  const clientIP = getClientIP(req.headers);
  if (clientIP !== 'unknown') {
    const { success, retryAfter } = await rateLimit(clientIP, {
      prefix: 'season-last-result',
      max: RATE_LIMIT_MAX_REQUESTS,
      windowMs: RATE_LIMIT_WINDOW_MS,
    });
    if (!success) {
      return NextResponse.json(
        { error: 'Too many requests' },
        { status: 429, headers: { 'Retry-After': String(retryAfter || 60) } },
      );
    }
  }

  const { year: yearStr } = await params;
  const year = Number(yearStr);

  if (!Number.isFinite(year) || year < F1_SEASON_MIN || year > CURRENT_SEASON) {
    return NextResponse.json({ error: 'Invalid season year' }, { status: 400 });
  }

  try {
    const calendarData = await fetchSeasonSnapshotTyped(year, 'calendar');
    const races = getRacesFromCalendar(calendarData);
    const now = new Date();
    const weekend = isRaceWeekend(races, now);
    const lastFinished = getLastFinishedRace(races, now);

    const lastRound = lastFinished?.round != null ? Number(lastFinished.round) : null;
    const resultsData =
      lastRound != null && Number.isFinite(lastRound)
        ? await fetchRoundSnapshot(year, lastRound, 'results')
        : null;
    const recap = getLastRaceResult(resultsData);

    return NextResponse.json(
      { isRaceWeekend: weekend, lastResult: recap },
      {
        status: 200,
        headers: { 'Cache-Control': 'public, s-maxage=120, stale-while-revalidate=600' },
      },
    );
  } catch (error) {
    logApiError('season/[year]/last-result', error);
    return jsonApiError('Failed to fetch last result', 500);
  }
}
