import { glossaryTerms } from '@/data/glossary/terms';
import { GLOSSARY_TERMS_TR } from '@/data/glossary/terms.tr';

export interface GlossaryToken {
  type: 'text' | 'term';
  content: string;
  slug?: string;
  termName?: string;
}

interface TermPattern {
  phrase: string;
  slug: string;
  termName: string;
}

/** Precompiled pattern lists sorted by length descending to prevent sub-string shadowing. */
function buildPatternList(locale: string): TermPattern[] {
  const isTr = locale === 'tr';
  const patterns: TermPattern[] = [];

  for (const term of glossaryTerms) {
    const tr = GLOSSARY_TERMS_TR[term.slug];
    const phrases = new Set<string>();

    if (isTr) {
      if (tr?.term) phrases.add(tr.term);
      if (tr?.aliases) {
        for (const a of tr.aliases) phrases.add(a);
      }
      // Also catch original English acronyms or terms widely used in Turkish (e.g. DRS, ERS, Halo, Downforce)
      phrases.add(term.term);
      if (term.aliases) {
        for (const a of term.aliases) phrases.add(a);
      }
    } else {
      phrases.add(term.term);
      if (term.aliases) {
        for (const a of term.aliases) phrases.add(a);
      }
    }

    const primaryName = isTr && tr?.term ? tr.term : term.term;
    for (const phrase of phrases) {
      const clean = phrase.trim();
      if (clean.length >= 2) {
        patterns.push({
          phrase: clean,
          slug: term.slug,
          termName: primaryName,
        });
      }
    }
  }

  // Sort descending by phrase length
  return patterns.sort((a, b) => b.phrase.length - a.phrase.length);
}

const patternCache: Record<string, TermPattern[]> = {};

function getPatterns(locale: string): TermPattern[] {
  const key = locale === 'tr' ? 'tr' : 'en';
  if (!patternCache[key]) {
    patternCache[key] = buildPatternList(key);
  }
  return patternCache[key];
}

function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Tokenizes plain text into regular text and matched glossary terms.
 * Each unique term slug is linked at most once per input block to prevent editorial clutter.
 */
export function tokenizeWithGlossary(text: string, locale = 'tr'): GlossaryToken[] {
  if (!text || text.trim().length === 0) {
    return [{ type: 'text', content: text }];
  }

  const patterns = getPatterns(locale);
  if (patterns.length === 0) {
    return [{ type: 'text', content: text }];
  }

  // Combine patterns into single regex with word boundary safety for English and Turkish letters
  // [a-zA-ZçğıöşüÇĞİÖŞÜ0-9]
  const patternMap = new Map<string, { slug: string; termName: string }>();
  const regexParts: string[] = [];

  for (const p of patterns) {
    const lower = p.phrase.toLowerCase();
    if (!patternMap.has(lower)) {
      patternMap.set(lower, { slug: p.slug, termName: p.termName });
      regexParts.push(escapeRegex(p.phrase));
    }
  }

  if (regexParts.length === 0) {
    return [{ type: 'text', content: text }];
  }

  const letterBoundary = '(?<![a-zA-ZçğıöşüÇĞİÖŞÜ0-9])';
  const postBoundary = '(?![a-zA-ZçğıöşüÇĞİÖŞÜ0-9])';
  const combinedRegex = new RegExp(`${letterBoundary}(${regexParts.join('|')})${postBoundary}`, 'gi');

  const tokens: GlossaryToken[] = [];
  const seenSlugs = new Set<string>();
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = combinedRegex.exec(text)) !== null) {
    const matchStart = match.index;
    const matchText = match[0];
    const matchEnd = matchStart + matchText.length;
    const lowerMatch = matchText.toLowerCase();
    const info = patternMap.get(lowerMatch);

    if (info && !seenSlugs.has(info.slug)) {
      if (matchStart > lastIndex) {
        tokens.push({
          type: 'text',
          content: text.slice(lastIndex, matchStart),
        });
      }

      tokens.push({
        type: 'term',
        content: matchText,
        slug: info.slug,
        termName: info.termName,
      });

      seenSlugs.add(info.slug);
      lastIndex = matchEnd;
    }
  }

  if (lastIndex < text.length) {
    tokens.push({
      type: 'text',
      content: text.slice(lastIndex),
    });
  }

  return tokens.length > 0 ? tokens : [{ type: 'text', content: text }];
}
