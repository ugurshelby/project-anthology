import { getSupabaseAdmin } from '@/lib/supabase';
import type { Story } from '@/types/database';
import { readPublicJson } from '@/lib/data/fs';
import { logFallback, logSupabaseCall, timed } from '@/lib/data/logger';

export type { Story } from '@/types/database';

const STORIES_INDEX = 'data/stories/index.json';

interface StoryIndexEntry {
  slug: string;
  title: string;
  subtitle?: string | null;
  year?: number | null;
  era?: string | null;
  category?: string | null;
  tags?: string[] | null;
  sort_order?: number | null;
  cover_image?: string | null;
  cover_image_landscape?: string | null;
  cover_image_portrait?: string | null;
}

interface StoryJson extends Partial<Story> {
  slug: string;
}

function storyDefaults(partial: StoryJson, slug: string): Story {
  const now = '1970-01-01T00:00:00.000Z';
  return {
    id: partial.id ?? slug,
    slug,
    title: partial.title ?? slug,
    subtitle: partial.subtitle ?? null,
    year: partial.year ?? null,
    era: partial.era ?? null,
    category: partial.category ?? null,
    tags: partial.tags ?? null,
    cover_image: partial.cover_image ?? null,
    cover_image_landscape: partial.cover_image_landscape ?? null,
    cover_image_portrait: partial.cover_image_portrait ?? null,
    content: partial.content ?? null,
    published: partial.published ?? true,
    sort_order: partial.sort_order ?? null,
    created_at: partial.created_at ?? now,
    updated_at: partial.updated_at ?? now,
  };
}

function indexEntryToStory(entry: StoryIndexEntry): Story {
  return storyDefaults(
    {
      slug: entry.slug,
      title: entry.title,
      subtitle: entry.subtitle ?? null,
      year: entry.year ?? null,
      era: entry.era ?? null,
      category: entry.category ?? null,
      tags: entry.tags ?? null,
      sort_order: entry.sort_order ?? null,
      cover_image: entry.cover_image ?? null,
      cover_image_landscape: entry.cover_image_landscape ?? null,
      cover_image_portrait: entry.cover_image_portrait ?? null,
      published: true,
    },
    entry.slug,
  );
}

async function loadStoriesFromFiles(): Promise<Story[]> {
  const index = await readPublicJson<StoryIndexEntry[]>(STORIES_INDEX);
  if (!index?.length) return [];

  const stories: Story[] = [];
  for (const entry of index) {
    const full = await readPublicJson<StoryJson>(`data/stories/${entry.slug}.json`);
    stories.push(full ? storyDefaults(full, entry.slug) : indexEntryToStory(entry));
  }

  stories.sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0));
  return stories;
}

export async function getAllStories(): Promise<Story[]> {
  const supabase = getSupabaseAdmin();
  if (supabase) {
    const { result, durationMs } = await timed(async () =>
      supabase
        .from('stories')
        .select('*')
        .eq('published', true)
        .order('sort_order', { ascending: true, nullsFirst: false }),
    );
    logSupabaseCall('stories', 'select published order sort_order', durationMs);

    if (!result.error && result.data?.length) {
      return result.data as Story[];
    }
    if (result.error) {
      logFallback('supabase stories', 'public/data/stories', result.error.message);
    } else {
      logFallback('supabase stories (empty)', 'public/data/stories');
    }
  } else {
    logFallback('supabase client unavailable', 'public/data/stories');
  }

  try {
    return await loadStoriesFromFiles();
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    logFallback('public stories files', 'empty array', msg);
    return [];
  }
}

export async function getStoryBySlug(slug: string): Promise<Story | null> {
  const supabase = getSupabaseAdmin();
  if (supabase) {
    const { result, durationMs } = await timed(async () =>
      supabase.from('stories').select('*').eq('slug', slug).eq('published', true).maybeSingle(),
    );
    logSupabaseCall('stories', `select slug=${slug}`, durationMs);

    if (!result.error && result.data) {
      return result.data as Story;
    }
    if (result.error) {
      logFallback(`supabase story ${slug}`, `public/data/stories/${slug}.json`, result.error.message);
    } else {
      logFallback(`supabase story ${slug} (missing)`, `public/data/stories/${slug}.json`);
    }
  } else {
    logFallback('supabase client unavailable', `public/data/stories/${slug}.json`);
  }

  const raw = await readPublicJson<StoryJson>(`data/stories/${slug}.json`);
  if (!raw) return null;
  return storyDefaults(raw, slug);
}

export async function getRelatedStories(slug: string, limit = 3): Promise<Story[]> {
  const current = await getStoryBySlug(slug);
  if (!current?.tags?.length) return [];

  const tags = new Set(current.tags.map((t) => t.toLowerCase()));
  const all = await getAllStories();
  const scored = all
    .filter((s) => s.slug !== slug)
    .map((s) => {
      const overlap = (s.tags ?? []).filter((t) => tags.has(t.toLowerCase())).length;
      return { story: s, overlap };
    })
    .filter((x) => x.overlap > 0)
    .sort((a, b) => b.overlap - a.overlap || (a.story.sort_order ?? 0) - (b.story.sort_order ?? 0));

  return scored.slice(0, limit).map((x) => x.story);
}
