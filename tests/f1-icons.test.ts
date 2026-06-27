import { describe, it, expect } from 'vitest';
import { driverIconSrc, teamIconSrc, circuitCoverSrc, circuitIconSrc } from '@/lib/assets/f1-icons';

describe('driverIconSrc', () => {
  it('returns null when no slug can be derived (unknown code, no name)', () => {
    // With a free-text name the resolver optimistically builds an Ergast id
    // path (404 → SafeImage fallback), so the genuinely-null case is an
    // unknown code with no secondary name/id to fall back on.
    expect(driverIconSrc('zzz', null, 2026)).toBeNull();
  });

  it('resolves a known driver to a season-scoped path', () => {
    // verstappen is a known slug; the season segment must appear in the path.
    const src = driverIconSrc('ver', 'Max Verstappen', 2026);
    expect(src).toBe('/drivers/2026/verstappen.svg');
  });

  it('reflects the season parameter in the path', () => {
    const src = driverIconSrc(null, 'Lewis Hamilton', 2019);
    expect(src).toContain('/drivers/2019/');
  });
});

describe('driverIconSrc — diacritic / punctuation normalization', () => {
  // Asset files use ASCII surname basenames (raikkonen.svg, perez.svg,
  // hulkenberg.svg, sainz.svg). A driver name carrying diacritics must resolve
  // to the same ASCII path, never to an accented slug that would 404.
  it('normalizes ä/ö in Räikkönen to raikkonen', () => {
    expect(driverIconSrc(null, 'Kimi Räikkönen', 2007)).toBe('/drivers/2007/raikkonen.svg');
  });

  it('normalizes é in Pérez to perez', () => {
    expect(driverIconSrc(null, 'Sergio Pérez', 2014)).toBe('/drivers/2014/perez.svg');
  });

  it('normalizes ü in Hülkenberg to hulkenberg', () => {
    expect(driverIconSrc(null, 'Nico Hülkenberg', 2014)).toBe('/drivers/2014/hulkenberg.svg');
  });

  it('strips the trailing dot in "Carlos Sainz Jr." style names', () => {
    // The pre-built ergast id form with a trailing dot must not leak into the path.
    expect(driverIconSrc(null, 'carlos_sainz_jr.', 2015)).toBe('/drivers/2015/sainz.svg');
  });

  it('produces an ASCII-only path (no combining marks) for accented input', () => {
    const src = driverIconSrc(null, 'Kimi Räikkönen', 2008);
    expect(src).not.toBeNull();
    // eslint-disable-next-line no-control-regex
    expect(/[^\x00-\x7F]/.test(src!)).toBe(false);
  });

  // QA checklist (deploy verification): exact paths the /season pages request.
  // These basenames exist on disk (public/drivers/2019/{raikkonen,perez}.svg,
  // public/drivers/2026/{colapinto,lindblad}.svg).
  it('2019 season resolves Räikkönen and Pérez to existing assets', () => {
    expect(driverIconSrc('rai', 'Kimi Räikkönen', 2019)).toBe('/drivers/2019/raikkonen.svg');
    expect(driverIconSrc('per', 'Sergio Pérez', 2019)).toBe('/drivers/2019/perez.svg');
  });

  it('2026 season resolves Colapinto and Lindblad to existing assets', () => {
    expect(driverIconSrc('col', 'Franco Colapinto', 2026)).toBe('/drivers/2026/colapinto.svg');
    expect(driverIconSrc('lin', 'Arvid Lindblad', 2026)).toBe('/drivers/2026/lindblad.svg');
  });
});

describe('teamIconSrc', () => {
  it('returns null for an unknown team', () => {
    expect(teamIconSrc('Totally Fake Team', 2026)).toBeNull();
  });

  it('reflects the season parameter in the path', () => {
    const src = teamIconSrc('Ferrari', 2018);
    expect(src).not.toBeNull();
    expect(src).toContain('/teams/2018/');
  });
});

describe('circuitCoverSrc / circuitIconSrc', () => {
  it('resolves a live circuit photo for homepage covers', () => {
    expect(circuitCoverSrc('monaco')).toBe('/circuit-images/circuit-de-monaco.png');
  });

  it('keeps the schematic track map separate from the cover photo', () => {
    expect(circuitIconSrc('monaco')).toBe('/circuits/mc-1929.svg');
    expect(circuitCoverSrc('monaco')).not.toBe(circuitIconSrc('monaco'));
  });
});
