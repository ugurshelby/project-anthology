import { getSupabaseClient } from '@/lib/supabase';
import type { RadioMomentRow } from '@/types/database';
import { logSupabaseCall, timed } from '@/lib/data/logger';

export async function getPublishedRadioMoments(limit = 50): Promise<RadioMomentRow[]> {
  try {
    const supabase = getSupabaseClient();
    const { result, durationMs } = await timed(async () =>
      supabase
        .from('radio_moments')
        .select('*')
        .eq('published', true)
        .order('year', { ascending: false })
        .order('round', { ascending: false })
        .limit(limit),
    );
    logSupabaseCall('radio_moments', `published limit ${limit}`, durationMs);
    if (result.error || !result.data?.length) return [];
    return result.data as RadioMomentRow[];
  } catch {
    return [];
  }
}
