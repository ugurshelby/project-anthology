import { describe, expect, it } from 'vitest';
import { SWEEP, T_MAX, T_MIN, pointAt, tOf, tempAtOffset, uOf, zoneOf } from '@/lib/glossary/thermalDial';

const C3 = { windowMinC: 100, windowMaxC: 130, peakC: 115 };

describe('thermal dial geometry', () => {
  it('maps the scale ends to the sweep ends and clamps outside it', () => {
    expect(uOf(T_MIN)).toBe(0);
    expect(uOf(T_MAX)).toBe(SWEEP);
    expect(uOf(40)).toBe(0);
    expect(uOf(200)).toBe(SWEEP);
    expect(tOf(uOf(115))).toBeCloseTo(115);
  });

  it('puts the scale middle (110°C) at the top of the dial', () => {
    const p = pointAt(uOf(110), 100, 120);
    expect(p.x).toBeCloseTo(120);
    expect(p.y).toBeCloseTo(20);
  });

  it('reads the temperature under a pointer, snapping the bottom gap to the nearer end', () => {
    expect(tempAtOffset(0, -50)).toBeCloseTo(110); // straight up
    expect(tempAtOffset(-50, 0)).toBeCloseTo(T_MIN + (45 / SWEEP) * (T_MAX - T_MIN)); // left = 45° into the sweep
    expect(tempAtOffset(-5, 50)).toBe(T_MIN); // gap, left of centre
    expect(tempAtOffset(5, 50)).toBe(T_MAX); // gap, right of centre
  });
});

describe('thermal zones', () => {
  it('splits cold / optimal / peak / hot around the compound window', () => {
    expect(zoneOf(99, C3)).toBe('cold');
    expect(zoneOf(100, C3)).toBe('optimal');
    expect(zoneOf(113, C3)).toBe('peak');
    expect(zoneOf(117, C3)).toBe('peak');
    expect(zoneOf(118, C3)).toBe('optimal');
    expect(zoneOf(131, C3)).toBe('hot');
  });
});
