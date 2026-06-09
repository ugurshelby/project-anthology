/**
 * SEO single source of truth — site identity, default OpenGraph, and JSON-LD
 * builders. Pages import from here so titles/descriptions/schema stay consistent
 * and the production URL comes from one place (getSiteUrl).
 */

import { getSiteUrl } from '@/lib/data/siteUrl';

export const SITE_NAME = 'Apex';
export const SITE_TAGLINE =
  'Apex — F1 archive: data, news, circuits, season standings, and team radio.';

/** Absolute site origin (prod fallback baked into getSiteUrl). */
export function siteUrl(): string {
  return getSiteUrl();
}

/** Absolute URL for a site-relative path. */
export function absoluteUrl(path: string): string {
  const base = siteUrl();
  return `${base}${path.startsWith('/') ? path : `/${path}`}`;
}

/** Organization/WebSite JSON-LD for the site root (rendered in layout). */
export function websiteJsonLd(): Record<string, unknown> {
  const url = siteUrl();
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: SITE_NAME,
    url,
    description: SITE_TAGLINE,
    publisher: {
      '@type': 'Organization',
      name: SITE_NAME,
      url,
    },
  };
}

/** Article JSON-LD for an anthology story detail page. */
export function articleJsonLd(input: {
  title: string;
  description: string;
  slug: string;
  imageUrl?: string;
  year?: string;
  category?: string;
}): Record<string, unknown> {
  const url = absoluteUrl(`/anthology/${input.slug}`);
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: input.title,
    description: input.description,
    url,
    mainEntityOfPage: { '@type': 'WebPage', '@id': url },
    image: input.imageUrl ? [absoluteUrl(input.imageUrl)] : undefined,
    articleSection: input.category || undefined,
    isPartOf: {
      '@type': 'WebSite',
      name: SITE_NAME,
      url: siteUrl(),
    },
    publisher: {
      '@type': 'Organization',
      name: SITE_NAME,
      url: siteUrl(),
    },
  };
}
