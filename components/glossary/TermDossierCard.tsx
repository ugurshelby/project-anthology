'use client';

import { useState } from 'react';
import type { GlossaryTerm } from '@/data/glossary/terms';
import { TermDiagram } from '@/components/glossary/TermDiagram';

/**
 * Technical dossier card. One DOM node per term (so #slug anchors work).
 * Mobile: compact accordion with accent rail when open.
 * md+: always-open bento card with 1-bit diagram.
 */
export function TermDossierCard({ term }: { term: GlossaryTerm }) {
  const [open, setOpen] = useState(false);

  return (
    <article
      id={term.slug}
      className={[
        'relative scroll-mt-28 overflow-hidden rounded-[var(--radius-lg)] border border-hairline bg-surface',
        open ? 'border-l-2 border-l-accent md:border-l md:border-hairline' : '',
      ].join(' ')}
    >
      <button
        type="button"
        className="flex w-full items-center justify-between gap-3 px-3 py-2.5 text-left md:hidden"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
      >
        <span className="min-w-0">
          <span className="block font-mono text-sm font-700 uppercase text-white">{term.term}</span>
          <span className="label-caps text-zinc-500">{term.badge}</span>
        </span>
        <span
          aria-hidden
          className="shrink-0 text-sm text-text-mid transition-transform duration-200 motion-reduce:transition-none"
          style={{ transform: open ? 'rotate(45deg)' : 'rotate(0deg)' }}
        >
          +
        </span>
      </button>

      <div className="hidden p-5 md:block md:p-6">
        {term.diagram ? (
          <span className="pointer-events-none absolute right-3 top-3 md:right-4 md:top-4">
            <TermDiagram id={term.diagram} />
          </span>
        ) : null}
        <div className="relative z-10 flex max-w-[calc(100%-3.5rem)] flex-col gap-2 pr-2">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="font-mono text-sm font-700 uppercase tracking-wide text-white md:text-base">
              {term.term}
            </h3>
            <span className="label-caps rounded-[var(--radius-chip)] border border-white/10 bg-white/[0.04] px-2 py-0.5 text-zinc-400">
              {term.badge}
            </span>
          </div>
          <p className="line-clamp-2 body-md text-text-mid">{term.definition}</p>
          {term.keyImpact ? (
            <p className="data-tabular text-xs leading-snug text-zinc-500">Key impact: {term.keyImpact}</p>
          ) : null}
        </div>
      </div>

      <div className={open ? 'block md:hidden' : 'hidden md:hidden'}>
        <p className="body-md px-3 pb-3 text-text-mid">{term.definition}</p>
        {term.keyImpact ? (
          <p className="data-tabular px-3 pb-3 text-xs text-zinc-500">Key impact: {term.keyImpact}</p>
        ) : null}
      </div>
    </article>
  );
}
