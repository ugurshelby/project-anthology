/**
 * Minimal, Next-safe request logger for App Router route handlers (Node runtime).
 * Logs a single structured line per request: method, path, status, duration.
 *
 * NOTE: `utils/logger.ts` is Vite-based (`import.meta.env`) and cannot run on the
 * Next.js server — this is the server-side replacement for API routes.
 */

export interface RequestLogContext {
  /** Logical route name, e.g. "news", "f1-season". */
  route: string;
  method: string;
  path: string;
  /** Result of `Date.now()` captured at handler entry. */
  startedAt: number;
}

/** Logs `[route] METHOD path -> status (Nms)`. Always emitted (errors + access). */
export function logRequest(ctx: RequestLogContext, status: number): void {
  const duration = Date.now() - ctx.startedAt;
  const line = `[${ctx.route}] ${ctx.method} ${ctx.path} -> ${status} (${duration}ms)`;
  if (status >= 500) {
    console.error(line);
  } else {
    console.log(line);
  }
}
