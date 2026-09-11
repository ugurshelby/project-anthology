import { NextResponse, type NextRequest } from 'next/server';
import { CURRENT_SEASON } from '@/lib/f1Calendar';
import { applyRateLimit } from '@/lib/rateLimit';
import { getSupabaseAdmin } from '@/lib/supabase';
import type { SnapshotType } from '@/types/database';

/**
 * SSRF-hardened Ergast/Jolpica proxy (App Router port of the legacy proxy).
 *
 * The ONLY user input is the `path` query param, which is validated against a
 * strict whitelist regex before being appended to a HARDCODED upstream host.
 * No part of the host/scheme is user-controlled, so this cannot be coerced into
 * fetching arbitrary internal/external URLs.
 *
 * Read strategy (snapshot-first):
 *   1. Parse path → (season, round, snapshotType).
 *   2. If a matching row exists in f1_snapshots → return it immediately.
 *      Upstream API is never called; Jolpica outages are invisible to the user.
 *   3. If no snapshot → fetch Jolpica and return the live response.
 *   4. If Jolpica also fails (timeout / 5xx) → return whatever stale snapshot
 *      we have, or the upstream error if we have nothing.
 *
 * Caching is season-aware: historical seasons are immutable (long cache); the
 * current season is volatile (short cache + SWR).
 */

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const ERGAST_BASE = 'https://api.jolpi.ca/ergast/f1';
const FETCH_TIMEOUT_MS = 8000;

/**
 * Allowed `path` shapes (Jolpica F1 endpoints we actually use):
 *   {year}
 *   {year}/driverStandings
 *   {year}/constructorStandings
 *   {year}/{round}/results
 *   {year}/{round}/qualifying
 *   {year}/{round}/sprint
 * Trailing `.json` is optional. Anything else is rejected.
 */
const PATH_WHITELIST =
  /^\d{4}(?:\/(?:driverStandings|constructorStandings)|\/\d{1,2}\/(?:results|qualifying|sprint))?(?:\.json)?$/;

// Map the path's segment keyword to a canonical SnapshotType.
// Must stay in sync with SUFFIX_MAP in lib/f1Ingest.ts.
const PATH_SEGMENT_TO_TYPE: Record<string, SnapshotType> = {
  driverStandings: 'standings_drivers',
  constructorStandings: 'standings_constructors',
  results: 'results',
  qualifying: 'qualifying',
  sprint: 'sprint',
};

interface ParsedPath {
  season: number;
  round: number | null;   // null for season-level rows
  type: SnapshotType | null; // null when the path is just a year (calendar)
}

/**
 * Decompose a validated whitelist path into the DB lookup keys.
 * Returns null only if the path can't be parsed (shouldn't happen post-whitelist).
 */
function parsePath(path: string): ParsedPath | null {
  // Strip optional .json suffix
  const clean = path.replace(/\.json$/, '');
  const parts = clean.split('/');
  const season = Number(parts[0]);
  if (!season) return null;

  // {year} only → calendar snapshot
  if (parts.length === 1) return { season, round: null, type: 'calendar' };

  // {year}/{keyword} → season-level standings
  if (parts.length === 2) {
    const type = PATH_SEGMENT_TO_TYPE[parts[1]] ?? null;
    return { season, round: null, type };
  }

  // {year}/{round}/{keyword} → round-level session
  if (parts.length === 3) {
    const round = Number(parts[1]);
    const type = PATH_SEGMENT_TO_TYPE[parts[2]] ?? null;
    if (!round) return null;
    return { season, round, type };
  }

  return null;
}

function extractSeason(path: string): number | null {
  const m = path.match(/^(\d{4})/);
  return m ? Number(m[1]) : null;
}

function cacheControlFor(season: number | null): string {
  // Historical: effectively immutable. Current/future: short + SWR.
  if (season !== null && season < CURRENT_SEASON) {
    return 'public, s-maxage=86400, stale-while-revalidate=604800';
  }
  return 'public, s-maxage=300, stale-while-revalidate=600';
}

const RATE_LIMIT_WINDOW_MS = 60_000;
const RATE_LIMIT_MAX_REQUESTS = 60;

// ── Supabase snapshot lookup ────────────────────────────────────────────────

/**
 * Fetch a snapshot from f1_snapshots for the given (season, round, type).
 * Returns the `data` JSON field if found, null otherwise.
 */
