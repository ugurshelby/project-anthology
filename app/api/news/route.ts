/**
 * Live F1 news aggregator — fallback when news_cache is empty or unavailable.
 * Delegates to lib/news/aggregate.ts (shared with sync-news cron).
 */

import { NextResponse, type NextRequest } from 'next/server';
import { aggregate } from '@/lib/news/aggregate';
import { rateLimit, getClientIP } from '@/lib/rateLimit';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const RATE_LIMIT_WINDOW_MS = 60_000;
const RATE_LIMIT_MAX_REQUESTS = 30;

export async function GET(req: NextRequest): Promise<NextResponse> {
  if ([...req.nextUrl.searchParams.keys()].length > 0) {
    return NextResponse.json({ error: 'Invalid request parameters' }, { status: 400 });
  }

  const clientIP = getClientIP(req.headers);
  if (clientIP !== 'unknown') {
    const { success, retryAfter } = await rateLimit(clientIP, {
      prefix: 'news',
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

  try {
    const items = await aggregate({ maxItems: 60 });
    return NextResponse.json(items, {
      status: 200,
      headers: { 'Cache-Control': 's-maxage=300, stale-while-revalidate=600' },
    });
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Unknown error';
    if (msg.includes('timeout')) {
      return NextResponse.json({ error: 'Request timeout' }, { status: 504 });
    }
    return NextResponse.json({ error: 'Failed to fetch news' }, { status: 500 });
  }
}
