import { Fragment, type ReactNode } from 'react';
import Link from 'next/link';
import { glossaryTerms, type GlossaryTerm } from '@/data/glossary/terms';

/**
 * Internal-linking: scans body text for known glossary terms and links the
 * FIRST occurrence of each to /tech-glossary#slug.
 *
 * Rules (per Phase 6 spec):
 *  - word boundary (\b) so "turbo" won't match inside "turbocharged-ness"
 *  - case-insensitive match, preserving the original casing in the rendered text
 *  - one link per term per text block (first match only) to avoid link spam
 *  - longest surface forms matched first so "Drag Reduction System" wins over a
 *    bare substring; aliases (DRS, KERS, tow…) are matched too
 *
 * Server component: pure, no client JS. Use it to wrap plain story paragraphs.
 */

interface Surface {
  term: GlossaryTerm;
  surface: string;
}

// Precompute every linkable surface form (term + aliases), longest first.
const SURFACES: Surface[] = glossaryTerms
  .flatMap((term) => [term.term, ...(term.aliases ?? [])].map((surface) => ({ term, surface })))
  .sort((a, b) => b.surface.length - a.surface.length);

function escapeRegExp(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// Source for the alternation regex, ordered longest→shortest via SURFACES.
// Word boundaries guard both ends. A fresh RegExp is built per call so there is
// no shared mutable `lastIndex` state during render (keeps the component pure).
const PATTERN_SOURCE = `\\b(${SURFACES.map((s) => escapeRegExp(s.surface)).join('|')})\\b`;

function surfaceToSlug(matched: string): string | null {
  const lower = matched.toLowerCase();
  const hit = SURFACES.find((s) => s.surface.toLowerCase() === lower);
  return hit ? hit.term.slug : null;
}

export function GlossaryLink({ text }: { text: string }): ReactNode {
  const nodes: ReactNode[] = [];
  const linkedSlugs = new Set<string>();
  let lastIndex = 0;
  let key = 0;

  const pattern = new RegExp(PATTERN_SOURCE, 'gi');
  let m: RegExpExecArray | null;
  while ((m = pattern.exec(text)) !== null) {
    const matched = m[0];
    const slug = surfaceToSlug(matched);
    // Skip if unknown or this term was already linked once in this block.
    if (!slug || linkedSlugs.has(slug)) continue;
    linkedSlugs.add(slug);

    if (m.index > lastIndex) {
      nodes.push(<Fragment key={key++}>{text.slice(lastIndex, m.index)}</Fragment>);
    }
    nodes.push(
      <Link
        key={key++}
        href={`/tech-glossary#${slug}`}
        className="glossary-link"
        title={`Glossary: ${matched}`}
      >
        {matched}
      </Link>,
    );
    lastIndex = m.index + matched.length;
  }

  if (lastIndex < text.length) {
    nodes.push(<Fragment key={key++}>{text.slice(lastIndex)}</Fragment>);
  }

  return <>{nodes}</>;
}
