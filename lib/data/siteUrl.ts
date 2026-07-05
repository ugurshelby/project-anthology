/**
 * Resolve the absolute site URL for server-side (RSC) fetches of our own API
 * routes. RSC `fetch` needs an absolute URL; relative paths don't resolve.
 *
 * Order: NEXT_PUBLIC_SITE_URL → VERCEL_URL (own preview/branch domain) →
 * hardcoded prod fallback → localhost. VERCEL_URL must come before the prod
 * fallback, otherwise preview deployments self-fetch production data instead
 * of their own.
 */

/** Hardcoded production URL — last-resort fallback when no env var is set. */
const PROD_SITE_URL = 'https://project-anthology-five.vercel.app';

export function getSiteUrl(): string {
  const explicit = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/+$/, '');
  if (explicit) return explicit;
  const vercel = process.env.VERCEL_URL;
  if (vercel) return `https://${vercel.replace(/\/+$/, '')}`;
  if (process.env.NODE_ENV === 'production') return PROD_SITE_URL;
  return 'http://localhost:3000';
}

/** Fetch JSON from one of our own API routes (absolute URL), tolerant of errors. */
export async function fetchSiteJson<T>(
  path: string,
  timeoutMs = 8000,
): Promise<T | null> {
  const url = `${getSiteUrl()}${path.startsWith('/') ? path : `/${path}`}`;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, {
      signal: controller.signal,
      headers: { Accept: 'application/json' },
    });
    if (!res.ok) return null;
    return (await res.json()) as T;
  } catch {
    return null;
  } finally {
    clearTimeout(timer);
  }
}
