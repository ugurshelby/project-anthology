import type { MetadataRoute } from 'next';
import { getStorySlugs } from '@/lib/data/stories';
import { siteUrl } from '@/lib/seo';

/**
 * XML sitemap. Static top-level routes + every published anthology story
 * (slugs pulled live from Supabase). Tolerant of an empty story list — the
 * read layer already returns [] on error, so the sitemap still builds.
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = siteUrl();
  const now = new Date();

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${base}/`, lastModified: now, changeFrequency: 'daily', priority: 1 },
    { url: `${base}/season`, lastModified: now, changeFrequency: 'daily', priority: 0.9 },
    { url: `${base}/news`, lastModified: now, changeFrequency: 'hourly', priority: 0.8 },
    { url: `${base}/circuits`, lastModified: now, changeFrequency: 'monthly', priority: 0.6 },
    { url: `${base}/radio`, lastModified: now, changeFrequency: 'weekly', priority: 0.6 },
    { url: `${base}/anthology`, lastModified: now, changeFrequency: 'weekly', priority: 0.8 },
    { url: `${base}/tech-glossary`, lastModified: now, changeFrequency: 'monthly', priority: 0.5 },
  ];

  const slugs = await getStorySlugs();
  const storyRoutes: MetadataRoute.Sitemap = slugs.map((slug) => ({
    url: `${base}/anthology/${slug}`,
    lastModified: now,
    changeFrequency: 'yearly',
    priority: 0.7,
  }));

  return [...staticRoutes, ...storyRoutes];
}
