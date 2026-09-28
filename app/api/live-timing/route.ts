import { NextResponse, type NextRequest } from 'next/server';
import { applyRateLimit } from '@/lib/rateLimit';
import { logApiError, jsonApiError } from '@/lib/api/errors';
import {
  fetchLatestSession,
  fetchLiveDrivers,
  fetchLiveIntervals,
  fetchLivePositions,
} from '@/lib/f1/sources/openf1';

/**
 * Live in-session timing (position + gap) for the home-page race tracker.
 *
 * OpenF1 `session_key=latest` always returns the most recently STARTED
 * session, even after it has ended — so this route treats the session as
 * "live" only while `now` falls within [date_start, date_end] (+ a short
 * post-finish grace window so the final classification is still shown).
 *
 * Polled client-side every ~12s only while the home page believes a race
 * weekend is in the live window (lib/f1Calendar getRaceCountdownPhase), so
 * traffic is naturally bounded to actual race-day usage.
 */

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const RATE_LIMIT_WINDOW_MS = 60_000;
const RATE_LIMIT_MAX_REQUESTS = 30;

/** Grace window after a session's official end during which we still serve its classification. */
const POST_SESSION_GRACE_MS = 10 * 60 * 1000;

export interface LiveTimingDriverRow {
  position: number;
  driverNumber: number;
  code: string;
  fullName: string;
  teamName: string;
  teamColour: string;
  gapToLeader: string | null;
  interval: string | null;
}

export interface LiveTimingResponse {
  live: boolean;
  sessionName: string | null;
  circuitShortName: string | null;
  rows: LiveTimingDriverRow[];
}

function latestByDriver<T extends { driver_number: number; date: string }>(rows: T[]): Map<number, T> {
  const out = new Map<number, T>();
  for (const row of rows) {
    const existing = out.get(row.driver_number);
    if (!existing || row.date > existing.date) out.set(row.driver_number, row);
  }
  return out;
}

function formatGap(value: number | string | null): string | null {
  if (value === null || value === undefined) return null;
  if (typeof value === 'string') return value.toUpperCase(); // e.g. "LAP 1", "+1L"
  return `+${value.toFixed(3)}`;
}

export async function GET(req: NextRequest): Promise<NextResponse> {
  const { success, retryAfter } = await applyRateLimit(req.headers, {
    prefix: 'live-timing',
    max: RATE_LIMIT_MAX_REQUESTS,
    windowMs: RATE_LIMIT_WINDOW_MS,
  });
  if (!success) {
    return NextResponse.json(
      { error: 'Too many requests' },
      { status: 429, headers: { 'Retry-After': String(retryAfter || 30) } },
    );
  }

  try {
    const session = await fetchLatestSession();
    if (!session) {
      return NextResponse.json(
        { live: false, sessionName: null, circuitShortName: null, rows: [] } satisfies LiveTimingResponse,
        { status: 200, headers: { 'Cache-Control': 'no-store' } },
      );
    }

    const startMs = Date.parse(session.date_start);
    const endMs = Date.parse(session.date_end);
    const nowMs = Date.now();
    const isLive =
      Number.isFinite(startMs) &&
      nowMs >= startMs &&
      (!Number.isFinite(endMs) || nowMs <= endMs + POST_SESSION_GRACE_MS);

    if (!isLive) {
      return NextResponse.json(
        { live: false, sessionName: session.session_name, circuitShortName: session.circuit_short_name, rows: [] } satisfies LiveTimingResponse,
        { status: 200, headers: { 'Cache-Control': 'no-store' } },
      );
    }

    const [drivers, positions, intervals] = await Promise.all([
      fetchLiveDrivers(session.session_key),
      fetchLivePositions(session.session_key),
      fetchLiveIntervals(session.session_key),
    ]);

    const latestPositions = latestByDriver(positions);
    const latestIntervals = latestByDriver(intervals);
    const driverByNumber = new Map(drivers.map((d) => [d.driver_number, d]));

    const rows: LiveTimingDriverRow[] = [...latestPositions.values()]
      .map((pos) => {
        const driver = driverByNumber.get(pos.driver_number);
        const interval = latestIntervals.get(pos.driver_number);
        return {
          position: pos.position,
          driverNumber: pos.driver_number,
          code: driver?.name_acronym ?? String(pos.driver_number),
          fullName: driver?.full_name ?? `#${pos.driver_number}`,
          teamName: driver?.team_name ?? 'Unknown',
          teamColour: driver?.team_colour ? `#${driver.team_colour.replace(/^#/, '')}` : '#666666',
          gapToLeader: formatGap(interval?.gap_to_leader ?? null),
          interval: formatGap(interval?.interval ?? null),
        };
      })
      .sort((a, b) => a.position - b.position);

    return NextResponse.json(
      { live: true, sessionName: session.session_name, circuitShortName: session.circuit_short_name, rows } satisfies LiveTimingResponse,
      { status: 200, headers: { 'Cache-Control': 'no-store' } },
    );
  } catch (err) {
    logApiError('live-timing', err);
    return jsonApiError('Live timing unavailable', 502);
  }
}
