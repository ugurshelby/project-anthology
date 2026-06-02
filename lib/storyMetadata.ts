import type { Story } from '@/types/database';
import { getSupabaseAdmin } from '@/lib/supabase';

/** Lightweight story row for related-story scoring (no full content). */
export interface StoryListItem {
  id: string;
  slug: string;
  title: string;
  subtitle: string;
  year: string;
  category: string;
  content: unknown[];
}

function mapStoryRow(row: Story): StoryListItem {
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    subtitle: row.subtitle ?? '',
    year: row.year != null ? String(row.year) : '',
    category: row.category ?? '',
    content: [],
  };
}

/** Sync catalog used by `utils/relatedStories.ts`; populate via `loadStoryMetadata()`. */
export let storyMetadata: StoryListItem[] = [];

export async function loadStoryMetadata(): Promise<StoryListItem[]> {
  const supabase = getSupabaseAdmin();
  if (!supabase) {
    storyMetadata = [];
    return storyMetadata;
  }

  const { data, error } = await supabase
    .from('stories')
    .select('id, slug, title, subtitle, year, category')
    .eq('published', true)
    .order('sort_order', { ascending: true, nullsFirst: false });

  if (error || !data?.length) {
    storyMetadata = [];
    return storyMetadata;
  }

  storyMetadata = (data as Story[]).map(mapStoryRow);
  return storyMetadata;
}
