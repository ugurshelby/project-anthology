import { createClient } from '@supabase/supabase-js';
import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { basename, join, relative, resolve } from 'node:path';
import type { Database } from '../types/database';
import { loadEnvLocal, requireSupabaseAdminConfig } from './load-env';

loadEnvLocal();

type StoryInsert = Database['public']['Tables']['stories']['Insert'];

interface RawStory {
  slug?: string;
  id?: string;
  title?: string;
  subtitle?: string | null;
  year?: number | string | null;
  era?: string | null;
  category?: string | null;
  tags?: string[] | null;
  cover_image?: string | null;
  cover_image_landscape?: string | null;
  cover_image_portrait?: string | null;
  coverImage?: string | null;
  coverImageLandscape?: string | null;
  coverImagePortrait?: string | null;
  content?: Record<string, unknown> | unknown[] | null;
  published?: boolean;
  sort_order?: number | null;
  sortOrder?: number | null;
}

const STORY_SEARCH_ROOTS = [
  'public/data/stories',
  'public/data',
  'src/data/stories',
  'src/data',
  'stories',
  'data/stories',
  'data',
];

const STORY_METADATA_FILES = [
  'public/data/storyMetadata.json',
  'public/data/story-metadata.json',
  'data/storyMetadata.json',
];

const EXCLUDED_PATH_PARTS = [
  '/f1/',
  '\\f1\\',
  'radio-images.json',
  'season-tracker-images.json',
  'circuit-images.json',
  'news-fallback.json',
  'calendar.json',
  '/rounds/',
  '\\rounds\\',
  '/circuits/',
  '\\circuits\\',
];

function isExcludedPath(filePath: string): boolean {
  const normalized = filePath.replace(/\\/g, '/');
  return EXCLUDED_PATH_PARTS.some((part) => normalized.includes(part.replace(/\\/g, '/')));
}

function walkJsonFiles(dir: string, out: string[] = []): string[] {
  if (!existsSync(dir)) return out;
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    const rel = relative(process.cwd(), full);
    if (isExcludedPath(rel)) continue;
    const stat = statSync(full);
    if (stat.isDirectory()) {
      walkJsonFiles(full, out);
    } else if (entry.endsWith('.json')) {
      if (entry === 'index.json' && dir.replace(/\\/g, '/').endsWith('/stories')) continue;
      out.push(full);
    }
  }
  return out;
}

