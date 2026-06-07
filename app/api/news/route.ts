/**
 * Live F1 news aggregator — fallback when news_cache is empty or unavailable.
 * Delegates to lib/news/aggregate.ts (shared with sync-news cron).
 */

import { NextResponse, type NextRequest } from 'next/server';
import { aggregate } from '@/lib/news/aggregate';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const RATE_LIMIT_WINDOW_MS = 60_000;
const RATE_LIMIT_MAX_REQUESTS = 30;
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

function getClientIP(req: NextRequest): string {
  const forwardedFor = req.headers.get('x-forwarded-for');
  if (forwardedFor) return forwardedFor.split(',')[0]?.trim() || 'unknown';
  return req.headers.get('x-real-ip') || 'unknown';
}

function checkRateLimit(clientIP: string): boolean {
  if (clientIP === 'unknown') return true;
  const now = Date.now();
  const record = rateLimitStore.get(clientIP);
  if (rateLimitStore.size > 1000) {
    for (const [ip, data] of rateLimitStore.entries()) {
      if (now > data.resetTime) rateLimitStore.delete(ip);
    }
  }
  if (!record || now > record.resetTime) {
    rateLimitStore.set(clientIP, { count: 1, resetTime: now + RATE_LIMIT_WINDOW_MS });
    return true;
  }
  if (record.count >= RATE_LIMIT_MAX_REQUESTS) return false;
  record.count++;
  return true;
}

export async function GET(req: NextRequest): Promise<NextResponse> {
  if ([...req.nextUrl.searchParams.keys()].length > 0) {
    return NextResponse.json({ error: 'Invalid request parameters' }, { status: 400 });
  }

  if (!checkRateLimit(getClientIP(req))) {
    return NextResponse.json(
      { error: 'Too many requests' },
      { status: 429, headers: { 'Retry-After': '60' } },
    );
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
