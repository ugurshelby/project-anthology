/**
 * Minimal structured logger for the data layer. Keeps fallback decisions and
 * Supabase call timings visible without pulling in a logging dependency.
 */

export function logSupabaseCall(table: string, op: string, durationMs: number): void {
  console.info(`[supabase] ${table} ${op} (${durationMs.toFixed(0)}ms)`);
}

export function logFallback(from: string, to: string, reason?: string): void {
  console.warn(`[data] fallback ${from} → ${to}${reason ? ` (${reason})` : ''}`);
}

/** Time an async call; returns its result plus elapsed ms. */
export async function timed<T>(fn: () => Promise<T>): Promise<{ result: T; durationMs: number }> {
  const started = Date.now();
  const result = await fn();
  return { result, durationMs: Date.now() - started };
}
