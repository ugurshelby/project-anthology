import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { basename, resolve } from 'node:path';

const STORY_ARRAY_NAMES = ['STORIES', 'stories', 'storyData', 'STORY_DATA', 'STORY_CATALOG'];
const RADIO_ARRAY_NAMES = ['RADIO_ARCHIVE', 'radioArchive', 'RADIO_MOMENTS', 'radioMoments'];

const F1_DATA_PATHS = [
  'migration-assets/components/f1Data.ts',
  'migration-assets/components/f1Data.js',
  'components/f1Data.ts',
  'components/f1Data.js',
];

const RADIO_JS_PATHS = [
  'migration-assets/public/radio-anthology/app.js',
  'migration-assets/radio-anthology/app.js',
  'public/radio-anthology/app.js',
  'radio-anthology/app.js',
];

const STORIES_OUT_DIR = resolve(process.cwd(), 'public/data/stories');
const RADIO_OUT_FILE = resolve(process.cwd(), 'public/data/radio/index.json');

function slugify(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function extractArrayLiteral(source: string, names: string[]): string | null {
  for (const name of names) {
    const startRe = new RegExp(
      `(?:export\\s+)?(?:const|let|var)\\s+${name}\\s*=\\s*\\[`,
      'm',
    );
    const startMatch = startRe.exec(source);
    if (!startMatch?.index && startMatch?.index !== 0) continue;

    const openBracket = source.indexOf('[', startMatch.index);
    if (openBracket < 0) continue;

    let depth = 0;
    for (let i = openBracket; i < source.length; i += 1) {
      const ch = source[i];
      if (ch === '[') depth += 1;
      if (ch === ']') {
        depth -= 1;
        if (depth === 0) {
          return source.slice(openBracket, i + 1);
        }
      }
    }
  }
  return null;
}

function parseArrayLiteral<T>(literal: string): T[] {
  try {
    const parsed = JSON.parse(literal) as unknown;
    return Array.isArray(parsed) ? (parsed as T[]) : [];
  } catch {
    try {
      const fn = new Function(`return (${literal});`);
      const parsed = fn() as unknown;
      return Array.isArray(parsed) ? (parsed as T[]) : [];
    } catch {
      return [];
    }
  }
}

function readFirstExisting(paths: string[]): { path: string; source: string } | null {
  for (const rel of paths) {
    const abs = resolve(process.cwd(), rel);
    if (!existsSync(abs)) continue;
    return { path: rel, source: readFileSync(abs, 'utf8') };
  }
  return null;
}

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
  content?: unknown;
  published?: boolean;
  sort_order?: number | null;
  sortOrder?: number | null;
}

interface RawRadioMoment {
  slug?: string;
  id?: string;
  driver?: string;
  team?: string;
  constructor_id?: string | null;
  constructorId?: string | null;
  quote?: string;
  context?: string | null;
  significance?: string | null;
  year?: number | string | null;
  round?: number | string | null;
  gp_name?: string | null;
  gpName?: string | null;
  gp?: string | null;
  tags?: string[] | null;
  cover_image?: string | null;
  coverImage?: string | null;
  published?: boolean;
}

function normalizeStory(raw: RawStory, index: number): RawStory | null {
  if (!raw.title) return null;
  const slug =
    raw.slug ??
    (raw.id ? slugify(String(raw.id)) : slugify(String(raw.title)));
  if (!slug) return null;

  const sortOrder = raw.sort_order ?? raw.sortOrder ?? index + 1;

  return {
    slug,
    title: raw.title,
    subtitle: raw.subtitle ?? null,
    year: raw.year ?? null,
    era: raw.era ?? null,
    category: raw.category ?? null,
    tags: raw.tags ?? null,
    cover_image:
      raw.cover_image ??
      raw.coverImage ??
      `/images/stories/full/${sortOrder}.png`,
    cover_image_landscape:
      raw.cover_image_landscape ??
      raw.coverImageLandscape ??
      `/images/stories/landscape/${sortOrder}.png`,
    cover_image_portrait:
      raw.cover_image_portrait ??
      raw.coverImagePortrait ??
      `/images/stories/portrait/${sortOrder}.png`,
    content: raw.content ?? null,
    published: raw.published ?? true,
    sort_order: sortOrder,
  };
}

