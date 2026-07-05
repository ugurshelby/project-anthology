import { NextResponse, type NextRequest } from 'next/server';
import { getSeasonData } from '@/lib/data/f1';
import { CURRENT_SEASON, F1_SEASON_MIN } from '@/lib/f1Calendar';
import { rateLimit, getClientIP } from '@/lib/rateLimit';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const RATE_LIMIT_WINDOW_MS = 60_000;
const RATE_LIMIT_MAX_REQUESTS = 60;

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ year: string }> },
): Promise<NextResponse> {
  const clientIP = getClientIP(req.headers);
  if (clientIP !== 'unknown') {
    const { success, retryAfter } = await rateLimit(clientIP, {
      prefix: 'season',
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

  const { year: yearStr } = await params;
  const year = Number(yearStr);

  if (!Number.isFinite(year) || year < F1_SEASON_MIN || year > CURRENT_SEASON) {
    return NextResponse.json({ error: 'Invalid season year' }, { status: 400 });
  }

  try {
    const data = await getSeasonData(year);
    const cacheControl =
      year < CURRENT_SEASON
        ? 'public, s-maxage=86400, stale-while-revalidate=604800'
        : 'public, s-maxage=60, stale-while-revalidate=300';

    return NextResponse.json(data, {
      status: 200,
      headers: { 'Cache-Control': cacheControl },
    });
  } catch (error) {
    console.error('[api/season] failed:', error);
    return NextResponse.json({ error: 'Failed to fetch season data' }, { status: 500 });
  }
}
