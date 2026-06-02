import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

const MIGRATION_DIR = resolve(process.cwd(), 'migration-source');
const STORIES_OUT_DIR = resolve(process.cwd(), 'public/data/stories');
const RADIO_OUT_FILE = resolve(process.cwd(), 'public/data/radio/index.json');
const RADIO_IMAGES_FILE = resolve(process.cwd(), 'public/data/radio-images.json');

/** slug → image number for /images/stories/{full|landscape|portrait}/{n}.png */
const HERO_IMAGE_BY_SLUG: Record<string, number> = {
  'senna-monaco': 1,
  'hunt-lauda': 2,
  'massa-2008': 3,
  'schumacher-ferrari': 4,
  'hakkinen-schumacher': 5,
  'hamilton-silverstone': 6,
  'button-canada': 7,
  'fangio-nurburgring': 8,
  'dijon-1979': 9,
  'imola-1994': 10,
  'brawn-2009': 11,
  'schumacher-1994-spain': 12,
  'collins-fangio-1956': 13,
  'monaco-1982': 14,
  'jerez-1997': 15,
  'senna-donington-1993': 16,
  'jaguar-monaco-diamond': 17,
};

interface StoryMeta {
  id: string;
  title: string;
  subtitle?: string | null;
  year?: string | number | null;
  category?: string | null;
  tags?: string[] | null;
  heroImage?: string | null;
}

interface StoryBlock {
  type: string;
  text?: string;
  author?: string;
  src?: string;
  caption?: string;
  layout?: string;
  [key: string]: unknown;
}

interface StoryJson {
  slug: string;
  title: string;
  subtitle: string | null;
  year: number | null;
  category: string | null;
  tags: string[];
  cover_image: string;
  cover_image_landscape: string;
  cover_image_portrait: string;
  content: StoryBlock[];
  published: boolean;
  sort_order: number;
}

interface RadioJson {
  id: string;
  slug: string;
  driver: string;
  team: string;
  constructorId: string | null;
  quote: string;
  context: string | null;
  significance: string | null;
  year: number | null;
  round: number | null;
  gp_name: string | null;
  tags: string[];
  audio_url: string | null;
  cover_image?: string | null;
}

function extractBracketLiteral(source: string, startPattern: RegExp): string | null {
  const startMatch = startPattern.exec(source);
  if (!startMatch?.index && startMatch?.index !== 0) return null;

  const open = source.indexOf('[', startMatch.index);
  if (open < 0) return null;

  let depth = 0;
  for (let i = open; i < source.length; i += 1) {
    const ch = source[i];
    if (ch === '[') depth += 1;
    if (ch === ']') {
      depth -= 1;
      if (depth === 0) return source.slice(open, i + 1);
    }
  }
  return null;
}

function extractBraceObjectLiteral(source: string, startPattern: RegExp): string | null {
  const startMatch = startPattern.exec(source);
  if (!startMatch?.index && startMatch?.index !== 0) return null;

  const open = source.indexOf('{', startMatch.index);
  if (open < 0) return null;

  let depth = 0;
  let inString: '"' | "'" | '`' | null = null;
  let escaped = false;

  for (let i = open; i < source.length; i += 1) {
    const ch = source[i];

    if (inString) {
      if (escaped) {
        escaped = false;
        continue;
      }
      if (ch === '\\') {
        escaped = true;
        continue;
      }
      if (ch === inString) inString = null;
      continue;
    }

    if (ch === '"' || ch === "'" || ch === '`') {
      inString = ch;
      continue;
    }

    if (ch === '{') depth += 1;
    if (ch === '}') {
      depth -= 1;
      if (depth === 0) return source.slice(open, i + 1);
    }
  }
  return null;
}

function parseTsValue<T>(literal: string): T {
  try {
    return JSON.parse(literal) as T;
  } catch {
    const fn = new Function(`return (${literal});`);
    return fn() as T;
  }
}

function coverPathsForSlug(slug: string): {
  cover_image: string;
  cover_image_landscape: string;
  cover_image_portrait: string;
} {
  const n = HERO_IMAGE_BY_SLUG[slug];
  if (!n) {
    throw new Error(`Missing hero image mapping for slug: ${slug}`);
  }
  return {
    cover_image: `/images/stories/full/${n}.png`,
    cover_image_landscape: `/images/stories/landscape/${n}.png`,
    cover_image_portrait: `/images/stories/portrait/${n}.png`,
  };
}

function parseYear(value: string | number | null | undefined): number | null {
  if (value == null || value === '') return null;
  const n = typeof value === 'number' ? value : parseInt(String(value), 10);
  return Number.isFinite(n) ? n : null;
}

