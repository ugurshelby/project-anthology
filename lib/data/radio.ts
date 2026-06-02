import { getSupabaseAdmin } from '@/lib/supabase';
import type { RadioMoment } from '@/types/database';
import { readPublicJson } from '@/lib/data/fs';
import { logFallback, logSupabaseCall, timed } from '@/lib/data/logger';

export type { RadioMoment } from '@/types/database';

const RADIO_INDEX = 'data/radio/index.json';

interface RadioJson {
  id?: string;
  slug: string;
  driver: string;
  team: string;
  constructorId?: string | null;
  constructor_id?: string | null;
  quote: string;
  context?: string | null;
  significance?: string | null;
  year?: number | null;
  round?: number | null;
  gp_name?: string | null;
  tags?: string[] | null;
  cover_image?: string | null;
  audio_url?: string | null;
  published?: boolean;
  created_at?: string;
}

function radioFromJson(raw: RadioJson): RadioMoment {
  const slug = raw.slug;
  return {
    id: raw.id ?? slug,
    slug,
    driver: raw.driver,
    team: raw.team,
    constructor_id: raw.constructor_id ?? raw.constructorId ?? null,
    quote: raw.quote,
    context: raw.context ?? null,
    significance: raw.significance ?? null,
    year: raw.year ?? null,
    round: raw.round ?? null,
    gp_name: raw.gp_name ?? null,
    tags: raw.tags ?? null,
    cover_image: raw.cover_image ?? null,
    audio_url: raw.audio_url ?? null,
    published: raw.published ?? true,
    created_at: raw.created_at ?? '1970-01-01T00:00:00.000Z',
  };
}

async function loadRadioFromIndex(): Promise<RadioMoment[]> {
  const index = await readPublicJson<RadioJson[]>(RADIO_INDEX);
  if (!index?.length) return [];
  return index.map(radioFromJson).filter((r) => r.published);
}

export async function getAllRadioMoments(): Promise<RadioMoment[]> {
  const supabase = getSupabaseAdmin();
  if (supabase) {
    const { result, durationMs } = await timed(async () =>
      supabase.from('radio_moments').select('*').eq('published', true).order('year', { ascending: false }),
    );
    logSupabaseCall('radio_moments', 'select published', durationMs);

    if (!result.error && result.data?.length) {
      return result.data as RadioMoment[];
    }
    if (result.error) {
      logFallback('supabase radio_moments', 'public/data/radio/index.json', result.error.message);
    } else {
      logFallback('supabase radio_moments (empty)', 'public/data/radio/index.json');
    }
  } else {
    logFallback('supabase client unavailable', 'public/data/radio/index.json');
  }

  try {
    return await loadRadioFromIndex();
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    logFallback('public radio index', 'empty array', msg);
    return [];
  }
}

export async function getRadioMomentBySlug(slug: string): Promise<RadioMoment | null> {
  const supabase = getSupabaseAdmin();
  if (supabase) {
    const { result, durationMs } = await timed(async () =>
      supabase.from('radio_moments').select('*').eq('slug', slug).eq('published', true).maybeSingle(),
    );
    logSupabaseCall('radio_moments', `select slug=${slug}`, durationMs);

    if (!result.error && result.data) {
      return result.data as RadioMoment;
    }
    if (result.error) {
      logFallback(`supabase radio ${slug}`, 'public/data/radio/index.json', result.error.message);
    } else {
      logFallback(`supabase radio ${slug} (missing)`, 'public/data/radio/index.json');
    }
  } else {
    logFallback('supabase client unavailable', 'public/data/radio/index.json');
  }

  const all = await loadRadioFromIndex();
  return all.find((r) => r.slug === slug) ?? null;
}
