/**
 * Live F1 news aggregator — fallback when news_cache is empty or unavailable.
 * Delegates to lib/news/aggregate.ts (shared with sync-news cron).
 */

import { NextResponse, type NextRequest } from 'next/server';
import { aggregate } from '@/lib/news/aggregate';
import { rateLimit } from '@/lib/rateLimit';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const RATE_LIMIT_WINDOW_MS = 60_000;
const RATE_LIMIT_MAX_REQUESTS = 30;

function getClientIP(req: NextRequest): string {
  // Vercel's proxy sets x-real-ip from the actual connection; unlike the first
  // x-forwarded-for entry it cannot be spoofed by the client (Council B-1).
  const realIp = req.headers.get('x-real-ip');
  if (realIp) return realIp.trim();
  // Outside Vercel (local dev), the rightmost XFF entry is the nearest hop —
  // infrastructure-appended, not client-supplied.
  const forwardedFor = req.headers.get('x-forwarded-for');
  if (forwardedFor) {
    const parts = forwardedFor.split(',');
    return parts[parts.length - 1]?.trim() || 'unknown';
  }
  return 'unknown';
}

export async function GET(req: NextRequest): Promise<NextResponse> {
  if ([...req.nextUrl.searchParams.keys()].length > 0) {
    return NextResponse.json({ error: 'Invalid request parameters' }, { status: 400 });
  }

  const clientIP = getClientIP(req);
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