async function fetchSnapshot(parsed: ParsedPath): Promise<unknown | null> {
  if (!parsed.type) return null; // unrecognised type — skip DB
  try {
    const db = getSupabaseAdmin();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const query = (db.from('f1_snapshots') as any)
      .select('data')
      .eq('season', parsed.season)
      .eq('type', parsed.type);

    const finalQuery =
      parsed.round !== null
        ? query.eq('round', parsed.round)
        : query.is('round', null);

    const { data, error } = await finalQuery.maybeSingle();
    if (error || !data) return null;
    return data.data ?? null;
  } catch {
    return null;
  }
}

// ── Route handler ───────────────────────────────────────────────────────────

export async function GET(req: NextRequest): Promise<NextResponse> {
  // Only `path` is a valid query param — reject anything else to keep the cache key clean.
  for (const key of req.nextUrl.searchParams.keys()) {
    if (key !== 'path') {
      return NextResponse.json({ error: 'Invalid request parameters' }, { status: 400 });
    }
  }

  // Throttle the upstream proxy so it can't be used as a free scraping relay.
  // applyRateLimit handles unknown IPs via the fallback:unknown shared bucket
  // (1/5 of normal limit) instead of bypassing protection entirely.
  const { success, retryAfter } = await applyRateLimit(req.headers, {
    prefix: 'f1-season',
    max: RATE_LIMIT_MAX_REQUESTS,
    windowMs: RATE_LIMIT_WINDOW_MS,
  });
  if (!success) {
    return NextResponse.json(
      { error: 'Too many requests' },
      { status: 429, headers: { 'Retry-After': String(retryAfter || 60) } },
    );
  }

  const raw = req.nextUrl.searchParams.get('path') ?? '';
  // Only one param allowed; reject anything unexpected to keep the cache clean.
  const path = raw.trim().replace(/^\/+/, '');

  if (!path || !PATH_WHITELIST.test(path)) {
    return NextResponse.json(
      { error: 'Invalid or disallowed path parameter' },
      { status: 400 },
    );
  }

  const season = extractSeason(path);
  const cacheControl = cacheControlFor(season);
  const parsed = parsePath(path);

  // ── 1) Snapshot-first read ──────────────────────────────────────────────
  // If the DB already has this data, return it without hitting Jolpica.
  // Keeps historical/completed data available even during API outages.
  if (parsed) {
    const snapshot = await fetchSnapshot(parsed);
    if (snapshot !== null) {
      return NextResponse.json(snapshot, {
        status: 200,
        headers: {
          'Cache-Control': cacheControl,
          'X-Data-Source': 'snapshot',
        },
      });
    }
  }

  // ── 2) Live Jolpica fetch ───────────────────────────────────────────────
  // Normalize: ensure a single trailing .json for the upstream request.
  const upstreamPath = path.endsWith('.json') ? path : `${path}.json`;
  const url = `${ERGAST_BASE}/${upstreamPath}`;

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
  try {
    const res = await fetch(url, {
      signal: controller.signal,
      headers: { Accept: 'application/json' },
    });

    if (res.status === 404) {
      return NextResponse.json({ MRData: {} }, { status: 200, headers: { 'Cache-Control': cacheControl } });
    }
    if (!res.ok) {
      // ── 3) Stale-snapshot fallback on upstream error ──────────────────
      // If Jolpica returns 5xx/429 and we have any snapshot for this path,
      // serve it as stale rather than returning an error to the client.
      if (parsed) {
        const stale = await fetchSnapshot(parsed);
        if (stale !== null) {
          return NextResponse.json(stale, {
            status: 200,
            headers: {
              'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300',
              'X-Data-Source': 'snapshot-stale',
            },
          });
        }
      }
      return NextResponse.json(
        { error: `Upstream ${res.status}` },
        { status: 502 },
      );
    }

    const data = await res.json();
    return NextResponse.json(data, {
      status: 200,
      headers: {
        'Cache-Control': cacheControl,
        'X-Data-Source': 'jolpica',
      },
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Unknown error';
    const isTimeout = msg.toLowerCase().includes('abort');

    // ── 3) Stale-snapshot fallback on network/timeout error ───────────
    if (parsed) {
      const stale = await fetchSnapshot(parsed);
      if (stale !== null) {
        return NextResponse.json(stale, {
          status: 200,
          headers: {
            'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300',
            'X-Data-Source': 'snapshot-stale',
          },
        });
      }
    }

    return NextResponse.json({ error: 'Proxy fetch failed' }, { status: isTimeout ? 504 : 502 });
  } finally {
    clearTimeout(timer);
  }
}
