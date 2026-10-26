import { describe, expect, it, vi } from 'vitest';

const NOW = Date.now();
const DAY = 24 * 60 * 60 * 1000;

vi.mock('@/lib/data/circuits', () => ({
  getCircuitIdsForSitemap: async () => ['monza'],
  getCurrentSeasonRaces: async () => [{ round: '1', date: '2026-03-15' }],
}));
vi.mock('@/lib/data/stories', () => ({ getStorySitemapEntries: async () => [] }));
vi.mock('@/lib/data/entities', () => ({
  getCurrentDrivers: async () => ({ rows: [{ driverId: 'max_verstappen' }] }),
  getCurrentTeams: async () => ({ rows: [{ constructorId: 'red_bull' }] }),
}));
vi.mock('@/lib/data/news', () => ({
  getLatestNews: async () => [
    { id: 'fresh', publishedTs: NOW - DAY },
    { id: 'stale', publishedTs: NOW - 20 * DAY },
  ],
}));

import sitemap from '@/app/sitemap';
import { CURRENT_SEASON, F1_SEASON_MIN } from '@/lib/f1Calendar';

describe('sitemap', () => {
  it('lists one /season/{year} entry per season from F1_SEASON_MIN to the current one', async () => {
    const urls = (await sitemap()).map((e) => e.url);
    const seasonUrls = urls.filter((u) => /\/season\/\d{4}$/.test(u));
    expect(seasonUrls).toHaveLength(CURRENT_SEASON - F1_SEASON_MIN + 1);
    expect(seasonUrls.some((u) => u.endsWith(`/season/${F1_SEASON_MIN}`))).toBe(true);
    expect(seasonUrls.some((u) => u.endsWith(`/season/${CURRENT_SEASON}`))).toBe(true);
  });

  it('includes /machinery and every season entry carries en/tr alternates', async () => {
    const entries = await sitemap();
    expect(entries.some((e) => e.url.endsWith('/machinery'))).toBe(true);
    const season = entries.find((e) => e.url.endsWith(`/season/${CURRENT_SEASON}`));
    expect(Object.keys(season?.alternates?.languages ?? {})).toEqual(['en', 'tr', 'x-default']);
  });

  it('keeps only news from the last 14 days', async () => {
    const urls = (await sitemap()).map((e) => e.url);
    expect(urls.some((u) => u.endsWith('/news/fresh'))).toBe(true);
    expect(urls.some((u) => u.endsWith('/news/stale'))).toBe(false);
  });

  it('adds archive driver and team pages once, without repeating current-standings ids', async () => {
    const urls = (await sitemap()).map((e) => e.url);
    expect(urls.filter((u) => /\/drivers\/[^/]+$/.test(u)).length).toBeGreaterThan(800);
    expect(urls.some((u) => u.endsWith('/drivers/max-verstappen'))).toBe(false);
    expect(urls.some((u) => u.endsWith('/drivers/max_verstappen'))).toBe(true);
    expect(urls.some((u) => u.endsWith('/teams/red-bull'))).toBe(false);
    expect(new Set(urls).size).toBe(urls.length);
  });
});
