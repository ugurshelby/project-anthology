import { TEAM_COLORS } from '@/config/team-colors';
import { DRIVER_GRID_POSITIONS } from '@/lib/data/driverPositions';

/**
 * Fact guard for AI-rewritten headlines (master-plan 19.2). A rewrite is kept only when
 * every number and every known F1 name in its headline also appears in the sources.
 *
 * Names come from lists the site already maintains: driver surnames (the keys of
 * DRIVER_GRID_POSITIONS) and team names (TEAM_COLORS aliases). A generic "capitalised
 * word" check would reject translated place names in Turkish headlines ("Meksika",
 * "ABD") and every Title Case English headline, so it is not used.
 *
 * Known limit: the guard cannot see a swapped subject and object ("Russell leads
 * Antonelli" from a source about "Antonelli leads Russell") when both names and the
 * number are in the source; the prompt rule covers that case.
 */

export interface FactSource {
  title: string;
  summary: string;
}

/** Lower case, accents removed, typographic apostrophes unified. */
function fold(s: string): string {
  return s
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[\u2019\u2018`]/g, "'")
    .toLowerCase();
}

const NAME_LEXICON: readonly string[] = Array.from(
  new Set([
    ...Object.keys(DRIVER_GRID_POSITIONS).map((id) => id.replace(/_/g, ' ')),
    ...TEAM_COLORS.flatMap((team) => team.aliases)
      .filter((alias) => !alias.includes('_'))
      // Short aliases ("rb") would match inside ordinary words; keep names of 4+ letters.
      .filter((alias) => alias.replace(/\s/g, '').length >= 4),
  ].map(fold)),
);

function escapeRe(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

const NAME_PATTERNS = NAME_LEXICON.map((name) => ({
  name,
  re: new RegExp(`(^|[^\\p{L}])${escapeRe(name)}($|[^\\p{L}])`, 'u'),
}));

/** Digit groups with separators removed ("1,000", "1.000" → "1000"). */
export function extractNumbers(text: string): string[] {
  return (text.match(/\d+(?:[.,]\d+)*/g) ?? []).map((n) => n.replace(/[.,]/g, ''));
}

/** Known F1 names (folded) that appear in the text. */
export function knownNamesIn(text: string): string[] {
  const t = fold(text);
  return NAME_PATTERNS.filter((p) => p.re.test(t)).map((p) => p.name);
}

/** True when every number and every known F1 name in `headline` also appears in the sources. */
export function headlineFactsInSources(headline: string, sources: readonly FactSource[]): boolean {
  const sourceText = sources.map((s) => `${s.title} ${s.summary}`).join(' ');
  const sourceNumbers = new Set(extractNumbers(sourceText));
  if (extractNumbers(headline).some((n) => !sourceNumbers.has(n))) return false;
  const sourceNames = new Set(knownNamesIn(sourceText));
  return knownNamesIn(headline).every((name) => sourceNames.has(name));
}
