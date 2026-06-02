import { getSupabaseAdmin } from '@/lib/supabase';
import type { Circuit } from '@/types/database';
import { readPublicJson } from '@/lib/data/fs';
import { logFallback, logSupabaseCall, timed } from '@/lib/data/logger';

export type { Circuit } from '@/types/database';

interface CircuitImagesFile {
  circuits?: Record<
    string,
    {
      cover?: string;
      gallery?: unknown[];
    }
  >;
}

function circuitFromImageKey(id: string, entry: NonNullable<CircuitImagesFile['circuits']>[string]): Circuit {
  const name = id.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
  const now = new Date().toISOString();
  return {
    id,
    name,
    country: null,
    city: null,
    flag_emoji: null,
    first_f1_year: null,
    lap_length_km: null,
    lap_record_time: null,
    lap_record_driver: null,
    lap_record_year: null,
    drs_zones: null,
    overtaking_difficulty: null,
    character_tags: null,
    editorial: null,
    motorsport_legacy: null,
    iconic_moment_year: null,
    iconic_moment: null,
    cover_image: entry.cover ?? null,
    svg_path: null,
    data: { gallery: entry.gallery ?? [] },
    created_at: now,
    updated_at: now,
  };
}

async function loadCircuitsFromImagesJson(): Promise<Circuit[]> {
  const file = await readPublicJson<CircuitImagesFile>('data/circuit-images.json');
  const map = file?.circuits;
  if (!map) return [];
  return Object.entries(map).map(([id, entry]) => circuitFromImageKey(id, entry));
}

export async function getAllCircuits(): Promise<Circuit[]> {
  const supabase = getSupabaseAdmin();
  if (supabase) {
    const { result, durationMs } = await timed(async () =>
      supabase.from('circuits').select('*').order('name', { ascending: true }),
    );
    logSupabaseCall('circuits', 'select all', durationMs);

    if (!result.error && result.data?.length) {
      return result.data as Circuit[];
    }
    if (result.error) {
      logFallback('supabase circuits', 'public/data/circuit-images.json', result.error.message);
    } else {
      logFallback('supabase circuits (empty)', 'public/data/circuit-images.json');
    }
  } else {
    logFallback('supabase client unavailable', 'public/data/circuit-images.json');
  }

  try {
    return await loadCircuitsFromImagesJson();
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    logFallback('circuit-images.json', 'empty array', msg);
    return [];
  }
}

export async function getCircuitById(id: string): Promise<Circuit | null> {
  const supabase = getSupabaseAdmin();
  if (supabase) {
    const { result, durationMs } = await timed(async () =>
      supabase.from('circuits').select('*').eq('id', id).maybeSingle(),
    );
    logSupabaseCall('circuits', `select id=${id}`, durationMs);

    if (!result.error && result.data) {
      return result.data as Circuit;
    }
    if (result.error) {
      logFallback(`supabase circuit ${id}`, 'public/data/circuit-images.json', result.error.message);
    } else {
      logFallback(`supabase circuit ${id} (missing)`, 'public/data/circuit-images.json');
    }
  } else {
    logFallback('supabase client unavailable', 'public/data/circuit-images.json');
  }

  const all = await loadCircuitsFromImagesJson();
  return all.find((c) => c.id === id) ?? null;
}
