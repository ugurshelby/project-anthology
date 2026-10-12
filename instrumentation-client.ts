import { loadSentry, sentryEnabled } from '@/lib/monitoring/clientErrors';

// Sentry loads after the page and only with a DSN (lib/monitoring/clientErrors.ts).
if (sentryEnabled) {
  const start = () => void loadSentry();
  if (typeof window !== 'undefined' && 'requestIdleCallback' in window) window.requestIdleCallback(start);
  else setTimeout(start, 1);
}

export function onRouterTransitionStart(href: string, navigationType: string): void {
  void loadSentry()?.then((Sentry) => Sentry.captureRouterTransitionStart(href, navigationType));
}
