import { describe, it, expect } from 'vitest';
import { processFeeds, type RawNewsItem } from '@/lib/news/aggregate';

/**
 * processFeeds is the pure core of the aggregator (the network fetch lives in
 * aggregate(), which is integration-level). It filters to F1, dedupes by
 * canonicalUrl keeping the newest, clusters near-duplicate titles, and sorts
 * newest-first. Fixtures use `/f1/` urls so isF1Related always passes.
 */

function raw(overrides: Partial<RawNewsItem>): RawNewsItem {
  return {
    title: 'Verstappen takes pole in qualifying',
    summary: 'Formula 1 qualifying report',
    url: 'https://example.com/f1/news/a',
    canonicalUrl: 'https://example.com/f1/news/a',
    sourceName: 'Test',
    image: '',
    publishedTs: 1_000,
    publishedISO: new Date(1_000).toISOString(),
    ...overrides,
  };
}

describe('processFeeds', () => {
  it('dedupes the same canonical URL to a single item (keeps newest)', () => {
    const items = processFeeds([
      raw({ canonicalUrl: 'https://x/f1/1', url: 'https://x/f1/1', publishedTs: 1_000, title: 'Hamilton wins the F1 race' }),
      raw({ canonicalUrl: 'https://x/f1/1', url: 'https://x/f1/1', publishedTs: 5_000, title: 'Hamilton wins the F1 race (updated)' }),
    ]);
    expect(items).toHaveLength(1);
    expect(items[0].publishedTs).toBe(5_000);
  });

  it('returns [] for an empty feed', () => {
    expect(processFeeds([])).toEqual([]);
  });

  it('drops non-F1 items', () => {
    const items = processFeeds([
      raw({
        canonicalUrl: 'https://x/tennis/1',
        url: 'https://x/tennis/1',
        title: 'Wimbledon tennis final result',
        summary: 'A tennis match recap',
      }),
    ]);
    expect(items).toEqual([]);
  });

  it('sorts surviving items newest-first', () => {
    const items = processFeeds([
      raw({ canonicalUrl: 'https://x/f1/old', url: 'https://x/f1/old', publishedTs: 1_000, title: 'Leclerc qualifying lap in F1' }),
      raw({ canonicalUrl: 'https://x/f1/new', url: 'https://x/f1/new', publishedTs: 9_000, title: 'Norris fastest in F1 practice' }),
    ]);
    expect(items[0].publishedTs).toBe(9_000);
    expect(items[1].publishedTs).toBe(1_000);
  });
});
