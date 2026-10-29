import { describe, expect, it } from 'vitest';
import { countChangedStories } from '@/lib/news/stories';
import type { NewsStoryRow } from '@/types/database';

const base: NewsStoryRow = {
  id: 's1',
  title: 'Title',
  summary: 'Summary',
  title_tr: 'Başlık',
  summary_tr: 'Özet',
  image_url: 'https://example.com/a.jpg',
  published_at: '2026-10-29T00:26:45.000Z',
  sources: [{ name: 'A', url: 'https://a.example/1', title: 'T', published_at: null }],
  fingerprint: 'f',
  rewritten: true,
  cached_at: '2026-10-29T01:00:00.000Z',
} as NewsStoryRow;

describe('countChangedStories (cache revalidation after sync-news)', () => {
  it('ignores rows that only differ in storage form (jsonb key order, timestamp format, cached_at)', () => {
    const stored = {
      ...base,
      published_at: '2026-10-29 00:26:45+00',
      cached_at: '2026-10-28T01:00:00.000Z',
      sources: [{ url: 'https://a.example/1', name: 'A', title: 'T', published_at: null }],
    } as NewsStoryRow;
    expect(countChangedStories([base], [stored])).toBe(0);
  });

  it('counts new stories and any field a page shows', () => {
    expect(countChangedStories([base], [])).toBe(1);
    expect(countChangedStories([{ ...base, image_url: null }], [base])).toBe(1);
    expect(countChangedStories([{ ...base, title_tr: 'Yeni' }], [base])).toBe(1);
    const moreSources = { ...base, sources: [...(base.sources ?? []), { name: 'B', url: 'https://b.example/2', title: 'T', published_at: null }] } as NewsStoryRow;
    expect(countChangedStories([moreSources], [base])).toBe(1);
  });
});
