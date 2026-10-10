import { describe, expect, it } from 'vitest';
import type { OnThisDayEntry } from '@/lib/data/f1';
import type { MediaResult } from '@/lib/media/read';
import type { MediaEntityType } from '@/lib/media/types';
import { pickOnThisDayImage } from '@/lib/home/onThisDayImage';

const entry: OnThisDayEntry = {
  season: 2010,
  raceName: 'Japanese Grand Prix',
  winnerName: 'Sebastian Vettel',
  winnerConstructor: 'Red Bull',
  circuitId: 'suzuka',
  winnerDriverId: 'vettel',
  winnerConstructorId: 'red_bull',
  p2Name: null,
  p3Name: null,
};

function fakeMedia(withImage: string[]) {
  const asked: string[] = [];
  const get = async (type: MediaEntityType, key: string): Promise<MediaResult> => {
    asked.push(`${type}/${key}`);
    if (withImage.includes(`${type}/${key}`)) {
      return {
        status: 'image',
        type,
        key,
        image: { src: `/m/${key}.webp` } as never,
        attribution: { text: 'x' } as never,
      };
    }
    return { status: 'placeholder', type, key, placeholder: { kind: type, seed: key } };
  };
  return { get, asked };
}

describe('pickOnThisDayImage', () => {
  it('prefers the winning car of that season', async () => {
    const m = fakeMedia(['car/red_bull:2010', 'driver/vettel', 'circuit/suzuka']);
    const img = await pickOnThisDayImage(entry, m.get);
    expect(img?.key).toBe('red_bull:2010');
    expect(m.asked).toEqual(['car/red_bull:2010']);
  });

  it('falls back to the driver, then the circuit', async () => {
    expect((await pickOnThisDayImage(entry, fakeMedia(['driver/vettel', 'circuit/suzuka']).get))?.key).toBe('vettel');
    expect((await pickOnThisDayImage(entry, fakeMedia(['circuit/suzuka']).get))?.key).toBe('suzuka');
  });

  it('returns null instead of an unrelated image', async () => {
    expect(await pickOnThisDayImage(entry, fakeMedia([]).get)).toBeNull();
  });

  it('skips candidates whose id is unknown', async () => {
    const m = fakeMedia(['circuit/suzuka']);
    await pickOnThisDayImage({ ...entry, winnerConstructorId: null, winnerDriverId: null }, m.get);
    expect(m.asked).toEqual(['circuit/suzuka']);
  });
});
