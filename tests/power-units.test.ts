import { describe, expect, it } from 'vitest';
import { powerUnitLabel } from '@/lib/f1/power-units';

describe('powerUnitLabel', () => {
  it('resolves Ferrari and Mercedes works labels', () => {
    expect(powerUnitLabel('ferrari')).toBe('Ferrari 066/12');
    expect(powerUnitLabel('mercedes')).toBe('Mercedes-AMG HPP');
  });

  it('normalizes hyphenated constructor ids', () => {
    expect(powerUnitLabel('red-bull')).toBe('Red Bull Ford');
    expect(powerUnitLabel('aston-martin')).toBe('Honda RBPTH002');
  });

  it('returns Ferrari customer PU for Cadillac', () => {
    expect(powerUnitLabel('cadillac')).toBe('Ferrari 066/12');
  });
});
