/**
 * News read layer — Supabase `news_cache` SELECT, with /api/news fallback.
 *
 * Primary path: an indexed SELECT on news_cache (fed by the sync-news cron),
 * so first paint is fast and the slow RSS round trips off the user path.
 * Fallback: /api/news (live RSS aggregate) → static public/news-fallback.json.
 */

import { getSupabaseClient } from '@/lib/supabase';
import type { NewsCacheRow } from '@/types/database';
import { readPublicJson } from '@/lib/data/fs';
import { logFallback, logSupabaseCall, timed } from '@/lib/data/logger';
import { fetchSiteJson } from '@/lib/data/siteUrl';
import type { NewsItem } from '@/lib/data/types';

export type { NewsItem } from '@/lib/data/types';

/** Shape returned by the live /api/news route. */
interface ApiNewsItem {
  id: string;
  title: string;
  summary: string;
  url: string;
  sourceName: string;
  sources?: string[];
  image: string;
  publishedAt: string;
  publishedTs?: number;
  dateLabel?: string;
}

function formatDateLabel(iso: string): string {
  const d = Date.parse(iso);
  if (!Number.isFinite(d)) return '';
  return new Date(d).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

function newsFromCache(row: NewsCacheRow): NewsItem {
  const publishedAt = row.published_at ?? '';
  const publishedTs = publishedAt ? Date.parse(publishedAt) : 0;
  return {
    id: String(row.id),
    title: row.title ?? '',
    summary: row.summary ?? row.description ?? '',
    url: row.url,
    sourceName: row.source ?? '',
    sources:
      Array.isArray(row.tags) && row.tags.length > 0
        ? row.tags
        : row.source
          ? [row.source]
          : [],
    image: row.image_url ?? '/placeholder.svg',
    publishedAt,
    publishedTs: Number.isFinite(publishedTs) ? publishedTs : 0,
    dateLabel: formatDateLabel(publishedAt),
  };
}

function newsFromApiItem(item: ApiNewsItem): NewsItem {
  const publishedTs =
    typeof item.publishedTs === 'number' && Number.isFinite(item.publishedTs)
      ? item.publishedTs
      : Date.parse(item.publishedAt || '') || 0;
  return {
    id: item.id,
    title: item.title,
    summary: item.summary,
    url: item.url,
    sourceName: item.sourceName,
    sources: item.sources?.length ? item.sources : [item.sourceName],
    image: item.image || '/placeholder.svg',
    publishedAt: item.publishedAt,
    publishedTs,
    dateLabel: item.dateLabel ?? formatDateLabel(item.publishedAt),
  };
}

function sortNews(items: NewsItem[]): NewsItem[] {
  return [...items].sort((a, b) => b.publishedTs - a.publishedTs);
}

/** Does this item have a real (non-placeholder) image usable as a hero background? */
export function hasRealImage(item: { image: string }): boolean {
  return Boolean(item.image) && item.image !== '/placeholder.svg';
}

/**
 * The single featured story for hero placements (homepage + /news).
 * Picks the most recent headline that actually has an image, so the cinematic
 * background hero is never rendered with the favicon placeholder. Falls back to
 * the newest item if none have images, and null if there's no news at all.
 *
 * Reuses getLatestNews so the DB → /api/news → static fallback chain is shared.
 */
export async function getFeaturedNews(): Promise<NewsItem | null> {
  const items = await getLatestNews(20);
  if (items.length === 0) return null;
  return items.find(hasRealImage) ?? items[0];
}

/**
 * News items mentioning an entity (driver surname or team name), for profile
 * pages (Faz 3). MVP: filter the already-fetched latest-news set in memory
 * (case-insensitive substring on title/summary), so no extra DB round trip and
 * the same DB → API → static fallback chain is reused. Only meaningful for the
 * current season; callers gate on that.
 */
export async function getNewsForEntity(
  entityName: string,
  maxItems = 3,
): Promise<NewsItem[]> {
  const name = entityName.trim().toLowerCase();
  if (!name) return [];
  // A driver's surname / a team's short name is the useful match token.
  const tokens = name.split(/\s+/).filter((t) => t.length >= 3);
  if (tokens.length === 0) return [];

  const items = await getLatestNews(60);
  const matched = items.filter((item) => {
    const haystack = `${item.title} ${item.summary}`.toLowerCase();
    return tokens.some((t) => haystack.includes(t));
  });
  return matched.slice(0, maxItems);
}

/**
 * Latest news. DB (news_cache) → /api/news → static fallback.
 */
export async function getLatestNews(limit = 20): Promise<NewsItem[]> {
  // 1) DB
  try {
    const supabase = getSupabaseClient();
    const { result, durationMs } = await timed(async () =>
      supabase
        .from('news_cache')
        .select('*')
        .order('published_at', { ascending: false, nullsFirst: false })
        .limit(limit),
    );
    logSupabaseCall('news_cache', `select order published_at limit ${limit}`, durationMs);

    if (!result.error && result.data?.length) {
      return sortNews((result.data as NewsCacheRow[]).map(newsFromCache)).slice(0, limit);
    }
    if (result.error) {
      logFallback('supabase news_cache', '/api/news', result.error.message);
    } else {
      logFallback('supabase news_cache (empty)', '/api/news');
    }
  } catch (err) {
    logFallback('supabase news_cache', '/api/news', (err as Error).message);
  }

  // 2) live /api/news
  const apiItems = await fetchSiteJson<ApiNewsItem[]>('/api/news');
  if (apiItems?.length) {
    return sortNews(apiItems.map(newsFromApiItem)).slice(0, limit);
  }

  // 3) static fallback
  logFallback('/api/news', 'public/news-fallback.json');
  const fallback = await readPublicJson<ApiNewsItem[]>('news-fallback.json');
  if (!fallback?.length) return [];
  return sortNews(fallback.map(newsFromApiItem)).slice(0, limit);
}
