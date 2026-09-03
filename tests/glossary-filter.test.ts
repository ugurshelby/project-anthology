import { describe, expect, it } from 'vitest';
import { glossaryTerms } from '@/data/glossary/terms';
import { TYRE_COMPOUNDS } from '@/data/glossary/tyres';
import { filterTerms, filterTyres, termMatchesQuery } from '@/lib/glossary/filter';

describe('glossary filter', () => {
  it('matches DRS by alias', () => {
    const drs = glossaryTerms.find((t) => t.slug === 'drs');
    expect(drs).toBeTruthy();
    expect(termMatchesQuery(drs!, 'drag reduction')).toBe(true);
  });

  it('filters aero terms only', () => {
    const aero = filterTerms(glossaryTerms, '', 'Aerodynamics');
    expect(aero.every((t) => t.category === 'Aerodynamics')).toBe(true);
    expect(aero.length).toBeGreaterThan(0);
  });

  it('hides tyres when filtering power unit', () => {
    expect(filterTyres(TYRE_COMPOUNDS, '', 'Power Unit')).toHaveLength(0);
    expect(filterTyres(TYRE_COMPOUNDS, '', 'Tyres').length).toBe(TYRE_COMPOUNDS.length);
  });

  it('searches tyre blurbs', () => {
    const hits = filterTyres(TYRE_COMPOUNDS, 'aquaplaning', 'all');
    expect(hits.some((t) => t.id === 'wet')).toBe(true);
  });
});
