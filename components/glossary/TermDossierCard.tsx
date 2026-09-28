'use client';

import type { GlossaryTerm } from '@/data/glossary/terms';
import { TermDiagram, CategoryDiagram } from '@/components/glossary/TermDiagram';

/**
 * Apple Design Technical Dossier Card.
 * One DOM node per term with stable anchor (#slug).
 * Clean typographic hierarchy, full definition legibility (no destructive clipping),
 * dedicated technical blueprint diagram viewport, and pit-wall engineering callout.
 */
export function TermDossierCard({ term }: { term: GlossaryTerm }) {
  return (
    <article
      id={term.slug}
      className="group relative flex scroll-mt-32 flex-col justify-between overflow-hidden rounded-[var(--radius-lg)] border border-white/[0.08] bg-white/[0.02] p-5 shadow-[0_4px_24px_rgba(0,0,0,0.5)] backdrop-blur-md transition-all duration-200 ease-out hover:border-white/20 hover:bg-white/[0.04] active:scale-[0.99] md:p-6"
    >
      {/* Top specular edge highlight */}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/15 to-transparent"
      />

      <div className="flex flex-col gap-3">
        {/* Header: Title, Category Badge & Blueprint Diagram */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex flex-col gap-1.5">
            <span className="inline-flex w-fit items-center gap-1 rounded-full border border-white/10 bg-white/[0.04] px-2.5 py-0.5 font-mono text-[10px] font-bold uppercase tracking-wider text-text-hi/80">
              <span className="h-1.5 w-1.5 rounded-full bg-accent" />
              {term.badge}
            </span>

            <h3
              className="font-condensed text-xl font-700 uppercase tracking-tight text-white transition-colors group-hover:text-text-hi sm:text-2xl"
              style={{ fontFamily: 'var(--font-condensed)' }}
            >
              {term.term}
            </h3>
          </div>

          {/* Dedicated Blueprint Diagram Viewport */}
          <div
            className="relative flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-white/10 bg-white/[0.02] p-1 shadow-sm transition-all duration-200 ease-out group-hover:scale-105 group-hover:border-red-500/40 group-hover:bg-white/[0.04] sm:h-14 sm:w-14"
            title={`${term.term} CAD schematic`}
          >
            {term.diagram ? (
              <TermDiagram id={term.diagram} className="h-full w-full" />
            ) : (
              <CategoryDiagram category={term.category} className="h-full w-full opacity-75 transition-opacity group-hover:opacity-100" />
            )}
          </div>
        </div>

        {/* Technical Definition (Complete & Readable) */}
        <p className="body-md text-sm leading-relaxed text-text-mid/90 sm:text-[15px]">
          {term.definition}
        </p>
      </div>

      {/* Engineering Note / Key Impact Callout */}
      {term.keyImpact ? (
        <div className="mt-4 flex items-start gap-2.5 rounded-[var(--radius-chip)] border border-white/[0.06] bg-white/[0.02] p-3 text-xs transition-colors group-hover:border-white/10">
          <span className="shrink-0 rounded bg-accent/15 px-1.5 py-0.5 font-mono text-[10px] font-bold uppercase tracking-wider text-accent">
            Impact
          </span>
          <span className="font-mono leading-snug text-text-mid">
            {term.keyImpact}
          </span>
        </div>
      ) : null}
    </article>
  );
}
