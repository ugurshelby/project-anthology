/**
 * News read layer — Supabase SELECTs only, never a live RSS scrape.
 *
 * Chain: `news_stories` (merged stories) → `news_cache` (raw rows), both fed by
 * the sync-news cron, so the slow RSS round trips stay off the user path →
 * static public/news-fallback.json.
 */

import { getSupabaseClient } from '@/lib/supabase';
import type { NewsCacheRow, NewsStoryRow } from '@/types/database';
import { readPublicJson } from '@/lib/data/fs';
import { logFallback, logSupabaseCall, timed } from '@/lib/data/logger';
import { stableId, canonicalize } from '@/lib/news/aggregate';
import { hasRealImage } from '@/lib/news/categories';
import { pickNewsEntity, type NewsEntity } from '@/lib/news/fallbackImage';
import { fetchSeasonSnapshotTyped } from '@/lib/data/f1';
import { CURRENT_SEASON, type CalendarRace } from '@/lib/f1Calendar';
import { getConstructorStandings, getDriverStandings } from '@/lib/f1/mrdata';
import { getMediaBatch } from '@/lib/media/read';
import type { MediaEntityType } from '@/lib/media/types';
import type { NewsItem } from '@/lib/data/types';

export type { NewsItem } from '@/lib/data/types';
export { hasRealImage };
export { localizedNewsTitle, localizedNewsSummary } from '@/lib/news/i18n';

/** Shape of the hand-authored public/news-fallback.json items. */
interface StaticNewsItem {
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
    // Must match the id the RSS pipeline gives the same article (stableId of
    // the canonical URL) — news_cache.id is just Supabase's own row key and
    // never matches, so list links and /news/[id] lookups would disagree.
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

function newsFromStaticItem(item: StaticNewsItem): NewsItem {
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
 * Reuses getLatestNews so the DB → static fallback chain is shared.
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
 * the same DB → static fallback chain is reused. Only meaningful for the
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
 * DB → static fallback chain as getLatestNews (no separate by-id query
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
    if (!result.error && result.data) return (await withFallbackMedia([newsFromStory(result.data)]))[0];
  } catch (err) {
    logFallback('supabase news_stories (by id)', 'latest-news chain', (err as Error).message);
  }
  const items = await getLatestNews(100);
  return items.find((item) => item.id === id) ?? null;
}

/**
 * Names to match imageless headlines against: current-season drivers (surname and full name),
 * teams and calendar circuits (locality and race name), all from the stored snapshots.
 */
async function currentNewsEntities(): Promise<NewsEntity[]> {
  const [drivers, teams, calendar] = await Promise.all([
    fetchSeasonSnapshotTyped(CURRENT_SEASON, 'standings_drivers'),
    fetchSeasonSnapshotTyped(CURRENT_SEASON, 'standings_constructors'),
    fetchSeasonSnapshotTyped(CURRENT_SEASON, 'calendar'),
  ]);
  const out: NewsEntity[] = [];
  for (const d of getDriverStandings(drivers)) {
    out.push({ type: 'driver', key: d.driverId, names: [d.familyName, d.driverName].filter(Boolean) });
  }
  for (const t of getConstructorStandings(teams)) {
    out.push({ type: 'team', key: t.constructorId, names: [t.constructorName] });
  }
  const races = (calendar?.MRData as { RaceTable?: { Races?: CalendarRace[] } } | undefined)?.RaceTable?.Races ?? [];
  for (const race of races) {
    const id = race.Circuit?.circuitId;
    if (!id) continue;
    out.push({
      type: 'circuit',
      key: id,
      names: [race.Circuit?.Location?.locality, race.raceName].filter((n): n is string => Boolean(n)),
    });
  }
  return out;
}

/**
 * Adds `fallbackMedia` to items without a real cover: the entity their headline is about, when
 * the archive holds a licensed image for it. One media query per type; never throws.
 */
export async function withFallbackMedia(items: NewsItem[]): Promise<NewsItem[]> {
  const imageless = items.filter((item) => !hasRealImage(item));
  if (imageless.length === 0) return items;
  try {
    const entities = await currentNewsEntities();
    const picks = new Map<string, { type: MediaEntityType; key: string }>();
    for (const item of imageless) {
      const hit = pickNewsEntity(item.title, item.summary, entities);
      if (!hit) continue;
      // A team is shown by its season car, never its logo (owner decision 2026-10-27, 8.11b).
      picks.set(item.id, hit.type === 'team' ? { type: 'car', key: `${hit.key}:${CURRENT_SEASON}` } : hit);
    }
    const byType = new Map<MediaEntityType, string[]>();
    for (const p of picks.values()) byType.set(p.type, [...new Set([...(byType.get(p.type) ?? []), p.key])]);
    const results = new Map<string, Awaited<ReturnType<typeof getMediaBatch>>>();
    await Promise.all(
      [...byType].map(async ([type, keys]) => results.set(type, await getMediaBatch(type, keys))),
    );
    return items.map((item) => {
      const pick = picks.get(item.id);
      const result = pick ? results.get(pick.type)?.get(pick.key) : undefined;
      return pick && result?.status === 'image' ? { ...item, fallbackMedia: { ...pick, result } } : item;
    });
  } catch (err) {
    logFallback('news fallback media', 'no archive image', (err as Error).message);
    return items;
  }
}

/**
 * Latest news. DB (news_stories → news_cache) → static fallback.
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
      if (items.length > 0) return withFallbackMedia(items.slice(0, limit));
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
      logFallback('supabase news_cache', 'public/news-fallback.json', result.error.message);
    } else {
      logFallback('supabase news_cache (empty)', 'public/news-fallback.json');
    }
  } catch (err) {
    logFallback('supabase news_cache', 'public/news-fallback.json', (err as Error).message);
  }

  // 2) static fallback — hand-authored/stale, still enforce the same rule
  const fallback = await readPublicJson<StaticNewsItem[]>('news-fallback.json');
  if (!fallback?.length) return [];
  const fallbackWithImages = fallback.map(newsFromStaticItem).filter(hasRealImage);
  return sortNews(fallbackWithImages).slice(0, limit);
}
