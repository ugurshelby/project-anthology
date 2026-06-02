import { NextResponse, type NextRequest } from 'next/server';
import { logRequest } from '@/lib/apiLogger';

/** Health check endpoint for monitoring and load-balancer probes. */

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest): Promise<NextResponse> {
  const startedAt = Date.now();
  const path = req.nextUrl.pathname;

  try {
    const body = {
      status: 'ok',
      timestamp: new Date().toISOString(),
      version: '2.0.0',
    };
    logRequest({ route: 'health', method: 'GET', path, startedAt }, 200);
    return NextResponse.json(body, { status: 200, headers: { 'Cache-Control': 'no-store' } });
  } catch {
    logRequest({ route: 'health', method: 'GET', path, startedAt }, 500);
    return NextResponse.json(
      { status: 'error', timestamp: new Date().toISOString(), error: 'Health check failed' },
      { status: 500, headers: { 'Cache-Control': 'no-store' } },
    );
  }
}
