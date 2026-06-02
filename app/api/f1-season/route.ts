import { NextResponse, type NextRequest } from 'next/server';
import {
  appendPassthroughParams,
  assertProxyUrlWithinLimit,
  corsHeaders,
  getAllowedOrigin,
  sanitizeProxyPath,
} from '@/lib/f1Proxy';
import { getF1Context } from '@/lib/f1Calendar';
import { logRequest } from '@/lib/apiLogger';

/**
 * Ergast (Jolpica) season proxy — App Router port of legacy `api/f1-season.ts`.
 * SSRF-hardened path allowlist. Cache TTL is season-aware via `getF1Context()`:
 *   - current season  -> s-maxage=300
 *   - historical year -> s-maxage=86400
 */

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const ERGAST_BASE = 'https://api.jolpi.ca/ergast/f1';

/**
 * Season-aware edge cache. Uses `getF1Context()` (single source of truth) to detect
 * the current season; the calendar map is memoised, so this resolves to one network
 * fetch per server instance, not per request.
 */
async function seasonCacheControl(path: string, ok: boolean): Promise<string> {
  if (!ok) return 's-maxage=60, stale-while-revalidate=300';

  const m = path.match(/^(\d{4})(?:\/|\.json|$)/);
  const year = m ? Number(m[1]) : NaN;
  if (!Number.isFinite(year)) {
    // Non-year paths (e.g. "current/...") are treated as live -> short TTL.
    return 'public, s-maxage=300, stale-while-revalidate=600';
  }

  const { currentSeason } = await getF1Context();
  if (year < currentSeason) {
    return 'public, s-maxage=86400, stale-while-revalidate=86400';
  }
  if (year === currentSeason) {
    return 'public, s-maxage=300, stale-while-revalidate=600';
  }
  // Future season — keep short until it becomes current.
  return 'public, s-maxage=300, stale-while-revalidate=3600';
}

export async function OPTIONS(req: NextRequest): Promise<NextResponse> {
  return new NextResponse(null, { status: 204, headers: corsHeaders(getAllowedOrigin(req)) });
}

export async function GET(req: NextRequest): Promise<NextResponse> {
  const startedAt = Date.now();
  const path = req.nextUrl.pathname;
  const log = (status: number): void => logRequest({ route: 'f1-season', method: 'GET', path, startedAt }, status);
  const cors = corsHeaders(getAllowedOrigin(req));

  try {
    const params = req.nextUrl.searchParams;
    const pathResult = sanitizeProxyPath(params.get('path') ?? '');
    if (!pathResult.ok) {
      log(400);
      return NextResponse.json({ error: pathResult.error }, { status: 400, headers: cors });
    }

    const upstream = new URL(`${ERGAST_BASE}/${pathResult.path}`);
    appendPassthroughParams(upstream, params);

    const urlStr = upstream.toString();
    if (!assertProxyUrlWithinLimit(urlStr)) {
      log(414);
      return NextResponse.json({ error: 'Request URL too long' }, { status: 414, headers: cors });
    }

    const response = await fetch(urlStr, { headers: { Accept: 'application/json' } });
    const text = await response.text();
    const cacheCtl = await seasonCacheControl(pathResult.path, response.ok);

    if (!text.trim()) {
      const headers = { ...cors, 'Cache-Control': await seasonCacheControl(pathResult.path, false), 'Content-Type': 'application/json; charset=utf-8' };
      log(response.status);
      return new NextResponse('null', { status: response.status, headers });
    }

    let json: unknown;
    try {
      json = JSON.parse(text);
    } catch {
      const headers = { ...cors, 'Cache-Control': await seasonCacheControl(pathResult.path, false) };
      const snippet = text.length > 400 ? `${text.slice(0, 400)}…` : text;
      if (!response.ok) {
        log(response.status);
        return NextResponse.json({ error: snippet || response.statusText || 'Upstream error' }, { status: response.status, headers });
      }
      log(502);
      return NextResponse.json({ error: 'Upstream returned non-JSON' }, { status: 502, headers });
    }

    log(response.status);
    return new NextResponse(JSON.stringify(json), {
      status: response.status,
      headers: { ...cors, 'Cache-Control': cacheCtl, 'Content-Type': 'application/json; charset=utf-8' },
    });
  } catch (error) {
    log(500);
    if (process.env.NODE_ENV !== 'production') {
      console.error('[f1-season]', error);
      const msg = error instanceof Error ? error.message : 'Unknown error';
      return NextResponse.json({ error: msg }, { status: 500, headers: cors });
    }
    return NextResponse.json({ error: 'Upstream request failed' }, { status: 500, headers: cors });
  }
}
