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
 *
 * Load safety: OpenF1's own limit is 3 req/s / 30 req/min TOTAL — shared across
 * every visitor, not per-client. Without a shared cache, N concurrent viewers
 * would fan out to N x 3 upstream OpenF1 calls, blowing that budget well
 * before N reaches 10. Two layers keep this bounded regardless of visitor
 * count:
 *  1. `Cache-Control: s-maxage` — Vercel's edge caches the response for
 *     CACHE_TTL_MS across ALL viewers hitting the same edge node; most
 *     concurrent requests never reach this function at all.
 *  2. An in-memory per-warm-instance memo + in-flight stampede guard (same
 *     pattern as lib/news/aggregate.ts) — belt-and-braces for requests that
 *     do reach the function (edge cache miss, or a host without the CDN
 *     layer), so concurrent invocations on one instance still make one
 *     upstream call, not one each.
 */

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const RATE_LIMIT_WINDOW_MS = 60_000;
const RATE_LIMIT_MAX_REQUESTS = 30;

/** Matches the client's ~12s poll interval — no point caching shorter than that. */
const CACHE_TTL_MS = 5_000;
const CACHE_CONTROL_HEADER = `public, s-maxage=${CACHE_TTL_MS / 1000}, stale-while-revalidate=${(CACHE_TTL_MS * 3) / 1000}`;

/**
 * Hard ceiling on how long one request waits for OpenF1. The adapter's own
 * per-request timeout + exponential-backoff retries (lib/f1/sources/openf1.ts)
 * can legitimately take upwards of a minute in the worst case if OpenF1 is
 * degraded — exactly the moment a race-day traffic spike also hits this route.
 * Without this, a slow upstream would hold the serverless function open,
 * burning concurrency budget instead of failing fast. On timeout we still
 * serve the last good in-memory result if one exists (see GET below).
 */
const HARD_TIMEOUT_MS = 8_000;

function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error('live-timing: upstream timeout')), ms);
    promise.then(
      (v) => {
        clearTimeout(timer);
        resolve(v);
      },
      (e) => {
        clearTimeout(timer);
        reject(e);
      },
    );
  });
}

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

async function loadLiveTiming(): Promise<LiveTimingResponse> {
  const session = await fetchLatestSession();
  if (!session) {
    return { live: false, sessionName: null, circuitShortName: null, rows: [] };
  }

  const startMs = Date.parse(session.date_start);
  const endMs = Date.parse(session.date_end);
  const nowMs = Date.now();
  const isLive =
    Number.isFinite(startMs) &&
    nowMs >= startMs &&
    (!Number.isFinite(endMs) || nowMs <= endMs + POST_SESSION_GRACE_MS);

  if (!isLive) {
    return { live: false, sessionName: session.session_name, circuitShortName: session.circuit_short_name, rows: [] };
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

  return { live: true, sessionName: session.session_name, circuitShortName: session.circuit_short_name, rows };
}

// Per-warm-instance memo + stampede guard — see the load-safety note above.
let _cache: { data: LiveTimingResponse; ts: number } | null = null;
let _inflight: Promise<LiveTimingResponse> | null = null;

async function getLiveTimingCached(): Promise<LiveTimingResponse> {
  if (_cache && Date.now() - _cache.ts < CACHE_TTL_MS) return _cache.data;
  if (_inflight) return _inflight;

  _inflight = loadLiveTiming()
    .then((data) => {
      _cache = { data, ts: Date.now() };
      return data;
    })
    .finally(() => {
      _inflight = null;
    });

  try {
    return await _inflight;
  } catch (err) {
    if (_cache) return _cache.data; // serve-stale-on-error
    throw err;
  }
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
    let data: LiveTimingResponse;
    try {
      data = await withTimeout(getLiveTimingCached(), HARD_TIMEOUT_MS);
    } catch (timeoutOrErr) {
      // Upstream is slow/down — serve the last known-good result rather than
      // hang the function until OpenF1's own retry/backoff chain gives up.
      if (_cache) {
        data = _cache.data;
      } else {
        throw timeoutOrErr;
      }
    }
    return NextResponse.json(data, { status: 200, headers: { 'Cache-Control': CACHE_CONTROL_HEADER } });
  } catch (err) {
    logApiError('live-timing', err);
    return jsonApiError('Live timing unavailable', 502);
  }
}
