import { describe, it, expect } from 'vitest';
import { driverIconSrc, teamIconSrc } from '@/lib/assets/f1-icons';

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
