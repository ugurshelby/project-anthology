import type { NextConfig } from "next";
import { withSentryConfig } from "@sentry/nextjs";

// Pragmatic Content-Security-Policy. Allows the origins this app actually uses
// (Supabase, Sentry, Vercel insights, news image CDNs) without breaking Next's
// runtime, inline JSON-LD, or next/font. 'unsafe-inline'/'unsafe-eval' are
// required by the Next.js client runtime and inline schema scripts; a stricter
// nonce-based policy is a separate future hardening step.
const CSP = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob: https:",
  "font-src 'self' data:",
  "connect-src 'self' https://*.supabase.co https://*.sentry.io https://*.ingest.sentry.io https://vitals.vercel-insights.com https://api.jolpi.ca https://api.openf1.org",
  "frame-ancestors 'self'",
  "base-uri 'self'",
  "form-action 'self'",
  "object-src 'none'",
].join('; ');

const SECURITY_HEADERS = [
  { key: 'Content-Security-Policy', value: CSP },
  { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'Cross-Origin-Opener-Policy', value: 'same-origin' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
];

const nextConfig: NextConfig = {
  async redirects() {
    return [{ source: '/radio', destination: '/anthology', permanent: true }];
  },
  async headers() {
    return [{ source: '/:path*', headers: SECURITY_HEADERS }];
  },
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: '**.motorsport.com' },
      { protocol: 'https', hostname: '**.autosport.com' },
      { protocol: 'https', hostname: 'storage.ghost.io' },
      { protocol: 'https', hostname: '**.the-race.com' },
    ],
  },
  // Keep heavy/unnecessary files out of serverless function bundles. NOTE:
  // jsdom must NOT be excluded — the news aggregator (lib/news/aggregate.ts)
  // loads it via dynamic import at runtime in the sync-news cron, so excluding
  // it crashes that function ("Cannot find module 'jsdom-…'"). canvas is jsdom's
  // optional peer (not used here) and stays excluded to keep the bundle small.
  outputFileTracingExcludes: {
    '*': [
      './public/**/*',
      './node_modules/canvas/**/*',
      './.next/cache/**/*',
    ],
  },
};

export default withSentryConfig(nextConfig, {
  org: "anthology-z0",
  project: "project-anthology",
  authToken: process.env.SENTRY_AUTH_TOKEN,
  widenClientFileUpload: true,
  tunnelRoute: "/monitoring",
  silent: !process.env.CI,
});
