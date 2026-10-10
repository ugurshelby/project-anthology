import type { OnThisDayEntry } from '@/lib/data/f1';
import { carKey } from '@/lib/media/keys';
import type { MediaEntityType } from '@/lib/media/types';
import type { MediaResult } from '@/lib/media/read';

export type OnThisDayImage = Extract<MediaResult, { status: 'image' }>;

/**
 * Picks the most event-specific licensed image we already have for an
 * On This Day entry (owner rule, apex-component-rules.md §2.2):
 *   1. the winning car of that season (`constructorId:season`),
 *   2. the winning driver,
 *   3. the circuit.
 * Returns null when none of them has an image — the card then shows its
 * typographic fallback, never an unrelated photo.
 */
export async function pickOnThisDayImage(
  entry: OnThisDayEntry,
  getMedia: (type: MediaEntityType, key: string) => Promise<MediaResult>,
): Promise<OnThisDayImage | null> {
  const candidates: Array<[MediaEntityType, string | null]> = [
    ['car', entry.winnerConstructorId ? carKey(entry.winnerConstructorId, entry.season) : null],
    ['driver', entry.winnerDriverId],
    ['circuit', entry.circuitId],
  ];
  for (const [type, key] of candidates) {
    if (!key) continue;
    const media = await getMedia(type, key);
    if (media.status === 'image') return media;
  }
  return null;
}