function normalizeRadio(raw: RawRadioMoment): RawRadioMoment | null {
  const slug = raw.slug ?? (raw.id ? String(raw.id) : undefined);
  if (!slug || !raw.driver || !raw.team || !raw.quote) return null;
  return {
    slug,
    driver: raw.driver,
    team: raw.team,
    constructor_id: raw.constructor_id ?? raw.constructorId ?? null,
    quote: raw.quote,
    context: raw.context ?? null,
    significance: raw.significance ?? null,
    year: raw.year ?? null,
    round: raw.round ?? null,
    gp_name: raw.gp_name ?? raw.gpName ?? raw.gp ?? null,
    tags: raw.tags ?? null,
    cover_image: raw.cover_image ?? raw.coverImage ?? null,
    published: raw.published ?? true,
  };
}

function extractStories(): { count: number; source: string | null } {
  const file = readFirstExisting(F1_DATA_PATHS);
  if (!file) {
    console.log('No f1Data source found. Expected migration-assets/components/f1Data.ts');
    return { count: 0, source: null };
  }

  const literal = extractArrayLiteral(file.source, STORY_ARRAY_NAMES);
  if (!literal) {
    console.log(`No story array in ${file.path} (tried: ${STORY_ARRAY_NAMES.join(', ')})`);
    return { count: 0, source: file.path };
  }

  const raws = parseArrayLiteral<RawStory>(literal);
  mkdirSync(STORIES_OUT_DIR, { recursive: true });

  const index: Array<{
    slug: string;
    title: string;
    subtitle: string | null;
    year: number | string | null;
    category: string | null;
    sort_order: number | null;
  }> = [];

  let written = 0;
  for (let i = 0; i < raws.length; i += 1) {
    const story = normalizeStory(raws[i], i);
    if (!story?.slug) continue;

    writeFileSync(
      resolve(STORIES_OUT_DIR, `${story.slug}.json`),
      `${JSON.stringify(story, null, 2)}\n`,
      'utf8',
    );
    index.push({
      slug: story.slug,
      title: story.title!,
      subtitle: story.subtitle ?? null,
      year: story.year ?? null,
      category: story.category ?? null,
      sort_order: story.sort_order ?? null,
    });
    written += 1;
    console.log(`WROTE story ${story.slug}`);
  }

  writeFileSync(
    resolve(STORIES_OUT_DIR, 'index.json'),
    `${JSON.stringify(index, null, 2)}\n`,
    'utf8',
  );

  return { count: written, source: file.path };
}

function extractRadio(): { count: number; sources: string[] } {
  const bySlug = new Map<string, RawRadioMoment>();
  const sources: string[] = [];

  const f1File = readFirstExisting(F1_DATA_PATHS);
  if (f1File) {
    const literal = extractArrayLiteral(f1File.source, RADIO_ARRAY_NAMES);
    if (literal) {
      sources.push(f1File.path);
      for (const raw of parseArrayLiteral<RawRadioMoment>(literal)) {
        const normalized = normalizeRadio(raw);
        if (normalized) bySlug.set(normalized.slug!, normalized);
      }
    }
  }

  for (const rel of RADIO_JS_PATHS) {
    const abs = resolve(process.cwd(), rel);
    if (!existsSync(abs)) continue;
    const literal = extractArrayLiteral(readFileSync(abs, 'utf8'), RADIO_ARRAY_NAMES);
    if (!literal) continue;
    sources.push(rel);
    for (const raw of parseArrayLiteral<RawRadioMoment>(literal)) {
      const normalized = normalizeRadio(raw);
      if (normalized) bySlug.set(normalized.slug!, normalized);
    }
  }

  const moments = [...bySlug.values()];
  if (moments.length === 0) {
    console.log(
      'No radio archive found. Expected RADIO_ARCHIVE in migration-assets/public/radio-anthology/app.js',
    );
    return { count: 0, sources };
  }

  mkdirSync(resolve(process.cwd(), 'public/data/radio'), { recursive: true });
  writeFileSync(RADIO_OUT_FILE, `${JSON.stringify(moments, null, 2)}\n`, 'utf8');
  for (const m of moments) {
    console.log(`WROTE radio ${m.slug}`);
  }

  return { count: moments.length, sources };
}

function main(): void {
  console.log('=== Extract stories ===');
  const stories = extractStories();
  console.log(`Stories written: ${stories.count} (source: ${stories.source ?? 'none'})\n`);

  console.log('=== Extract radio ===');
  const radio = extractRadio();
  console.log(
    `Radio moments written: ${radio.count} (sources: ${radio.sources.join(', ') || 'none'})\n`,
  );
}

main();
