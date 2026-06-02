/** Structured logging for server-side data layer (Supabase + fallbacks). */

export function logSupabaseCall(
  table: string,
  operation: string,
  durationMs: number,
  extra?: string,
): void {
  const suffix = extra ? ` ${extra}` : '';
  console.log(`[data] supabase ${table} ${operation} ${durationMs}ms${suffix}`);
}

export function logFallback(failedLayer: string, takeoverLayer: string, detail?: string): void {
  const msg = detail ? `${failedLayer} (${detail})` : failedLayer;
  console.warn(`[data] fallback: ${msg} → ${takeoverLayer}`);
}

export async function timed<T>(
  fn: () => Promise<T>,
): Promise<{ result: T; durationMs: number }> {
  const start = Date.now();
  const result = await fn();
  return { result, durationMs: Date.now() - start };
}
