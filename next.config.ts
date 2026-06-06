import type { NextConfig } from "next";
import { withSentryConfig } from "@sentry/nextjs";

const nextConfig: NextConfig = {
  async redirects() {
    return [{ source: '/radio', destination: '/anthology', permanent: true }];
  },
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: '**.motorsport.com' },
      { protocol: 'https', hostname: '**.autosport.com' },
      { protocol: 'https', hostname: 'storage.ghost.io' },
      { protocol: 'https', hostname: '**.the-race.com' },
    ],
  },
  // Keep heavy/unnecessary files out of serverless function bundles. jsdom is
  // only loaded via dynamic import in the news aggregator; public assets and the
  // next cache never belong in a function bundle.
  outputFileTracingExcludes: {
    '*': [
      './public/**/*',
      './node_modules/jsdom/**/*',
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
