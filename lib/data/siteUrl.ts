/**
 * Resolve the absolute site URL for server-side (RSC) fetches of our own API
 * routes. RSC `fetch` needs an absolute URL; relative paths don't resolve.
 *
 * Order: NEXT_PUBLIC_SITE_URL → hardcoded prod fallback → VERCEL_URL → localhost.
 * NEXT_PUBLIC_SITE_URL is NOT defined in Vercel, so the hardcoded production URL
 * is the effective default in deployed environments.
 */

/** Hardcoded production URL — used when NEXT_PUBLIC_SITE_URL is unset. */
const PROD_SITE_URL = 'https://project-anthology-five.vercel.app';

export function getSiteUrl(): string {
  const explicit = (process.env.NEXT_PUBLIC_SITE_URL ?? PROD_SITE_URL).replace(/\/+$/, '');
  if (explicit) return explicit;
  const vercel = process.env.VERCEL_URL;
  if (vercel) return `https://${vercel.replace(/\/+$/, '')}`;
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