function slugify(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function parseYear(value: RawStory['year']): number | null {
  if (value == null || value === '') return null;
  const n = typeof value === 'number' ? value : parseInt(String(value), 10);
  return Number.isFinite(n) ? n : null;
}

function looksLikeStory(value: unknown): value is RawStory {
  if (!value || typeof value !== 'object') return false;
  const obj = value as RawStory;
  return Boolean(obj.title && (obj.slug || obj.id));
}

function extractStoriesFromJson(parsed: unknown, sourceFile: string): RawStory[] {
  if (Array.isArray(parsed)) {
    return parsed.filter(looksLikeStory);
  }
  if (!parsed || typeof parsed !== 'object') return [];

  const obj = parsed as Record<string, unknown>;

  if (Array.isArray(obj.stories)) {
    return obj.stories.filter(looksLikeStory);
  }
  if (Array.isArray(obj.items)) {
    return obj.items.filter(looksLikeStory);
  }
  if (looksLikeStory(parsed)) {
    return [parsed as RawStory];
  }

  // storyMetadata-style map keyed by slug
  const values = Object.values(obj);
  if (values.length > 0 && values.every((v) => looksLikeStory(v))) {
    return values.map((v) => v as RawStory);
  }

  // Index file keyed by slug without title at top level — skip
  if (basename(sourceFile).startsWith('story') && obj.version != null) {
    return [];
  }

  return [];
}

function inferCoverPaths(raw: RawStory, sortOrder: number | null): {
  cover_image: string | null;
  cover_image_landscape: string | null;
  cover_image_portrait: string | null;
} {
  const landscape =
    raw.cover_image_landscape ??
    raw.coverImageLandscape ??
    raw.cover_image ??
    raw.coverImage ??
    null;
  const portrait = raw.cover_image_portrait ?? raw.coverImagePortrait ?? null;
  const full = raw.cover_image ?? raw.coverImage ?? landscape;

  if (landscape || portrait || full) {
    return {
      cover_image: full,
      cover_image_landscape: landscape,
      cover_image_portrait: portrait,
    };
  }

  if (sortOrder == null) {
    return { cover_image: null, cover_image_landscape: null, cover_image_portrait: null };
  }

  const n = sortOrder;
  return {
    cover_image: `/images/stories/full/${n}.png`,
    cover_image_landscape: `/images/stories/landscape/${n}.png`,
    cover_image_portrait: `/images/stories/portrait/${n}.png`,
  };
}

function mapStory(raw: RawStory, index: number): StoryInsert | null {
  if (!raw.title) return null;

  const slug =
    raw.slug ??
    (raw.id ? slugify(String(raw.id)) : slugify(String(raw.title)));
  if (!slug) return null;

  const sortOrder =
    raw.sort_order ?? raw.sortOrder ?? (index >= 0 ? index + 1 : null);
  const covers = inferCoverPaths(raw, sortOrder);

  let content: Record<string, unknown> | null = null;
  if (Array.isArray(raw.content)) {
    content = { blocks: raw.content };
  } else if (raw.content && typeof raw.content === 'object') {
    content = raw.content as Record<string, unknown>;
  }

  return {
    slug,
    title: raw.title,
    subtitle: raw.subtitle ?? null,
    year: parseYear(raw.year),
    era: raw.era ?? null,
    category: raw.category ?? null,
    tags: raw.tags ?? null,
    cover_image: covers.cover_image,
    cover_image_landscape: covers.cover_image_landscape,
    cover_image_portrait: covers.cover_image_portrait,
    content,
    published: raw.published ?? true,
    sort_order: sortOrder,
  };
}

function discoverStoryFiles(): string[] {
  const files = new Set<string>();

  for (const root of STORY_SEARCH_ROOTS) {
    for (const file of walkJsonFiles(resolve(process.cwd(), root))) {
      files.add(file);
    }
  }

  for (const rel of STORY_METADATA_FILES) {
    const abs = resolve(process.cwd(), rel);
    if (existsSync(abs)) files.add(abs);
  }

  return [...files];
}

function loadStoriesFromFiles(files: string[]): { story: StoryInsert; source: string }[] {
  const bySlug = new Map<string, { story: StoryInsert; source: string }>();
  let index = 0;

  for (const file of files) {
    let parsed: unknown;
    try {
      parsed = JSON.parse(readFileSync(file, 'utf8'));
    } catch {
      console.error(`ERROR parsing ${relative(process.cwd(), file)}`);
      continue;
    }

    const raws = extractStoriesFromJson(parsed, file);
    for (const raw of raws) {
      const mapped = mapStory(raw, index);
      index += 1;
      if (!mapped) continue;
      bySlug.set(mapped.slug, {
        story: mapped,
        source: relative(process.cwd(), file),
      });
    }
  }

  return [...bySlug.values()];
}

async function main(): Promise<void> {
  const { url, serviceKey } = requireSupabaseAdminConfig();
  const supabase = createClient<Database>(url, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const files = discoverStoryFiles();
  console.log(`Found ${files.length} candidate JSON file(s)`);

  const stories = loadStoriesFromFiles(files);
  if (stories.length === 0) {
    console.log('No story records discovered. Add JSON under public/data/stories/ or storyMetadata.json');
    return;
  }

  const { data: existingRows, error: existingError } = await supabase
    .from('stories')
    .select('slug');
  if (existingError) {
    throw new Error(`Failed to read existing stories: ${existingError.message}`);
  }

  const existingSlugs = new Set((existingRows ?? []).map((r) => r.slug));

  let seeded = 0;
  let skipped = 0;
  let errors = 0;

  for (const { story } of stories) {
    const alreadyExists = existingSlugs.has(story.slug);

    const { error } = await supabase
      .from('stories')
      .upsert(story, { onConflict: 'slug' });

    if (error) {
      console.error(`ERROR ${story.slug}: ${error.message}`);
      errors += 1;
      continue;
    }

    if (alreadyExists) {
      console.log(`SKIPPED ${story.slug} (already exists)`);
      skipped += 1;
    } else {
      console.log(`SEEDED ${story.slug}`);
      seeded += 1;
      existingSlugs.add(story.slug);
    }
  }

  const { count, error: countError } = await supabase
    .from('stories')
    .select('*', { count: 'exact', head: true });
  if (countError) {
    console.error(`Count error: ${countError.message}`);
  } else {
    console.log(`\nStories total in DB: ${count ?? 0}`);
  }

  console.log(`\nSummary: seeded=${seeded}, skipped=${skipped}, errors=${errors}`);
}

main().catch((err: unknown) => {
  console.error(err instanceof Error ? err.message : err);
  process.exit(1);
});
