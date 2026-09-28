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

/**
 * Locale-aware alternates for Next.js metadata.
 * Generates canonical according to locale (en prefixless, tr /tr-prefixed)
 * and hreflang mapping for en, tr, and x-default.
 */
export function localizedAlternates(path: string, locale: string = 'en') {
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  const enUrl = cleanPath === '/' ? siteUrl() : absoluteUrl(cleanPath);
  const trUrl = cleanPath === '/' ? `${siteUrl()}/tr` : absoluteUrl(`/tr${cleanPath}`);
  const canonical = locale === 'tr' ? trUrl : enUrl;

  return {
    canonical,
    languages: {
      en: enUrl,
      tr: trUrl,
      'x-default': enUrl,
    },
  };
}

/** Organization/WebSite JSON-LD for the site root (rendered in layout). */
export function websiteJsonLd(locale: string = 'en'): Record<string, unknown> {
  const url = siteUrl();
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: SITE_NAME,
    url,
    inLanguage: locale === 'tr' ? 'tr-TR' : 'en-US',
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
  locale?: string;
  /** ISO timestamp the story row was created (→ datePublished). */
  publishedAt?: string;
  /** ISO timestamp the story row was last updated (→ dateModified). */
  modifiedAt?: string;
  /** Defaults to the site Organization when stories carry no per-author byline. */
  authorName?: string;
}): Record<string, unknown> {
  const url = absoluteUrl(input.locale === 'tr' ? `/tr/anthology/${input.slug}` : `/anthology/${input.slug}`);
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: input.title,
    description: input.description,
    url,
    inLanguage: input.locale === 'tr' ? 'tr-TR' : 'en-US',
    mainEntityOfPage: { '@type': 'WebPage', '@id': url },
    image: input.imageUrl ? [absoluteUrl(input.imageUrl)] : undefined,
    articleSection: input.category || undefined,
    datePublished: input.publishedAt || undefined,
    dateModified: input.modifiedAt || input.publishedAt || undefined,
    author: {
      '@type': 'Organization',
      name: input.authorName || SITE_NAME,
      url: siteUrl(),
    },
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
