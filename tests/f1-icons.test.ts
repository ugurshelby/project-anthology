import { describe, it, expect } from 'vitest';
import * as icons from '@/lib/assets/f1-icons';

// Photos come from the license-checked media system (lib/media/read.ts). The
// old always-null driver/team/car/cover helpers were removed on 2026-10-12;
// only the MIT-licensed track outline lookup is left here.

describe('f1-icons', () => {
  it('no longer exports the removed photo helpers', () => {
    expect(Object.keys(icons)).not.toContain('driverIconSrc');
    expect(Object.keys(icons)).not.toContain('teamIconSrc');
    expect(Object.keys(icons)).not.toContain('carSrc');
    expect(Object.keys(icons)).not.toContain('circuitCoverSrc');
  });

  it('circuitIconSrc resolves the MIT-licensed track outline', () => {
    expect(icons.circuitIconSrc('monaco')).toBe('/circuits/mc-1929.svg');
    expect(icons.circuitIconSrc('sepang')).toBe('/circuits/my-1999.svg');
    expect(icons.circuitIconSrc('unknown-circuit')).toBeNull();
  });
});
