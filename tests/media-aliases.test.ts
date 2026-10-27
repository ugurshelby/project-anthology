import { describe, expect, it } from 'vitest';
import { circuitAliases, driverAliases, separatorVariants, slugify, teamAliases } from '@/lib/media/aliases';
import { carKey } from '@/lib/media/keys';
import { CIRCUIT_ALIASES, TEAM_ALIASES } from '@/data/media/curated';

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

  it('drivers: generational suffixes are ignored and a middle name does not break the match', () => {
    expect(driverAliases('sainz', 'Carlos Sainz')).toContain('carlos-sainz-jr');
    expect(driverAliases('antonelli', 'Andrea Kimi Antonelli')).toContain('kimi-antonelli');
  });

  it('drivers: relatives sharing a surname or first name are never aliased', () => {
    expect(driverAliases('max_verstappen', 'Max Verstappen')).not.toContain('jos-verstappen');
    expect(driverAliases('mick_schumacher', 'Mick Schumacher')).not.toContain('michael-schumacher');
    expect(driverAliases('mick_schumacher', 'Mick Schumacher')).not.toContain('ralf-schumacher');
  });

  it('teams: curated F1DB ids are added (Sauber → Kick Sauber)', () => {
    expect(teamAliases('sauber', 'Sauber', null, TEAM_ALIASES.sauber)).toContain('kick-sauber');
    expect(teamAliases('sauber', 'Sauber', null)).not.toContain('kick-sauber');
  });

  it('circuits: curated archive ids for Melbourne, Paul Ricard and Sochi', () => {
    expect(circuitAliases('albert_park', CIRCUIT_ALIASES.albert_park)).toContain('melbourne');
    expect(circuitAliases('ricard', CIRCUIT_ALIASES.ricard)).toContain('paul-ricard');
    expect(circuitAliases('sochi', CIRCUIT_ALIASES.sochi)).toContain('sirius');
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
