import { describe, it, expect } from 'vitest';
import { clusterArticles } from '@/lib/news/cluster';
import { copiesSource, parseRewrite } from '@/lib/news/rewrite';
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
  it('flags 5+ consecutive shared words', () => {
    expect(copiesSource('Russell holds off Verstappen to win', src)).toBe(true);
  });
  it('accepts an independent phrasing of the same facts', () => {
    expect(copiesSource('Mercedes won in Azerbaijan after fending off a late Red Bull charge', src)).toBe(false);
  });
  it('parseRewrite rejects copied output and reports different events as split', () => {
    const copied = JSON.stringify({ same_story: true, title_en: 'Russell holds off Verstappen to win', summary_en: 'x y z', title_tr: 'a', summary_tr: 'b' });
    expect(parseRewrite(copied, src)).toBeNull();
    expect(parseRewrite(JSON.stringify({ same_story: false }), src)).toBe('split');
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
