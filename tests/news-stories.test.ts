import { describe, it, expect, vi, afterEach } from 'vitest';
import { clusterArticles } from '@/lib/news/cluster';
import { copiesSource, parseRewriteItem, parseBatch } from '@/lib/news/rewrite';
import { draftStories, fingerprintOf } from '@/lib/news/stories';
import type { RawNewsItem } from '@/lib/news/aggregate';
import type { NewsStoryRow } from '@/types/database';

const NOW = Date.parse('2026-09-29T12:00:00Z');
const hoursAgo = (h: number) => NOW - h * 3_600_000;

function raw(source: string, title: string, summary: string, h: number, url = `https://${source}.test/${title.length}${h}`): RawNewsItem {
  return {
    title,
    summary,
    url,
    canonicalUrl: url,
    sourceName: source,
    image: '',
    publishedTs: hoursAgo(h),
    publishedISO: new Date(hoursAgo(h)).toISOString(),
  };
}

const withSource = (xs: RawNewsItem[]) => xs.map((x) => ({ ...x, source: x.sourceName }));

const alonso = [
  raw('Autosport', 'Aston Martin retains Alonso and Stroll for F1 2027', 'Fernando Alonso has confirmed he will continue with Aston Martin into the 2027 campaign', 3),
  raw('Motorsport', 'Fernando Alonso extends Aston Martin contract into F1 2027', 'Fernando Alonso has confirmed he will continue with Aston Martin into the 2027 campaign', 4),
  raw('BBC', 'Alonso on why he is staying in F1', 'Fernando Alonso commits to staying with Aston Martin for another year', 5),
];
const unrelated = raw('The Race', 'Imola building grandstands as finale plans shift', 'Abu Dhabi and Qatar options for the season finale', 6);

describe('clusterArticles', () => {
  it('groups one story across outlets and leaves unrelated news alone', () => {
    const clusters = clusterArticles(withSource([...alonso, unrelated]));
    expect(clusters).toHaveLength(2);
    expect(clusters.find((c) => c.length === 3)).toBeTruthy();
  });

  it('never puts two articles from the same outlet in one story', () => {
    const dup = raw('Autosport', 'Alonso extends Aston Martin contract into F1 2027', 'Fernando Alonso has confirmed he will continue with Aston Martin into the 2027 campaign', 2);
    const clusters = clusterArticles(withSource([...alonso, dup]));
    for (const c of clusters) {
      expect(new Set(c.map((x) => x.source)).size).toBe(c.length);
    }
  });

  it('does not chain: articles far apart in time stay separate', () => {
    const old = raw('RaceFans', 'Alonso extends Aston Martin deal into 2027 season', 'Fernando Alonso has confirmed he will continue with Aston Martin into the 2027 campaign', 200);
    expect(clusterArticles(withSource([alonso[0], old]))).toHaveLength(2);
  });
});

describe('copyright guard', () => {
  const src = [{ source: 'A', title: 'Russell holds off Verstappen to win in Baku', summary: 'The Mercedes driver led every lap' }];
  it('flags 7+ consecutive shared words', () => {
    expect(copiesSource('Russell holds off Verstappen to win in Baku', src)).toBe(true);
  });
  it('accepts an independent phrasing of the same facts', () => {
    expect(copiesSource('Mercedes won in Azerbaijan after fending off a late Red Bull charge', src)).toBe(false);
  });
  it('parseRewrite rejects copied output and reports different events as split', () => {
    const copied = { same_story: true, title_en: 'Russell holds off Verstappen to win in Baku', summary_en: 'x y z', title_tr: 'a', summary_tr: 'b' };
    expect(parseRewriteItem(copied, src)).toBeNull();
    const two = [...src, { source: 'B', title: 'Unrelated podcast promo', summary: 'Listen now' }];
    expect(parseRewriteItem({ same_story: false }, two)).toBe('split');
    // single-source stories are never split
    expect(parseRewriteItem({ same_story: false, title_en: 'a b', summary_en: 'c', title_tr: 'd', summary_tr: 'e' }, src)).not.toBe('split');
  });
  it('parseBatch maps array items to stories by index and survives garbage', () => {
    const ok = { story: 1, same_story: true, title_en: 'Mercedes wins in Azerbaijan', summary_en: 'A calm drive under two safety cars', title_tr: "Mercedes Azerbaycan'da kazandı", summary_tr: 'İki güvenlik aracına rağmen sakin bir sürüş' };
    const out = parseBatch(JSON.stringify([{ story: 0, same_story: false }, ok]), [[...src, { source: 'B', title: 'Other', summary: 'x' }], src]);
    expect(out[0]).toBe('split');
    expect(out[1]).toMatchObject({ titleEn: 'Mercedes wins in Azerbaijan' });
    expect(parseBatch('not json', [src, src])).toEqual([null, null]);
  });
});

