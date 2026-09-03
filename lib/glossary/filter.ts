import type { GlossaryCategory, GlossaryTerm } from '@/data/glossary/terms';
import type { TyreCompound } from '@/data/glossary/tyres';

export type GlossaryFilter =
  | 'all'
  | 'Tyres'
  | GlossaryCategory;

export const GLOSSARY_FILTERS: { id: GlossaryFilter; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'Tyres', label: 'Tyres' },
  { id: 'Aerodynamics', label: 'Aero' },
  { id: 'Power Unit', label: 'Power Unit' },
  { id: 'Chassis', label: 'Chassis' },
  { id: 'Strategy', label: 'Strategy' },
  { id: 'Regulations', label: 'Regulations' },
];

export const TERM_CATEGORY_ORDER: GlossaryTerm['category'][] = [
  'Aerodynamics',
  'Power Unit',
  'Chassis',
  'Strategy',
  'Regulations',
  'Tyres',
];

function haystackMatch(haystack: string, query: string): boolean {
  const q = query.trim().toLowerCase();
  if (!q) return true;
  return haystack.toLowerCase().includes(q);
}

export function termMatchesQuery(term: GlossaryTerm, query: string): boolean {
  const hay = [term.term, term.definition, term.badge, term.keyImpact, ...(term.aliases ?? [])]
    .filter(Boolean)
    .join(' ');
  return haystackMatch(hay, query);
}

export function tyreMatchesQuery(tyre: TyreCompound, query: string): boolean {
  return haystackMatch(`${tyre.name} ${tyre.kicker} ${tyre.blurb} ${tyre.description}`, query);
}

export function filterTerms(
  terms: GlossaryTerm[],
  query: string,
  filter: GlossaryFilter,
): GlossaryTerm[] {
  return terms.filter((t) => {
    if (filter !== 'all' && filter !== 'Tyres' && t.category !== filter) return false;
    if (filter === 'Tyres' && t.category !== 'Tyres') return false;
    return termMatchesQuery(t, query);
  });
}

export function filterTyres(
  tyres: TyreCompound[],
  query: string,
  filter: GlossaryFilter,
): TyreCompound[] {
  if (filter !== 'all' && filter !== 'Tyres') return [];
  return tyres.filter((t) => tyreMatchesQuery(t, query));
}
