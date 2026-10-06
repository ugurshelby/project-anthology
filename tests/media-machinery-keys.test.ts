/**
 * The machinery pages request `iconic:<car.id>`; the media sync only produces
 * `iconic:<slug>` for entries in ICONIC_CARS. A mismatch silently leaves the page on
 * its placeholder forever (it happened once: `redbull-rb19` vs `red-bull-rb19`, and
 * Lotus 72 had no entry), so every machinery car must have a curated iconic entry.
 */

import { describe, expect, it } from 'vitest';
import { MACHINERY_CARS } from '@/data/machinery/cars';
import { ICONIC_CARS } from '@/data/media/curated';
import { isValidMediaKey } from '@/lib/media/keys';

describe('machinery ↔ iconic media keys', () => {
  const slugs = new Set(ICONIC_CARS.map((c) => c.slug));

  it.each(MACHINERY_CARS.map((c) => [c.id]))('machinery car %s has an iconic media entry', (id) => {
    expect(slugs.has(id)).toBe(true);
    expect(isValidMediaKey(`iconic:${id}`)).toBe(true);
  });

  it('iconic slugs are unique', () => {
    expect(slugs.size).toBe(ICONIC_CARS.length);
  });
});
