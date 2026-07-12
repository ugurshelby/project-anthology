import { NextResponse, type NextRequest } from 'next/server';
import { getCircuitDetail } from '@/lib/data/circuits';
import { rateLimit, getClientIP } from '@/lib/rateLimit';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const RATE_LIMIT_WINDOW_MS = 60_000;
const RATE_LIMIT_MAX_REQUESTS = 60;

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
): Promise<NextResponse> {
  const clientIP = getClientIP(req.headers);
  if (clientIP !== 'unknown') {
    const { success, retryAfter } = await rateLimit(clientIP, {
      prefix: 'circuit-detail',
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

  const { id } = await params;

  try {
    const circuit = await getCircuitDetail(id);
    if (!circuit) {
      return NextResponse.json({ error: 'Circuit not found' }, { status: 404 });
    }
    return NextResponse.json(circuit, {
      status: 200,
      headers: { 'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400' },
    });
  } catch (error) {
    console.error('[api/circuits/[id]] failed:', error);
    return NextResponse.json({ error: 'Failed to fetch circuit detail' }, { status: 500 });
  }
}
