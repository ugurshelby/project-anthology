/**
 * Uppercase for display text that mixes Turkish and English words.
 *
 * Turkish casing turns "i" into "İ", which is right for Turkish words
 * ("Singapur" → "SİNGAPUR") and wrong for English ones ("Grand Prix" →
 * "PRİX", "Austin" → "AUSTİN", "Porpoising" → "PORPOİSİNG"; 2026-10 site
 * audit). Uppercasing a string here also protects it from a later CSS
 * `uppercase` in a Turkish page, because CSS only changes lowercase letters.
 *
 * - `latinUpper`: an English/foreign proper name (locality, driver, team).
 * - `displayUpper`: localized text; the English loanwords below keep English
 *   casing, the rest follows the page language.
 */
export function latinUpper(text: string): string {
  return text.toLocaleUpperCase('en-US');
}

/**
 * English motorsport words that Turkish copy keeps as they are. Only words
 * with an "i" matter (the other letters case the same in both languages).
 */
const LOANWORDS = [
  'grand prix',
  'blistering',
  'graining',
  'porpoising',
  'slipstream',
  'slick',
  'sprint',
  'pit',
  'venturi',
  'diffuser',
  'intermediate',
  'grid',
];

const LOANWORD_RE = new RegExp(`(?<![\\p{L}])(${LOANWORDS.join('|')})(?![\\p{L}])`, 'giu');

export function displayUpper(text: string, locale: string | null | undefined): string {
  if (locale !== 'tr') return latinUpper(text);
  return text
    .split(LOANWORD_RE)
    .map((part, i) => (i % 2 === 1 ? latinUpper(part) : part.toLocaleUpperCase('tr-TR')))
    .join('');
}
