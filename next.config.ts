import type { NextConfig } from "next";
import { withSentryConfig } from "@sentry/nextjs";
import { CSP } from "./lib/security/csp";

// CSP lives in lib/security/csp.ts so tests can assert Toolbar font-src.

const SECURITY_HEADERS = [
  { key: 'Content-Security-Policy', value: CSP },
  { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'Cross-Origin-Opener-Policy', value: 'same-origin' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  {
    key: 'Strict-Transport-Security',
    value: 'max-age=63072000; includeSubDomains; preload',
  },
  {
    key: 'Permissions-Policy',
    value: 'camera=(), microphone=(), geolocation=(), browsing-topics=()',
  },
];

// On Vercel preview deployments, add noindex so search engines don't index staging.
// Production (VERCEL_ENV=production) never gets noindex.
const isPreview = process.env.VERCEL_ENV === 'preview';
const ROBOTS_HEADERS = isPreview
  ? [{ key: 'X-Robots-Tag', value: 'noindex' }]
  : [];

const nextConfig: NextConfig = {
  // Don't advertise the framework — small reverse-engineering surface reduction.
  poweredByHeader: false,
  async redirects() {
    return [{ source: '/radio', destination: '/anthology', permanent: true }];
  },
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [...SECURITY_HEADERS, ...ROBOTS_HEADERS],
      },
    ];
  },
  images: {
    // Drop 2048/3840 so news/srcset never asks the optimizer for 4K variants.
    deviceSizes: [640, 750, 828, 1080, 1200, 1920],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    remotePatterns: [
      { protocol: 'https', hostname: '**.motorsport.com' },
      { protocol: 'https', hostname: '**.autosport.com' },
      { protocol: 'https', hostname: 'storage.ghost.io' },
      { protocol: 'https', hostname: '**.the-race.com' },
      { protocol: 'https', hostname: '**.bbc.co.uk' },
      { protocol: 'https', hostname: '**.racefans.net' },
      { protocol: 'https', hostname: 'ichef.bbci.co.uk' },
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

const sentryAuthToken = process.env.SENTRY_AUTH_TOKEN;
const enableSentrySourceMaps =
  process.env.SENTRY_UPLOAD_SOURCE_MAPS === 'true' && Boolean(sentryAuthToken);

export default withSentryConfig(nextConfig, {
  org: "anthology-z0",
  project: "project-anthology",
  authToken: sentryAuthToken,
  sourcemaps: {
    disable: !enableSentrySourceMaps,
  },
  widenClientFileUpload: true,
  tunnelRoute: "/monitoring",
  silent: !process.env.CI,
  errorHandler: (err) => {
    console.warn("[sentry] source map upload skipped:", err.message);
  },
});
