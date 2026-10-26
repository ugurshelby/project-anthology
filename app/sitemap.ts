import type { MetadataRoute } from 'next';
import { getCircuitIdsForSitemap } from '@/lib/data/circuits';
import { getStorySitemapEntries } from '@/lib/data/stories';
import { getCurrentDrivers, getCurrentTeams } from '@/lib/data/entities';
import { getCurrentSeasonRaces } from '@/lib/data/circuits';
import { getLatestNews } from '@/lib/data/news';
import { allConstructorIds, allDriverIds, resolveDriverId } from '@/lib/history/store';
import { resolveConstructorId } from '@/lib/history/ids';
import { CURRENT_SEASON, F1_SEASON_MIN } from '@/lib/f1Calendar';
import { siteUrl } from '@/lib/seo';

const NEWS_WINDOW_MS = 14 * 24 * 60 * 60 * 1000;
const NEWS_SITEMAP_LIMIT = 200;

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
    withI18n({ url: `${base}/machinery`, lastModified: now, changeFrequency: 'monthly', priority: 0.6 }, '/machinery'),
    withI18n({ url: `${base}/anthology`, lastModified: now, changeFrequency: 'weekly', priority: 0.8 }, '/anthology'),
    withI18n({ url: `${base}/tech-glossary`, lastModified: now, changeFrequency: 'monthly', priority: 0.5 }, '/tech-glossary'),
    withI18n({ url: `${base}/disclaimer`, lastModified: now, changeFrequency: 'yearly', priority: 0.2 }, '/disclaimer'),
    withI18n({ url: `${base}/privacy`, lastModified: now, changeFrequency: 'yearly', priority: 0.2 }, '/privacy'),
    withI18n({ url: `${base}/terms`, lastModified: now, changeFrequency: 'yearly', priority: 0.2 }, '/terms'),
    withI18n({ url: `${base}/dmca`, lastModified: now, changeFrequency: 'yearly', priority: 0.2 }, '/dmca'),
  ];

  const [stories, circuitIds, drivers, teams, races, news] = await Promise.all([
    getStorySitemapEntries(),
    getCircuitIdsForSitemap(),
    getCurrentDrivers(),
    getCurrentTeams(),
    getCurrentSeasonRaces(),
    getLatestNews(NEWS_SITEMAP_LIMIT, { includeImageless: true }).catch(() => []),
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

  const seasonRoutes: MetadataRoute.Sitemap = [];
  for (let year = CURRENT_SEASON; year >= F1_SEASON_MIN; year--) {
    seasonRoutes.push(
      withI18n(
        {
          url: `${base}/season/${year}`,
          lastModified: now,
          changeFrequency: year === CURRENT_SEASON ? ('daily' as const) : ('yearly' as const),
          priority: year === CURRENT_SEASON ? 0.8 : 0.5,
        },
        `/season/${year}`,
      ),
    );
  }

  const newsRoutes = news
    .filter((item) => item.id && item.publishedTs >= now.getTime() - NEWS_WINDOW_MS)
    .map((item) =>
      withI18n(
        {
          url: `${base}/news/${item.id}`,
          lastModified: new Date(item.publishedTs),
          changeFrequency: 'never' as const,
          priority: 0.5,
        },
        `/news/${item.id}`,
      ),
    );

  // All-time archive pages from the F1DB index; ids already covered by the current
  // standings rows (Jolpica ids that resolve to the same record) are not repeated.
  const currentDriverKeys = new Set(drivers.rows.map((d) => resolveDriverId(d.driverId) ?? d.driverId));
  const currentTeamKeys = new Set(teams.rows.map((t) => resolveConstructorId(t.constructorId) ?? t.constructorId));
  const archiveDriverRoutes = allDriverIds()
    .filter((id) => !currentDriverKeys.has(id))
    .map((id) =>
      withI18n(
        { url: `${base}/drivers/${id}`, lastModified: now, changeFrequency: 'yearly' as const, priority: 0.4 },
        `/drivers/${id}`,
      ),
    );
  const archiveTeamRoutes = allConstructorIds()
    .filter((id) => !currentTeamKeys.has(id))
    .map((id) =>
      withI18n(
        { url: `${base}/teams/${id}`, lastModified: now, changeFrequency: 'yearly' as const, priority: 0.4 },
        `/teams/${id}`,
      ),
    );

  return [
    ...staticRoutes,
    ...storyRoutes,
    ...circuitRoutes,
    ...driverRoutes,
    ...teamRoutes,
    ...raceRoutes,
    ...seasonRoutes,
    ...newsRoutes,
    ...archiveDriverRoutes,
    ...archiveTeamRoutes,
  ];
}
