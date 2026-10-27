import { NextResponse, type NextRequest } from 'next/server';
import { getCircuitDetail } from '@/lib/data/circuits';
import { applyRateLimit } from '@/lib/rateLimit';
import { jsonApiError, logApiError } from '@/lib/api/errors';
import { circuitIdParam } from '@/lib/validation/api';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const RATE_LIMIT_WINDOW_MS = 60_000;
const RATE_LIMIT_MAX_REQUESTS = 60;

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
): Promise<NextResponse> {
  const { success, retryAfter } = await applyRateLimit(req.headers, {
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

  const parsed = circuitIdParam.safeParse((await params).id);
  if (!parsed.success) {
    return jsonApiError('Invalid circuit id', 400);
  }
  const id = parsed.data;

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
    logApiError('circuits/[id]', error);
    return jsonApiError('Failed to fetch circuit detail', 500);
  }
}