describe('draftStories', () => {
  it('reuses the id of an existing story when member URLs overlap', () => {
    const existing: NewsStoryRow = {
      id: 'keep-me',
      title: 't',
      summary: 's',
      title_tr: null,
      summary_tr: null,
      image_url: null,
      published_at: new Date(hoursAgo(4)).toISOString(),
      sources: [{ name: 'Autosport', url: alonso[0].url, title: alonso[0].title, published_at: null }],
      fingerprint: fingerprintOf([alonso[0].url]),
      rewritten: true,
      cached_at: new Date(NOW).toISOString(),
    };
    const drafts = draftStories(alonso, [existing], NOW);
    expect(drafts).toHaveLength(1);
    expect(drafts[0].id).toBe('keep-me');
    expect(drafts[0].sources).toHaveLength(3);
    expect(drafts[0].fingerprint).not.toBe(existing.fingerprint); // membership changed -> rewrite
  });

  it('drops articles older than 7 days', () => {
    const stale = raw('The Race', 'Old news', 'Ancient history', 24 * 8);
    expect(draftStories([stale], [], NOW)).toHaveLength(0);
  });
});

// 14.5: the read chain is news_stories → news_cache → public/news-fallback.json.
// The live /api/news scrape is gone; no step may call the site over HTTP.
describe('getLatestNews read chain', () => {
  afterEach(() => {
    vi.doUnmock('@/lib/supabase');
    vi.doUnmock('@/lib/data/fs');
    vi.doUnmock('@/lib/data/siteUrl');
    vi.resetModules();
  });

  async function loadNews(tables: Record<string, unknown[]>, fallback: unknown[] | null) {
    vi.resetModules();
    const fetchSiteJson = vi.fn(async () => null);
    const readPublicJson = vi.fn(async () => fallback);
    const query = (table: string) => {
      const res = Promise.resolve({ data: tables[table] ?? [], error: null });
      const chain = { select: () => chain, order: () => chain, limit: () => res };
      return chain;
    };
    vi.doMock('@/lib/supabase', () => ({ getSupabaseClient: () => ({ from: query }) }));
    vi.doMock('@/lib/data/fs', () => ({ readPublicJson }));
    vi.doMock('@/lib/data/siteUrl', () => ({ fetchSiteJson, getSiteUrl: () => 'http://test.local' }));
    const mod = await import('@/lib/data/news');
    return { getLatestNews: mod.getLatestNews, fetchSiteJson, readPublicJson };
  }

  const fallbackItem = {
    id: 'fb-1',
    title: 'Static headline',
    summary: 'Static summary',
    url: 'https://example.com/a',
    sourceName: 'Example',
    image: 'https://example.com/a.jpg',
    publishedAt: '2026-10-01T10:00:00Z',
  };

  it('falls back to the static file when both tables are empty, without an HTTP call', async () => {
    const { getLatestNews, fetchSiteJson, readPublicJson } = await loadNews({}, [fallbackItem]);
    const items = await getLatestNews(5);
    expect(items.map((i) => i.id)).toEqual(['fb-1']);
    expect(readPublicJson).toHaveBeenCalledWith('news-fallback.json');
    expect(fetchSiteJson).not.toHaveBeenCalled();
  });

  it('returns [] when the tables and the static file are empty', async () => {
    const { getLatestNews, fetchSiteJson } = await loadNews({}, null);
    expect(await getLatestNews(5)).toEqual([]);
    expect(fetchSiteJson).not.toHaveBeenCalled();
  });

  it('serves news_cache rows before the static file', async () => {
    const row = {
      id: 'db-row',
      url: 'https://example.com/b',
      title: 'Cache headline',
      summary: 'Cache summary',
      description: null,
      source: 'Example',
      tags: null,
      image_url: 'https://example.com/b.jpg',
      published_at: '2026-10-02T10:00:00Z',
      title_tr: null,
      description_tr: null,
    };
    const { getLatestNews, readPublicJson } = await loadNews({ news_cache: [row] }, [fallbackItem]);
    const items = await getLatestNews(5);
    expect(items.map((i) => i.title)).toEqual(['Cache headline']);
    expect(readPublicJson).not.toHaveBeenCalled();
  });
});
