/**
 * Consistent API error logging and response helpers.
 *
 * Routes return generic client-facing messages; full detail goes to server logs
 * (and Sentry via next.config instrumentation). Never leak upstream/DB text.
 */

import { NextResponse } from 'next/server';

/** Log a route failure with a stable prefix for log aggregation. */
export function logApiError(route: string, error: unknown): void {
  const detail = error instanceof Error ? error.message : String(error);
  console.error(`[api ${route}] failed:`, detail);
}

/** JSON error body with a generic message — no internal detail. */
export function jsonApiError(message: string, status: number): NextResponse {
  return NextResponse.json({ error: message }, { status });
}
