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

  function withI18n(entry: MetadataRoute.Sitemap[number], path: string): MetadataRoute.Sitemap[number] {
    const cleanPath = path === '/' ? '' : path.startsWith('/') ? path : `/${path}`;
    const enUrl = `${base}${cleanPath}`;
    const trUrl = `${base}/tr${cleanPath}`;
    return {
      ...entry,
      alternates: {
        languages: {
          en: enUrl,
          tr: trUrl,
          'x-default': enUrl,
        },
      },
    };
  }

  const staticRoutes: MetadataRoute.Sitemap = [
    withI18n({ url: `${base}/`, lastModified: now, changeFrequency: 'daily', priority: 1 }, '/'),
    withI18n({ url: `${base}/season`, lastModified: now, changeFrequency: 'daily', priority: 0.9 }, '/season'),
    withI18n({ url: `${base}/grid`, lastModified: now, changeFrequency: 'daily', priority: 0.85 }, '/grid'),
    withI18n({ url: `${base}/drivers`, lastModified: now, changeFrequency: 'weekly', priority: 0.8 }, '/drivers'),
    withI18n({ url: `${base}/teams`, lastModified: now, changeFrequency: 'weekly', priority: 0.8 }, '/teams'),
    withI18n({ url: `${base}/news`, lastModified: now, changeFrequency: 'hourly', priority: 0.8 }, '/news'),
    withI18n({ url: `${base}/circuits`, lastModified: now, changeFrequency: 'monthly', priority: 0.6 }, '/circuits'),
    withI18n({ url: `${base}/anthology`, lastModified: now, changeFrequency: 'weekly', priority: 0.8 }, '/anthology'),
    withI18n({ url: `${base}/tech-glossary`, lastModified: now, changeFrequency: 'monthly', priority: 0.5 }, '/tech-glossary'),
    withI18n({ url: `${base}/disclaimer`, lastModified: now, changeFrequency: 'yearly', priority: 0.2 }, '/disclaimer'),
    withI18n({ url: `${base}/privacy`, lastModified: now, changeFrequency: 'yearly', priority: 0.2 }, '/privacy'),
    withI18n({ url: `${base}/terms`, lastModified: now, changeFrequency: 'yearly', priority: 0.2 }, '/terms'),
    withI18n({ url: `${base}/dmca`, lastModified: now, changeFrequency: 'yearly', priority: 0.2 }, '/dmca'),
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
    return withI18n(
      {
        url: `${base}/anthology/${story.slug}`,
        // Real row timestamp tells crawlers when the story actually changed.
        lastModified: Number.isFinite(updated) ? new Date(updated) : now,
        changeFrequency: 'yearly',
        priority: 0.7,
      },
      `/anthology/${story.slug}`,
    );
  });

  const circuitRoutes: MetadataRoute.Sitemap = circuitIds.map((id) =>
    withI18n(
      {
        url: `${base}/circuits/${id}`,
        lastModified: now,
        changeFrequency: 'monthly',
        priority: 0.55,
      },
      `/circuits/${id}`,
    ),
  );

  const driverRoutes = drivers.rows.map((driver) =>
    withI18n(
      {
        url: `${base}/drivers/${driver.driverId}`,
        lastModified: now,
        changeFrequency: 'weekly' as const,
        priority: 0.75,
      },
      `/drivers/${driver.driverId}`,
    ),
  );
  const teamRoutes = teams.rows.map((team) =>
    withI18n(
      {
        url: `${base}/teams/${team.constructorId}`,
        lastModified: now,
        changeFrequency: 'weekly' as const,
        priority: 0.75,
      },
      `/teams/${team.constructorId}`,
    ),
  );
  const raceRoutes = races
    .filter((race) => race.round != null)
    .map((race) =>
      withI18n(
        {
          url: `${base}/season/${CURRENT_SEASON}/round/${race.round}`,
          lastModified: race.date ? new Date(race.date) : now,
          changeFrequency: 'daily' as const,
          priority: 0.8,
        },
        `/season/${CURRENT_SEASON}/round/${race.round}`,
      ),
    );

  return [...staticRoutes, ...storyRoutes, ...circuitRoutes, ...driverRoutes, ...teamRoutes, ...raceRoutes];
}
