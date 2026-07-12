import { NextResponse, type NextRequest } from 'next/server';
import { getTeamCareer } from '@/lib/data/entities';
import { getTeamLore } from '@/data/teams';
import { rateLimit, getClientIP } from '@/lib/rateLimit';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const RATE_LIMIT_WINDOW_MS = 60_000;
const RATE_LIMIT_MAX_REQUESTS = 60;

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ constructorId: string }> },
): Promise<NextResponse> {
  const clientIP = getClientIP(req.headers);
  if (clientIP !== 'unknown') {
    const { success, retryAfter } = await rateLimit(clientIP, {
      prefix: 'team-career',
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

  const { constructorId } = await params;

  try {
    const [career, lore] = await Promise.all([
      getTeamCareer(constructorId),
      Promise.resolve(getTeamLore(constructorId)),
    ]);
    return NextResponse.json(
      { ...career, lore },
      {
        status: 200,
        headers: { 'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400' },
      },
    );
  } catch (error) {
    console.error('[api/teams/[constructorId]/career] failed:', error);
    return NextResponse.json({ error: 'Failed to fetch team career' }, { status: 500 });
  }
}
