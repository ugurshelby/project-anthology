import createMiddleware from 'next-intl/middleware';
import { routing } from './i18n/routing';
import { seasonRewritePath } from './lib/i18n/seasonRewrite';
import type { NextRequest, NextResponse } from 'next/server';

const handleI18n = createMiddleware(routing);

/**
 * `?season=` on the grid, driver and team pages renders the `season/[year]` variant route, so no page reads
 * searchParams and every page can be cached. Edits next-intl's response in place (its rewrite target, or a rewrite
 * where it passed the request through) to keep its locale headers and cookie.
 */
function rewriteSeasonQuery(request: NextRequest, res: NextResponse) {
  const season = request.nextUrl.searchParams.get('season');
  if (!season || res.headers.has('location')) return;
  const target = new URL(res.headers.get('x-middleware-rewrite') ?? request.url);
  const path = seasonRewritePath(target.pathname, season, routing.locales);
  if (!path) return;
  target.pathname = path;
  target.searchParams.delete('season');
  res.headers.set('x-middleware-rewrite', target.toString());
  res.headers.delete('x-middleware-next');
}

/**
 * Next.js 16 proxy convention combining:
 * 1. next-intl locale negotiation (/en prefixless, /tr prefixed)
 * 2. `?season=` → `season/[year]` rewrite (see above)
 * 3. Preview-only noindex header (VERCEL_ENV === 'preview')
 */
export function proxy(request: NextRequest) {
  const res = handleI18n(request);
  rewriteSeasonQuery(request, res);
  if (process.env.VERCEL_ENV === 'preview') {
    res.headers.set('X-Robots-Tag', 'noindex, nofollow');
  }
  return res;
}

export const config = {
  // Run on pages only; skip Next internals, api, monitoring tunnel, and static files
  matcher: ['/((?!api|_next|monitoring|.*\\..*).*)'],
};
