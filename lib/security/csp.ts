/**
 * Content-Security-Policy — single source for next.config headers + tests.
 * Keep this in lockstep with origins the app actually talks to.
 */
export const CSP_DIRECTIVES = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://vercel.live",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob: https:",
  // next/font is same-origin; Vercel Toolbar (preview) loads Geist from vercel.live.
  "font-src 'self' data: https://vercel.live",
  "frame-src 'self' https://vercel.live",
  "connect-src 'self' data: https://*.supabase.co https://*.sentry.io https://*.ingest.sentry.io https://vitals.vercel-insights.com https://api.jolpi.ca https://api.openf1.org https://api.open-meteo.com",
  "frame-ancestors 'self' https://portfolio-orcin-chi-ad77scl275.vercel.app https://*.vercel.app",
  "base-uri 'self'",
  "form-action 'self'",
  "object-src 'none'",
  "worker-src 'self'",
  "manifest-src 'self'",
  "media-src 'self' https:",
  "upgrade-insecure-requests",
] as const;

export const CSP = CSP_DIRECTIVES.join('; ');
