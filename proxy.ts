import { NextResponse } from 'next/server';

/**
 * Preview-only noindex (Faz 0 — Lighthouse SEO fix).
 *
 * Vercel preview deployments must never be indexed, but production must be.
 * Earlier the noindex header leaked to the URL Lighthouse audited, dropping the
 * SEO score to 69. We now gate it strictly on VERCEL_ENV === 'preview':
 * production and local development emit no X-Robots-Tag, so they stay indexable.
 *
 * Next.js 16 renamed the `middleware` file convention to `proxy`; same API.
 */
export function proxy() {
  const res = NextResponse.next();
  if (process.env.VERCEL_ENV === 'preview') {
    res.headers.set('X-Robots-Tag', 'noindex, nofollow');
  }
  return res;
}

export const config = {
  // Run on pages only; skip Next internals, the monitoring tunnel, and any path
  // with a file extension (static assets, favicon, og images, feed, sitemap).
  matcher: ['/((?!_next/|monitoring|.*\\..*).*)'],
};
