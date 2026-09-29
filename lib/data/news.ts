/**
 * News read layer — Supabase `news_cache` SELECT, with /api/news fallback.
 *
 * Primary path: an indexed SELECT on news_cache (fed by the sync-news cron),
 * so first paint is fast and the slow RSS round trips off the user path.
 * Fallback: /api/news (live RSS aggregate) → static public/news-fallback.json.
 */

import { getSupabaseClient } from '@/lib/supabase';
import type { NewsCacheRow, NewsStoryRow } from '@/types/database';
import { readPublicJson } from '@/lib/data/fs';
import { logFallback, logSupabaseCall, timed } from '@/lib/data/logger';
import { fetchSiteJson } from '@/lib/data/siteUrl';
import { stableId, canonicalize } from '@/lib/news/aggregate';
import { hasRealImage } from '@/lib/news/categories';
import type { NewsItem } from '@/lib/data/types';

export type { NewsItem } from '@/lib/data/types';
export { hasRealImage };
export { localizedNewsTitle, localizedNewsSummary } from '@/lib/news/i18n';

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
    // Must match the id the live /api/news aggregate() produces for the same
    // article (stableId of the canonical URL) — news_cache.id is just Supabase's
    // own row key and never matches, which is why /news/[id] 404s: the list page
    // renders live-aggregate ids, the detail page looked up DB-row ids.
    id: stableId(canonicalize(row.url)),
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
    titleTr: row.title_tr,
    summaryTr: row.description_tr,
  };
}

function newsFromStory(row: NewsStoryRow): NewsItem {
  const publishedTs = Date.parse(row.published_at);
  const links = Array.isArray(row.sources) ? row.sources : [];
  return {
    id: row.id,
    title: row.title,
    summary: row.summary,
    url: links[0]?.url ?? '',
    sourceName: links[0]?.name ?? '',
    sources: links.map((l) => l.name),
    // Empty string (never the placeholder) when no outlet had a reachable image.
    image: row.image_url ?? '',
    publishedAt: row.published_at,
    publishedTs: Number.isFinite(publishedTs) ? publishedTs : 0,
    dateLabel: formatDateLabel(row.published_at),
    titleTr: row.title_tr,
    summaryTr: row.summary_tr,
    sourceLinks: links.map((l) => ({ name: l.name, url: l.url, title: l.title })),
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
 * Single news item by id, for the /news/[id] detail page. Reuses the same
 * DB → API → static fallback chain as getLatestNews (no separate by-id query
 * exists upstream — news_cache/RSS aggregation isn't keyed for single-row
 * lookups), so this pulls a generous batch and filters in memory.
 */
export async function getNewsById(id: string): Promise<NewsItem | null> {
  // Stories are keyed by id — a direct lookup. Imageless stories are valid here
  // (the detail page simply shows no cover; no placeholder).
  try {
    const supabase = getSupabaseClient();
    const { result, durationMs } = await timed(async () =>
      supabase.from('news_stories').select('*').eq('id', id).maybeSingle<NewsStoryRow>(),
    );
    logSupabaseCall('news_stories', `select id=${id}`, durationMs);
    if (!result.error && result.data) return newsFromStory(result.data);
  } catch (err) {
    logFallback('supabase news_stories (by id)', 'latest-news chain', (err as Error).message);
  }
  const items = await getLatestNews(100);
  return items.find((item) => item.id === id) ?? null;
}

/**
 * Latest news. DB (news_cache) → /api/news → static fallback.
 */
export async function getLatestNews(
  limit = 20,
  opts: { includeImageless?: boolean } = {},
): Promise<NewsItem[]> {
  // 0) Merged stories (7-day window). Lists/heroes only show stories that have a
  //    real cover; the detail page still renders imageless ones (getNewsById).
  try {
    const supabase = getSupabaseClient();
    const { result, durationMs } = await timed(async () =>
      supabase
        .from('news_stories')
        .select('*')
        .order('published_at', { ascending: false })
        .limit(limit * 2),
    );
    logSupabaseCall('news_stories', `select order published_at limit ${limit * 2}`, durationMs);
    if (!result.error && result.data?.length) {
      const all = (result.data as NewsStoryRow[]).map(newsFromStory);
      const items = opts.includeImageless ? all : all.filter(hasRealImage);
      if (items.length > 0) return items.slice(0, limit);
    }
  } catch (err) {
    logFallback('supabase news_stories', 'news_cache', (err as Error).message);
  }

  // 1) DB (legacy raw table)
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
      // Defense in depth: news_cache rows written before an image-reachability
      // check existed (or before a source pulled its asset) shouldn't surface a
      // broken/placeholder thumbnail — aggregate() already keeps this out of
      // new rows, this just protects against stale ones until the 30-day
      // retention cron clears them.
      const withImages = (result.data as NewsCacheRow[]).map(newsFromCache).filter(hasRealImage);
      if (withImages.length > 0) return sortNews(withImages).slice(0, limit);
    }
    if (result.error) {
      logFallback('supabase news_cache', '/api/news', result.error.message);
    } else {
      logFallback('supabase news_cache (empty)', '/api/news');
    }
  } catch (err) {
    logFallback('supabase news_cache', '/api/news', (err as Error).message);
  }

  // 2) live /api/news (aggregate() already dropped no-image/unreachable-image items)
  const apiItems = await fetchSiteJson<ApiNewsItem[]>('/api/news');
  if (apiItems?.length) {
    const withImages = apiItems.map(newsFromApiItem).filter(hasRealImage);
    if (withImages.length > 0) return sortNews(withImages).slice(0, limit);
  }

  // 3) static fallback — hand-authored/stale, still enforce the same rule
  logFallback('/api/news', 'public/news-fallback.json');
  const fallback = await readPublicJson<ApiNewsItem[]>('news-fallback.json');
  if (!fallback?.length) return [];
  const fallbackWithImages = fallback.map(newsFromApiItem).filter(hasRealImage);
  return sortNews(fallbackWithImages).slice(0, limit);
}
