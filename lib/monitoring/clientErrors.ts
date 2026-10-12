/**
 * Browser-side Sentry, loaded only when it can do something.
 *
 * `@sentry/nextjs` is ~130 KB gzip in the browser. Imported eagerly (as the
 * error boundaries did) it shipped on every page even with no DSN set, which
 * is the case on production since the Sentry project is not connected
 * (plan 6.3; measured 2026-10-12: largest home-page chunk, 133 KB gzip).
 * Now nothing loads without `NEXT_PUBLIC_SENTRY_DSN`, and with it the SDK
 * arrives in its own chunk after the page instead of before it.
 */
const DSN = process.env.NEXT_PUBLIC_SENTRY_DSN;

export const sentryEnabled = Boolean(DSN);

type SentryModule = typeof import('@sentry/nextjs');

let loading: Promise<SentryModule> | null = null;

/** The SDK, initialised once; null when no DSN is configured. */
export function loadSentry(): Promise<SentryModule> | null {
  if (!DSN) return null;
  loading ??= import('@sentry/nextjs').then((Sentry) => {
    Sentry.init({
      dsn: DSN,
      sendDefaultPii: true,
      tracesSampleRate: process.env.NODE_ENV === 'development' ? 1.0 : 0.1,
      enableLogs: true,
      // Session replay removed: adds ~400KB to the client bundle.
      integrations: [],
    });
    return Sentry;
  });
  return loading;
}

/** Report an error caught by an error boundary (no-op without a DSN). */
export function captureClientError(error: unknown): void {
  void loadSentry()?.then((Sentry) => Sentry.captureException(error));
}
