import { NextResponse, type NextRequest } from 'next/server';
import {
  appendPassthroughParams,
  assertProxyUrlWithinLimit,
  corsHeaders,
  getAllowedOrigin,
  isOpenF1LiveForCacheControl,
  sanitizeProxyPath,
} from '@/lib/f1Proxy';
import { logRequest } from '@/lib/apiLogger';

/**
 * OpenF1 live-timing proxy — App Router port of legacy `api/f1-live.ts`.
 * SSRF-hardened path allowlist. Active session payloads are served `no-store`;
 * everything else gets a short `s-maxage=30, stale-while-revalidate=60`.
 */

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const OPEN_F1_BASE = 'https://api.openf1.org/v1';
const OPEN_F1_ALLOWED_BASE_PATHS = new Set([
  'sessions',
  'drivers',
  'position',
  'intervals',
  'stints',
  'pit',
  'car_data',
  'laps',
  'race_control',
  'weather',
]);

export async function OPTIONS(req: NextRequest): Promise<NextResponse> {
  return new NextResponse(null, { status: 204, headers: corsHeaders(getAllowedOrigin(req)) });
}

export async function GET(req: NextRequest): Promise<NextResponse> {
  const startedAt = Date.now();
  const path = req.nextUrl.pathname;
  const log = (status: number): void => logRequest({ route: 'f1-live', method: 'GET', path, startedAt }, status);
  const cors = corsHeaders(getAllowedOrigin(req));

  try {
    const params = req.nextUrl.searchParams;
    const rawPath = params.get('path') ?? '';
    const [rawPathOnly, ...inlineQueryParts] = rawPath.split('?');
    const pathResult = sanitizeProxyPath(rawPathOnly);
    if (!pathResult.ok) {
      log(400);
      return NextResponse.json({ error: pathResult.error }, { status: 400, headers: cors });
    }

    const basePath = pathResult.path.split('/')[0]?.toLowerCase() ?? '';
    if (!OPEN_F1_ALLOWED_BASE_PATHS.has(basePath)) {
      log(400);
      return NextResponse.json({ error: 'Path not allowed' }, { status: 400, headers: cors });
    }

    const upstream = new URL(`${OPEN_F1_BASE}/${pathResult.path}`);
    if (inlineQueryParts.length > 0) {
      const inlinePathParams = new URLSearchParams(inlineQueryParts.join('?'));
      inlinePathParams.forEach((value, key) => upstream.searchParams.append(key, value));
    }
    appendPassthroughParams(upstream, params);

    const urlStr = upstream.toString();
    if (!assertProxyUrlWithinLimit(urlStr)) {
      log(414);
      return NextResponse.json({ error: 'Request URL too long' }, { status: 414, headers: cors });
    }

    const response = await fetch(urlStr, { headers: { Accept: 'application/json' } });
    const text = await response.text();

    if (!text.trim()) {
      log(response.status);
      return new NextResponse('null', {
        status: response.status,
        headers: { ...cors, 'Cache-Control': 'no-store', 'Content-Type': 'application/json; charset=utf-8' },
      });
    }

    let json: unknown;
    try {
      json = JSON.parse(text);
    } catch {
      const headers = { ...cors, 'Cache-Control': 'no-store' };
      const snippet = text.length > 400 ? `${text.slice(0, 400)}…` : text;
      if (!response.ok) {
        log(response.status);
        return NextResponse.json({ error: snippet || response.statusText || 'Upstream error' }, { status: response.status, headers });
      }
      log(502);
      return NextResponse.json({ error: 'Upstream returned non-JSON' }, { status: 502, headers });
    }

    // Live session rows must never be cached; static data tolerates a short TTL.
    const isLive = isOpenF1LiveForCacheControl(json);
    log(response.status);
    return new NextResponse(JSON.stringify(json), {
      status: response.status,
      headers: {
        ...cors,
        'Cache-Control': isLive ? 'no-store' : 's-maxage=30, stale-while-revalidate=60',
        'Content-Type': 'application/json; charset=utf-8',
      },
    });
  } catch (error) {
    log(500);
    if (process.env.NODE_ENV !== 'production') {
      console.error('[f1-live]', error);
      const msg = error instanceof Error ? error.message : 'Unknown error';
      return NextResponse.json({ error: msg }, { status: 500, headers: cors });
    }
    return NextResponse.json({ error: 'Upstream request failed' }, { status: 500, headers: cors });
  }
}
