import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  sendDefaultPii: true,
  tracesSampleRate: process.env.NODE_ENV === "development" ? 1.0 : 0.1,
  enableLogs: true,
  // Session replay removed: adds ~400KB to the client bundle.
  // Re-enable if replay becomes a product requirement.
  integrations: [],
});

export const onRouterTransitionStart = Sentry.captureRouterTransitionStart;
