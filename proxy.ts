import createMiddleware from 'next-intl/middleware';
import { routing } from './i18n/routing';
import type { NextRequest } from 'next/server';

const handleI18n = createMiddleware(routing);

/**
 * Next.js 16 proxy convention combining:
 * 1. next-intl locale negotiation (/en prefixless, /tr prefixed)
 * 2. Preview-only noindex header (VERCEL_ENV === 'preview')
 */
export function proxy(request: NextRequest) {
  const res = handleI18n(request);
  if (process.env.VERCEL_ENV === 'preview') {
    res.headers.set('X-Robots-Tag', 'noindex, nofollow');
  }
  return res;
}

export const config = {
  // Run on pages only; skip Next internals, api, monitoring tunnel, and static files
  matcher: ['/((?!api|_next|monitoring|.*\\..*).*)'],
};
