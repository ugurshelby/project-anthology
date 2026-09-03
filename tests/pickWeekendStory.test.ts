import { describe, it, expect } from 'vitest';
import { pickWeekendStory } from '@/lib/home/pickWeekendStory';
import type { Story } from '@/lib/data/stories';

function story(partial: Partial<Story> & Pick<Story, 'slug' | 'title'>): Story {
  return {
    subtitle: '',
    year: '2019',
    category: 'archive',
    heroImage: '/placeholder.svg',
    blocks: [],
    sortOrder: 1,
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-01-01T00:00:00Z',
    ...partial,
  };
}

describe('pickWeekendStory', () => {
  it('returns null when there are no stories', () => {
    expect(pickWeekendStory([])).toBeNull();
  });

  it('prefers a story that mentions the upcoming race', () => {
    const stories = [
      story({ slug: 'spa-1998', title: 'Spa 1998' }),
      story({ slug: 'monza-2019', title: 'Monza 2019: The Cathedral' }),
    ];
    expect(pickWeekendStory(stories, ['Italian Grand Prix', 'Autodromo Nazionale di Monza'])?.slug).toBe(
      'monza-2019',
    );
  });

  it('falls back to the first published story', () => {
    const stories = [story({ slug: 'first', title: 'First' }), story({ slug: 'second', title: 'Second' })];
    expect(pickWeekendStory(stories, 'São Paulo Grand Prix')?.slug).toBe('first');
  });
});