function loadStoryMetadata(): StoryMeta[] {
  const path = resolve(MIGRATION_DIR, 'storyMetadata.ts');
  if (!existsSync(path)) {
    throw new Error(`Missing ${path}`);
  }
  const source = readFileSync(path, 'utf8');
  const literal = extractBracketLiteral(
    source,
    /export\s+const\s+storyMetadata[^=]*=\s*\[/,
  );
  if (!literal) throw new Error('Could not parse storyMetadata array');
  return parseTsValue<StoryMeta[]>(literal);
}

function loadStoryContentMap(): Record<string, StoryBlock[]> {
  const path = resolve(MIGRATION_DIR, 'storyContent.ts');
  if (!existsSync(path)) {
    throw new Error(`Missing ${path}`);
  }
  const source = readFileSync(path, 'utf8');
  const literal = extractBraceObjectLiteral(
    source,
    /export\s+const\s+storyContentMap[^=]*=\s*\{/,
  );
  if (!literal) throw new Error('Could not parse storyContentMap object');
  return parseTsValue<Record<string, StoryBlock[]>>(literal);
}

function loadRadioCovers(): Record<string, string> {
  if (!existsSync(RADIO_IMAGES_FILE)) return {};
  try {
    const data = JSON.parse(readFileSync(RADIO_IMAGES_FILE, 'utf8')) as {
      episodes?: Record<string, { cover?: string }>;
    };
    const out: Record<string, string> = {};
    for (const [slug, ep] of Object.entries(data.episodes ?? {})) {
      if (ep.cover) out[slug] = ep.cover;
    }
    return out;
  } catch {
    return {};
  }
}

function extractStories(): number {
  const metadata = loadStoryMetadata();
  const contentMap = loadStoryContentMap();

  mkdirSync(STORIES_OUT_DIR, { recursive: true });

  const index: Array<{
    slug: string;
    title: string;
    subtitle: string | null;
    year: number | null;
    category: string | null;
    sort_order: number;
  }> = [];

  metadata.forEach((meta, arrayIndex) => {
    const slug = meta.id;
    if (!slug || !meta.title) {
      console.error(`SKIP invalid metadata at index ${arrayIndex}`);
      return;
    }

    const covers = coverPathsForSlug(slug);
    const blocks = contentMap[slug] ?? [];

    const story: StoryJson = {
      slug,
      title: meta.title,
      subtitle: meta.subtitle ?? null,
      year: parseYear(meta.year),
      category: meta.category ?? null,
      tags: meta.tags ?? [],
      ...covers,
      content: blocks,
      published: true,
      sort_order: arrayIndex,
    };

    writeFileSync(
      resolve(STORIES_OUT_DIR, `${slug}.json`),
      `${JSON.stringify(story, null, 2)}\n`,
      'utf8',
    );

    index.push({
      slug,
      title: story.title,
      subtitle: story.subtitle,
      year: story.year,
      category: story.category,
      sort_order: story.sort_order,
    });

    console.log(`WROTE story ${slug} (hero #${HERO_IMAGE_BY_SLUG[slug]})`);
  });

  writeFileSync(
    resolve(STORIES_OUT_DIR, 'index.json'),
    `${JSON.stringify(index, null, 2)}\n`,
    'utf8',
  );

  return index.length;
}

function extractRadioArchiveFromJs(source: string): RadioJson[] {
  const match = source.match(
    /(?:const|let|var)\s+RADIO_ARCHIVE\s*=\s*(\[[\s\S]*?\]);/,
  );
  if (!match?.[1]) return [];

  type Raw = {
    id: string;
    driver: string;
    team: string;
    constructorId?: string | null;
    quote: string;
    context?: string | null;
    significance?: string | null;
    year?: number | string | null;
    round?: number | string | null;
    gp_name?: string | null;
    tags?: string[] | null;
    audio_url?: string | null;
  };

  let parsed: Raw[];
  try {
    parsed = JSON.parse(match[1]) as Raw[];
  } catch {
    const fn = new Function(`return (${match[1]});`);
    parsed = fn() as Raw[];
  }

  const covers = loadRadioCovers();

  return parsed.map((raw) => {
    const slug = raw.id;
    return {
      id: slug,
      slug,
      driver: raw.driver,
      team: raw.team,
      constructorId: raw.constructorId ?? null,
      quote: raw.quote,
      context: raw.context ?? null,
      significance: raw.significance ?? null,
      year: parseYear(raw.year),
      round:
        raw.round == null || raw.round === ''
          ? null
          : typeof raw.round === 'number'
            ? raw.round
            : parseInt(String(raw.round), 10) || null,
      gp_name: raw.gp_name ?? null,
      tags: raw.tags ?? [],
      audio_url: raw.audio_url ?? null,
      cover_image: covers[slug] ?? null,
    };
  });
}

function extractRadio(): number {
  const path = resolve(MIGRATION_DIR, 'radioArchive.js');
  if (!existsSync(path)) {
    throw new Error(`Missing ${path}`);
  }
  const source = readFileSync(path, 'utf8');
  const moments = extractRadioArchiveFromJs(source);

  mkdirSync(resolve(process.cwd(), 'public/data/radio'), { recursive: true });
  writeFileSync(RADIO_OUT_FILE, `${JSON.stringify(moments, null, 2)}\n`, 'utf8');

  for (const m of moments) {
    console.log(`WROTE radio ${m.slug}`);
  }

  return moments.length;
}

function main(): void {
  console.log('=== Extract stories from migration-source ===');
  const storyCount = extractStories();
  console.log(`Stories written: ${storyCount}\n`);

  console.log('=== Extract radio from migration-source ===');
  const radioCount = extractRadio();
  console.log(`Radio moments written: ${radioCount}\n`);
}

main();
