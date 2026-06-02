import { getSupabaseAdmin } from '@/lib/supabase';
import type { NewsCache } from '@/types/database';
import { readPublicJson } from '@/lib/data/fs';
import { logFallback, logSupabaseCall, timed } from '@/lib/data/logger';
import { fetchSiteJson } from '@/lib/data/siteUrl';
import type { NewsItem } from '@/lib/data/types';

export type { NewsItem } from '@/lib/data/types';

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

function newsFromCache(row: NewsCache): NewsItem {
  const publishedAt = row.published_at ?? '';
  const publishedTs = publishedAt ? Date.parse(publishedAt) : 0;
  return {
    id: row.id,
    title: row.title,
    summary: row.summary ?? row.description ?? '',
    url: row.url,
    sourceName: row.source,
    sources: [row.source],
    image: row.image_url ?? '/favicon.svg',
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
    image: item.image || '/favicon.svg',
    publishedAt: item.publishedAt,
    publishedTs,
    dateLabel: item.dateLabel ?? formatDateLabel(item.publishedAt),
  };
}

function sortNews(items: NewsItem[]): NewsItem[] {
  return [...items].sort((a, b) => b.publishedTs - a.publishedTs);
}

export async function getLatestNews(limit = 20): Promise<NewsItem[]> {
  const supabase = getSupabaseAdmin();
  if (supabase) {
    const { result, durationMs } = await timed(async () =>
      supabase
        .from('news_cache')
        .select('*')
        .order('published_at', { ascending: false, nullsFirst: false })
        .limit(limit),
    );
    logSupabaseCall('news_cache', `select order published_at limit ${limit}`, durationMs);

    if (!result.error && result.data?.length) {
      return sortNews((result.data as NewsCache[]).map(newsFromCache)).slice(0, limit);
    }
    if (result.error) {
      logFallback('supabase news_cache', '/api/news', result.error.message);
    } else {
      logFallback('supabase news_cache (empty)', '/api/news');
    }
  } else {
    logFallback('supabase client unavailable', '/api/news');
  }

  const apiItems = await fetchSiteJson<ApiNewsItem[]>('/api/news');
  if (apiItems?.length) {
    return sortNews(apiItems.map(newsFromApiItem)).slice(0, limit);
  }

  logFallback('/api/news', 'public/news-fallback.json');
  const fallback = await readPublicJson<ApiNewsItem[]>('news-fallback.json');
  if (!fallback?.length) return [];
  return sortNews(fallback.map(newsFromApiItem)).slice(0, limit);
}
