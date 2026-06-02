import { createClient } from '@supabase/supabase-js';
import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import type { Database } from '../types/database';
import { loadEnvLocal, requireSupabaseAdminConfig } from './load-env';

loadEnvLocal();

type RadioInsert = Database['public']['Tables']['radio_moments']['Insert'];

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

interface RadioImagesFile {
  episodes?: Record<
    string,
    {
      cover?: string;
    }
  >;
}

const RADIO_ARCHIVE_PATHS = [
  'public/data/radio/index.json',
  'public/radio-anthology/app.js',
  'radio-anthology/app.js',
  'migration-assets/public/radio-anthology/app.js',
  'public/data/radio-archive.json',
  'public/data/radio-moments.json',
];

function parseYear(value: RawRadioMoment['year']): number | null {
  if (value == null || value === '') return null;
  const n = typeof value === 'number' ? value : parseInt(String(value), 10);
  return Number.isFinite(n) ? n : null;
}

function parseRound(value: RawRadioMoment['round']): number | null {
  if (value == null || value === '') return null;
  const n = typeof value === 'number' ? value : parseInt(String(value), 10);
  return Number.isFinite(n) ? n : null;
}

function loadRadioImages(): Record<string, string> {
  const path = resolve(process.cwd(), 'public/data/radio-images.json');
  if (!existsSync(path)) return {};
  try {
    const data = JSON.parse(readFileSync(path, 'utf8')) as RadioImagesFile;
    const covers: Record<string, string> = {};
    for (const [slug, episode] of Object.entries(data.episodes ?? {})) {
      if (episode.cover) covers[slug] = episode.cover;
    }
    return covers;
  } catch {
    return {};
  }
}

function extractRadioArchiveFromJs(source: string): RawRadioMoment[] {
  const match = source.match(
    /(?:const|let|var)\s+RADIO_ARCHIVE\s*=\s*(\[[\s\S]*?\]);/,
  );
  if (!match?.[1]) return [];

  try {
    const parsed = JSON.parse(match[1]) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((item) => item && typeof item === 'object') as RawRadioMoment[];
  } catch {
    // Fallback: eval in isolated Function (archive is project-owned static data)
    try {
      const fn = new Function(`return (${match[1]});`);
      const parsed = fn() as unknown;
      if (!Array.isArray(parsed)) return [];
      return parsed.filter((item) => item && typeof item === 'object') as RawRadioMoment[];
    } catch {
      return [];
    }
  }
}

function loadRadioMoments(): RawRadioMoment[] {
  const bySlug = new Map<string, RawRadioMoment>();

  for (const rel of RADIO_ARCHIVE_PATHS) {
    const abs = resolve(process.cwd(), rel);
    if (!existsSync(abs)) continue;

    if (abs.endsWith('.json')) {
      try {
        const parsed = JSON.parse(readFileSync(abs, 'utf8')) as unknown;
        const items = Array.isArray(parsed)
          ? parsed
          : Array.isArray((parsed as { moments?: unknown }).moments)
            ? (parsed as { moments: RawRadioMoment[] }).moments
            : Array.isArray((parsed as { episodes?: unknown }).episodes)
              ? (parsed as { episodes: RawRadioMoment[] }).episodes
              : [];
        for (const item of items) {
          if (!item?.slug && !item?.id) continue;
          const slug = item.slug ?? String(item.id);
          bySlug.set(slug, { ...item, slug });
        }
      } catch {
        console.error(`ERROR parsing ${rel}`);
      }
      continue;
    }

    const source = readFileSync(abs, 'utf8');
    for (const item of extractRadioArchiveFromJs(source)) {
      const slug = item.slug ?? (item.id ? String(item.id) : undefined);
      if (!slug) continue;
      bySlug.set(slug, { ...item, slug });
    }
  }

  return [...bySlug.values()];
}

function mapRadioMoment(raw: RawRadioMoment, covers: Record<string, string>): RadioInsert | null {
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
    year: parseYear(raw.year),
    round: parseRound(raw.round),
    gp_name: raw.gp_name ?? raw.gpName ?? raw.gp ?? null,
    tags: raw.tags ?? null,
    cover_image: raw.cover_image ?? raw.coverImage ?? covers[slug] ?? null,
    published: raw.published ?? true,
  };
}

async function main(): Promise<void> {
  const { url, serviceKey } = requireSupabaseAdminConfig();
  const supabase = createClient<Database>(url, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const covers = loadRadioImages();
  const raws = loadRadioMoments();

  if (raws.length === 0) {
    console.log(
      'No radio moments discovered. Expected RADIO_ARCHIVE in radio-anthology/app.js or public/data/radio-archive.json',
    );
    return;
  }

  const { data: existingRows, error: existingError } = await supabase
    .from('radio_moments')
    .select('slug');
  if (existingError) {
    throw new Error(`Failed to read existing radio_moments: ${existingError.message}`);
  }

  const existingSlugs = new Set((existingRows ?? []).map((r) => r.slug));

  let seeded = 0;
  let skipped = 0;
  let errors = 0;
  let invalid = 0;

  for (const raw of raws) {
    const mapped = mapRadioMoment(raw, covers);
    if (!mapped) {
      console.error(`ERROR invalid record (missing driver/team/quote): ${raw.slug ?? raw.id ?? 'unknown'}`);
      invalid += 1;
      continue;
    }

    const alreadyExists = existingSlugs.has(mapped.slug);

    const { error } = await supabase
      .from('radio_moments')
      .upsert(mapped, { onConflict: 'slug' });

    if (error) {
      console.error(`ERROR ${mapped.slug}: ${error.message}`);
      errors += 1;
      continue;
    }

    if (alreadyExists) {
      console.log(`SKIPPED ${mapped.slug} (already exists)`);
      skipped += 1;
    } else {
      console.log(`SEEDED ${mapped.slug}`);
      seeded += 1;
      existingSlugs.add(mapped.slug);
    }
  }

  const { count, error: countError } = await supabase
    .from('radio_moments')
    .select('*', { count: 'exact', head: true });
  if (countError) {
    console.error(`Count error: ${countError.message}`);
  } else {
    console.log(`\nRadio moments total in DB: ${count ?? 0}`);
  }

  console.log(
    `\nSummary: seeded=${seeded}, skipped=${skipped}, invalid=${invalid}, errors=${errors}`,
  );
}

main().catch((err: unknown) => {
  console.error(err instanceof Error ? err.message : err);
  process.exit(1);
});
