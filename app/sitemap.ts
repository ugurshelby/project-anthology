import type { MetadataRoute } from 'next';
import { getCircuitIdsForSitemap } from '@/lib/data/circuits';
import { getStorySitemapEntries } from '@/lib/data/stories';
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
    { url: `${base}/drivers`, lastModified: now, changeFrequency: 'weekly', priority: 0.8 },
    { url: `${base}/teams`, lastModified: now, changeFrequency: 'weekly', priority: 0.8 },
    { url: `${base}/news`, lastModified: now, changeFrequency: 'hourly', priority: 0.8 },
    { url: `${base}/circuits`, lastModified: now, changeFrequency: 'monthly', priority: 0.6 },
    { url: `${base}/anthology`, lastModified: now, changeFrequency: 'weekly', priority: 0.8 },
    { url: `${base}/tech-glossary`, lastModified: now, changeFrequency: 'monthly', priority: 0.5 },
  ];

  const stories = await getStorySitemapEntries();
  const circuitIds = await getCircuitIdsForSitemap();
  const storyRoutes: MetadataRoute.Sitemap = stories.map((story) => {
    const updated = Date.parse(story.updatedAt);
    return {
      url: `${base}/anthology/${story.slug}`,
      // Real row timestamp tells crawlers when the story actually changed.
      lastModified: Number.isFinite(updated) ? new Date(updated) : now,
      changeFrequency: 'yearly',
      priority: 0.7,
    };
  });

  const circuitRoutes: MetadataRoute.Sitemap = circuitIds.map((id) => ({
    url: `${base}/circuits/${id}`,
    lastModified: now,
    changeFrequency: 'monthly',
    priority: 0.55,
  }));

  return [...staticRoutes, ...storyRoutes, ...circuitRoutes];
}
