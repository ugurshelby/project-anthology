import { describe, it, expect } from 'vitest';
import { driverIconSrc, teamIconSrc, carSrc, circuitCoverSrc, circuitIconSrc } from '@/lib/assets/f1-icons';

// Apex is photo-free by policy (2026-09-28) — driver/team/car photography and
// aerial circuit covers had no documented license, so the resolvers for them
// are permanent no-ops. ApexFallback renders a data-driven badge instead;
// these tests just pin the "always null" contract.

describe('driverIconSrc / teamIconSrc / carSrc — photo-free policy', () => {
  it('driverIconSrc always returns null', () => {
    expect(driverIconSrc('ver', 'Max Verstappen', 2026)).toBeNull();
    expect(driverIconSrc(null, null, 2019)).toBeNull();
  });

  it('teamIconSrc always returns null', () => {
    expect(teamIconSrc('Ferrari', 2026)).toBeNull();
    expect(teamIconSrc('Totally Fake Team')).toBeNull();
  });

  it('carSrc always returns null', () => {
    expect(carSrc('red_bull', 'Oracle Red Bull Racing')).toBeNull();
  });
});

describe('circuitCoverSrc / circuitIconSrc', () => {
  it('circuitCoverSrc always returns null (no aerial photography)', () => {
    expect(circuitCoverSrc('monaco')).toBeNull();
  });

  it('circuitIconSrc still resolves the MIT-licensed track outline', () => {
    expect(circuitIconSrc('monaco')).toBe('/circuits/mc-1929.svg');
    expect(circuitIconSrc('unknown-circuit')).toBeNull();
  });
});
