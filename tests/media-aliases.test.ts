import { describe, expect, it } from 'vitest';
import { circuitAliases, driverAliases, separatorVariants, slugify, teamAliases } from '@/lib/media/aliases';
import { carKey } from '@/lib/media/keys';

describe('id aliases (Jolpica ↔ F1DB)', () => {
  it('slugifies like F1DB ids', () => {
    expect(slugify('Nico Hülkenberg')).toBe('nico-hulkenberg');
    expect(slugify('Red Bull')).toBe('red-bull');
  });

  it('adds hyphen/underscore variants', () => {
    expect(separatorVariants('max_verstappen')).toContain('max-verstappen');
    expect(separatorVariants('albert-park')).toContain('albert_park');
  });

  it('maps Jolpica driver ids to the F1DB ids the archive pages use', () => {
    expect(driverAliases('hamilton', 'Lewis Hamilton')).toContain('lewis-hamilton');
    expect(driverAliases('max_verstappen', 'Max Verstappen')).toEqual(expect.arrayContaining(['max-verstappen']));
    expect(driverAliases('hulkenberg', 'Nico Hülkenberg')).toContain('nico-hulkenberg');
    expect(driverAliases('norris', 'Lando Norris')).not.toContain('norris'); // never aliases itself
  });

  it('maps constructors by name, including renamed teams', () => {
    expect(teamAliases('red_bull', 'Red Bull', 'Red Bull Racing')).toEqual(expect.arrayContaining(['red-bull']));
    expect(teamAliases('aston_martin', 'Aston Martin', null)).toContain('aston-martin');
    expect(teamAliases('rb', 'RB F1 Team', 'Racing Bulls')).toContain('racing-bulls');
  });

  it('circuits: separator variants plus curated differences', () => {
    expect(circuitAliases('albert_park')).toContain('albert-park');
    expect(circuitAliases('spa', ['spa-francorchamps'])).toContain('spa-francorchamps');
  });

  it('cars: a team alias + season forms a valid car alias', () => {
    const aliases = teamAliases('red_bull', 'Red Bull', 'Red Bull Racing').map((a) => carKey(a, 2025));
    expect(aliases).toContain('red-bull:2025');
  });

  it('every alias is a valid key', () => {
    for (const a of [...driverAliases('o_ward', "Patricio O'Ward"), ...teamAliases('alfa', 'Alfa Romeo', 'Alfa Romeo in Formula One')]) {
      expect(a).toMatch(/^[a-z0-9_.:-]{1,80}$/);
    }
  });
});
