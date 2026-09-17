import type { MetadataRoute } from 'next';
import { getCircuitIdsForSitemap } from '@/lib/data/circuits';
import { getStorySitemapEntries } from '@/lib/data/stories';
import { getCurrentDrivers, getCurrentTeams } from '@/lib/data/entities';
import { getCurrentSeasonRaces } from '@/lib/data/circuits';
import { CURRENT_SEASON } from '@/lib/f1Calendar';
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
    { url: `${base}/grid`, lastModified: now, changeFrequency: 'daily', priority: 0.85 },
    { url: `${base}/drivers`, lastModified: now, changeFrequency: 'weekly', priority: 0.8 },
    { url: `${base}/teams`, lastModified: now, changeFrequency: 'weekly', priority: 0.8 },
    { url: `${base}/news`, lastModified: now, changeFrequency: 'hourly', priority: 0.8 },
    { url: `${base}/circuits`, lastModified: now, changeFrequency: 'monthly', priority: 0.6 },
    { url: `${base}/anthology`, lastModified: now, changeFrequency: 'weekly', priority: 0.8 },
    { url: `${base}/tech-glossary`, lastModified: now, changeFrequency: 'monthly', priority: 0.5 },
    { url: `${base}/disclaimer`, lastModified: now, changeFrequency: 'yearly', priority: 0.2 },
    { url: `${base}/privacy`, lastModified: now, changeFrequency: 'yearly', priority: 0.2 },
    { url: `${base}/terms`, lastModified: now, changeFrequency: 'yearly', priority: 0.2 },
    { url: `${base}/dmca`, lastModified: now, changeFrequency: 'yearly', priority: 0.2 },
  ];

  const [stories, circuitIds, drivers, teams, races] = await Promise.all([
    getStorySitemapEntries(),
    getCircuitIdsForSitemap(),
    getCurrentDrivers(),
    getCurrentTeams(),
    getCurrentSeasonRaces(),
  ]);
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

  const driverRoutes = drivers.rows.map((driver) => ({
    url: `${base}/drivers/${driver.driverId}`,
    lastModified: now,
    changeFrequency: 'weekly' as const,
    priority: 0.75,
  }));
  const teamRoutes = teams.rows.map((team) => ({
    url: `${base}/teams/${team.constructorId}`,
    lastModified: now,
    changeFrequency: 'weekly' as const,
    priority: 0.75,
  }));
  const raceRoutes = races
    .filter((race) => race.round != null)
    .map((race) => ({
      url: `${base}/season/${CURRENT_SEASON}/round/${race.round}`,
      lastModified: race.date ? new Date(race.date) : now,
      changeFrequency: 'daily' as const,
      priority: 0.8,
    }));

  return [...staticRoutes, ...storyRoutes, ...circuitRoutes, ...driverRoutes, ...teamRoutes, ...raceRoutes];
}
