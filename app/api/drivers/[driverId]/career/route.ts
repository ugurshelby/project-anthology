import { NextResponse, type NextRequest } from 'next/server';
import { getDriverCareer } from '@/lib/data/entities';
import { getDriverLore } from '@/data/drivers';
import { rateLimit, getClientIP } from '@/lib/rateLimit';
import { isErgastSlug } from '@/lib/api/validation';
import { jsonApiError, logApiError } from '@/lib/api/errors';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const RATE_LIMIT_WINDOW_MS = 60_000;
const RATE_LIMIT_MAX_REQUESTS = 60;

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ driverId: string }> },
): Promise<NextResponse> {
  const clientIP = getClientIP(req.headers);
  if (clientIP !== 'unknown') {
    const { success, retryAfter } = await rateLimit(clientIP, {
      prefix: 'driver-career',
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

  const { driverId } = await params;

  if (!isErgastSlug(driverId)) {
    return jsonApiError('Invalid driver id', 400);
  }

  try {
    const [career, lore] = await Promise.all([
      getDriverCareer(driverId),
      Promise.resolve(getDriverLore(driverId)),
    ]);
    return NextResponse.json(
      { ...career, lore },
      {
        status: 200,
        headers: { 'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400' },
      },
    );
  } catch (error) {
    logApiError('drivers/[driverId]/career', error);
    return jsonApiError('Failed to fetch driver career', 500);
  }
}
