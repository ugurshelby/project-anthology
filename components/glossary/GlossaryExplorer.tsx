'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import type { GlossaryTerm } from '@/data/glossary/terms';
import type { TyreCompound } from '@/data/glossary/tyres';
import {
  filterTerms,
  filterTyres,
  GLOSSARY_FILTERS,
  TERM_CATEGORY_ORDER,
  type GlossaryFilter,
} from '@/lib/glossary/filter';
import { TyreCompoundCard } from '@/components/glossary/TyreCompoundCard';
import { TermDossierCard } from '@/components/glossary/TermDossierCard';

export function GlossaryExplorer({
  terms,
  tyres,
}: {
  terms: GlossaryTerm[];
  tyres: TyreCompound[];
}) {
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<GlossaryFilter>('all');
  const [sheetTyre, setSheetTyre] = useState<TyreCompound | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const visibleTyres = useMemo(() => filterTyres(tyres, query, filter), [tyres, query, filter]);
  const visibleTerms = useMemo(() => filterTerms(terms, query, filter), [terms, query, filter]);

  const byCategory = useMemo(() => {
    const acc: Partial<Record<GlossaryTerm['category'], GlossaryTerm[]>> = {};
    for (const t of visibleTerms) {
      (acc[t.category] ??= []).push(t);
    }
    return acc;
  }, [visibleTerms]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== '/' || e.metaKey || e.ctrlKey || e.altKey) return;
      const target = e.target as HTMLElement | null;
      if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable)) {
        return;
      }
      e.preventDefault();
      inputRef.current?.focus();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  useEffect(() => {
    if (!sheetTyre) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setSheetTyre(null);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [sheetTyre]);

  const empty = visibleTyres.length === 0 && visibleTerms.length === 0;

  return (
    <div className="flex flex-col gap-8">
      <div className="sticky top-0 z-20 -mx-5 border-b border-hairline bg-bg/85 px-5 py-3 backdrop-blur-xl md:top-14 md:-mx-0 md:px-0">
        <label className="sr-only" htmlFor="glossary-search">
          Search technical terms
        </label>
        <div className="relative">
          <input
            ref={inputRef}
            id="glossary-search"
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search technical terms…  (Press / to search)"
            className="w-full rounded-[var(--radius-chip)] border border-white/10 bg-surface/80 px-4 py-2.5 font-mono text-sm text-text-hi outline-none placeholder:text-zinc-600 focus:border-white/25"
          />
        </div>
        <div className="mt-3 flex gap-2 overflow-x-auto pb-0.5 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {GLOSSARY_FILTERS.map((chip) => {
            const selected = filter === chip.id;
            return (
              <button
                key={chip.id}
                type="button"
                onClick={() => setFilter(chip.id)}
                aria-pressed={selected}
                className={[
                  'label-caps shrink-0 rounded-[var(--radius-pill)] border px-3 py-1.5 transition-colors',
                  selected
                    ? 'border-white/20 bg-white/5 text-text-hi'
                    : 'border-transparent text-zinc-500 hover:text-zinc-300',
                ].join(' ')}
              >
                {chip.label}
              </button>
            );
          })}
        </div>
      </div>

      {empty ? (
        <p className="body-md py-10 text-center text-text-mid">No matching terms in this lane.</p>
      ) : null}

      {visibleTyres.length > 0 ? (
        <section id="tyres" className="scroll-mt-36 flex flex-col gap-4">
          <h2 className="headline-md uppercase text-text-hi">Tyre Compounds</h2>
          <div className="grid grid-cols-2 gap-3 md:hidden">
            {visibleTyres.map((t) => (
              <TyreCompoundCard key={t.id} tyre={t} compact onOpen={setSheetTyre} />
            ))}
          </div>
          <div className="hidden grid-cols-2 gap-4 md:grid lg:grid-cols-4">
            {visibleTyres.map((t) => (
              <TyreCompoundCard key={t.id} tyre={t} />
            ))}
          </div>
        </section>
      ) : null}

      {TERM_CATEGORY_ORDER.map((category) => {
        const categoryTerms = byCategory[category];
        if (!categoryTerms?.length) return null;
        return (
          <section key={category} id={category.toLowerCase().replace(/\s+/g, '-')} className="scroll-mt-36 flex flex-col gap-4">
            <h2 className="headline-md uppercase text-text-hi">{category}</h2>
            <div className="grid grid-cols-1 gap-2 md:grid-cols-2 md:gap-4 lg:grid-cols-3">
              {categoryTerms.map((term) => (
                <TermDossierCard key={term.slug} term={term} />
              ))}
            </div>
          </section>
        );
      })}

      {sheetTyre ? (
        <div className="fixed inset-0 z-40 md:hidden" role="dialog" aria-modal="true" aria-labelledby="tyre-sheet-title">
          <button
            type="button"
            className="absolute inset-0 bg-black/60"
            aria-label="Close tyre detail"
            onClick={() => setSheetTyre(null)}
          />
          <div className="absolute inset-x-0 bottom-0 rounded-t-[var(--radius-lg)] border border-hairline bg-surface p-5 pb-[max(1.5rem,env(safe-area-inset-bottom))]">
            <div className="mb-3 flex items-start justify-between gap-3">
              <h3 id="tyre-sheet-title" className="font-condensed text-xl font-700 uppercase text-text-hi" style={{ fontFamily: 'var(--font-condensed)' }}>
                {sheetTyre.name}
              </h3>
              <button type="button" onClick={() => setSheetTyre(null)} className="label-caps text-zinc-500">
                Close
              </button>
            </div>
            <p className="body-md text-text-mid">{sheetTyre.description}</p>
          </div>
        </div>
      ) : null}
    </div>
  );
}
