import { NextResponse, type NextRequest } from 'next/server';
import { jsonApiError, logApiError } from '@/lib/api/errors';
import { getMediaBatch, type MediaResult } from '@/lib/media/read';
import { applyRateLimit } from '@/lib/rateLimit';
import { mediaQuery } from '@/lib/validation/api';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const RATE_LIMIT_WINDOW_MS = 60_000;
const RATE_LIMIT_MAX_REQUESTS = 120;

/**
 * GET /api/media?type=driver|team|car|circuit&keys=a,b,c
 *
 * Batch image lookup from our own database. Takes ONLY an entity type and a
 * list of validated keys — never a URL. Every requested key is answered:
 * `status: "image"` (with variants + attribution) or `status: "placeholder"`.
 * CDN-cacheable: images change rarely and URLs are content-addressed.
 */
export async function GET(req: NextRequest): Promise<NextResponse> {
  const { success, retryAfter } = await applyRateLimit(req.headers, {
    prefix: 'media',
    max: RATE_LIMIT_MAX_REQUESTS,
    windowMs: RATE_LIMIT_WINDOW_MS,
  });
  if (!success) {
    return NextResponse.json(
      { error: 'Too many requests' },
      { status: 429, headers: { 'Retry-After': String(retryAfter || 60) } },
    );
  }

  const parsed = mediaQuery.safeParse({
    type: req.nextUrl.searchParams.get('type'),
    keys: req.nextUrl.searchParams.get('keys'),
  });
  if (!parsed.success) {
    const badType = parsed.error.issues.some((issue) => issue.path[0] === 'type');
    return jsonApiError(badType ? 'Invalid type' : 'Invalid keys', 400);
  }
  const { type, keys } = parsed.data;

  try {
    const map = await getMediaBatch(type, keys);
    const items: Record<string, MediaResult> = {};
    for (const key of keys) items[key] = map.get(key)!;
    return NextResponse.json(
      { type, items },
      {
        headers: {
          // 1h at the CDN, serve stale for a day while revalidating.
          'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
        },
      },
    );
  } catch (err) {
    logApiError('media', err);
    return jsonApiError('Media lookup failed', 500);
  }
}
