import { NextResponse, type NextRequest } from 'next/server';
import { CURRENT_SEASON } from '@/lib/f1Calendar';

/**
 * SSRF-hardened Ergast/Jolpica proxy (App Router port of the legacy proxy).
 *
 * The ONLY user input is the `path` query param, which is validated against a
 * strict whitelist regex before being appended to a HARDCODED upstream host.
 * No part of the host/scheme is user-controlled, so this cannot be coerced into
 * fetching arbitrary internal/external URLs.
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

export async function GET(req: NextRequest): Promise<NextResponse> {
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
      return NextResponse.json({ MRData: {} }, { status: 200, headers: { 'Cache-Control': cacheControlFor(season) } });
    }
    if (!res.ok) {
      return NextResponse.json(
        { error: `Upstream ${res.status}` },
        { status: 502 },
      );
    }

    const data = await res.json();
    return NextResponse.json(data, {
      status: 200,
      headers: { 'Cache-Control': cacheControlFor(season) },
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Unknown error';
    const status = msg.toLowerCase().includes('abort') ? 504 : 502;
    return NextResponse.json({ error: 'Proxy fetch failed' }, { status });
  } finally {
    clearTimeout(timer);
  }
}
