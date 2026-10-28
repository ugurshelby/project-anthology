import { describe, expect, it } from 'vitest';
import { seasonRewritePath } from '@/lib/i18n/seasonRewrite';

const L = ['en', 'tr'];

describe('seasonRewritePath (caching design 2026-10-28)', () => {
  it('maps ?season= on the grid, driver and team pages to the season/[year] variant', () => {
    expect(seasonRewritePath('/en/grid', '2010', L)).toBe('/en/grid/season/2010');
    expect(seasonRewritePath('/tr/drivers', '2010', L)).toBe('/tr/drivers/season/2010');
    expect(seasonRewritePath('/tr/teams/', '2010', L)).toBe('/tr/teams/season/2010');
    expect(seasonRewritePath('/en/drivers/max_verstappen', '2021', L)).toBe('/en/drivers/max_verstappen/season/2021');
    expect(seasonRewritePath('/tr/teams/ferrari', '2004', L)).toBe('/tr/teams/ferrari/season/2004');
  });

  it('leaves other pages, bad years and already-rewritten paths alone', () => {
    expect(seasonRewritePath('/en/season/2024', '2024', L)).toBeNull();
    expect(seasonRewritePath('/en', '2024', L)).toBeNull();
    expect(seasonRewritePath('/de/grid', '2024', L)).toBeNull();
    expect(seasonRewritePath('/en/grid', 'abcd', L)).toBeNull();
    expect(seasonRewritePath('/en/grid', '20245', L)).toBeNull();
    expect(seasonRewritePath('/en/grid', null, L)).toBeNull();
    expect(seasonRewritePath('/en/drivers/season/2021', '2021', L)).toBeNull();
    expect(seasonRewritePath('/en/drivers/max_verstappen/season/2021', '2021', L)).toBeNull();
  });
});
