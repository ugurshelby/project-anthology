/**
 * Stories read layer — Supabase `stories` SELECT (published only).
 *
 * Stories are seeded by scripts/seed-stories.ts (content jsonb holds subtitle,
 * year, category, heroImage, blocks). RLS already restricts anon reads to
 * published=true, but we filter explicitly too. Returns a flat, typed view so
 * pages don't touch the jsonb shape directly.
 */

import { getSupabaseClient } from '@/lib/supabase';
import type { StoryRow } from '@/types/database';
import type { StoryBlock, StoryContentJson } from '@/data/stories/types';
import { logSupabaseCall, timed } from '@/lib/data/logger';

export interface Story {
  slug: string;
  title: string;
  subtitle: string;
  year: string;
  category: string;
  heroImage: string;
  blocks: StoryBlock[];
  sortOrder: number;
  /** Row timestamps (ISO) — feed Article JSON-LD datePublished/dateModified and RSS. */
  createdAt: string;
  updatedAt: string;
}

function parseContent(row: StoryRow): Story {
  const c = (row.content ?? {}) as Partial<StoryContentJson>;
  return {
    slug: row.slug,
    title: row.title,
    subtitle: typeof c.subtitle === 'string' ? c.subtitle : '',
    year: typeof c.year === 'string' ? c.year : '',
    category: typeof c.category === 'string' ? c.category : '',
    heroImage: typeof c.heroImage === 'string' ? c.heroImage : '/placeholder.svg',
    blocks: Array.isArray(c.blocks) ? (c.blocks as StoryBlock[]) : [],
    sortOrder: row.sort_order,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

/** Published stories, ordered by sort_order (newest year first). */
export async function getPublishedStories(): Promise<Story[]> {
  try {
    const supabase = getSupabaseClient();
    const { result, durationMs } = await timed(async () =>
      supabase
        .from('stories')
        .select('*')
        .eq('published', true)
        .order('sort_order', { ascending: true })
        .order('slug', { ascending: true }),
    );
    logSupabaseCall('stories', 'published order sort_order', durationMs);
    if (result.error || !result.data?.length) return [];
    return (result.data as StoryRow[]).map(parseContent);
  } catch {
    return [];
  }
}

/** A single published story by slug, or null. */
export async function getStoryBySlug(slug: string): Promise<Story | null> {
  try {
    const supabase = getSupabaseClient();
    const { result, durationMs } = await timed(async () =>
      supabase
        .from('stories')
        .select('*')
        .eq('published', true)
        .eq('slug', slug)
        .maybeSingle(),
    );
    logSupabaseCall('stories', `slug ${slug}`, durationMs);
    if (result.error || !result.data) return null;
    return parseContent(result.data as StoryRow);
  } catch {
    return null;
  }
}

/** All published slugs — for generateStaticParams. */
export async function getStorySlugs(): Promise<string[]> {
  try {
    const supabase = getSupabaseClient();
    const { result } = await timed(async () =>
      supabase.from('stories').select('slug').eq('published', true),
    );
    if (result.error || !result.data?.length) return [];
    return (result.data as Array<{ slug: string }>).map((r) => r.slug);
  } catch {
    return [];
  }
}

export interface StorySitemapEntry {
  slug: string;
  updatedAt: string;
}

/** Published slugs with real updated_at — sitemap lastModified source. */
export async function getStorySitemapEntries(): Promise<StorySitemapEntry[]> {
  try {
    const supabase = getSupabaseClient();
    const { result } = await timed(async () =>
      supabase.from('stories').select('slug, updated_at').eq('published', true),
    );
    if (result.error || !result.data?.length) return [];
    return (result.data as Array<{ slug: string; updated_at: string }>).map((r) => ({
      slug: r.slug,
      updatedAt: r.updated_at,
    }));
  } catch {
    return [];
  }
}
