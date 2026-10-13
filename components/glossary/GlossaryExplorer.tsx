'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { useTranslations } from 'next-intl';
import type { GlossaryTerm } from '@/data/glossary/terms';
import type { TyreCompound } from '@/data/glossary/tyres';
import {
  filterTerms,
  filterTyres,
  GLOSSARY_FILTERS,
  TERM_CATEGORY_ORDER,
  type GlossaryFilter,
} from '@/lib/glossary/filter';
import { TyreCompoundExplorer } from '@/components/glossary/TyreCompoundExplorer';
import { TermDossierCard } from '@/components/glossary/TermDossierCard';
import { CategoryDiagram } from '@/components/glossary/TermDiagram';

export function GlossaryExplorer({
  terms,
  tyres,
}: {
  terms: GlossaryTerm[];
  tyres: TyreCompound[];
}) {
  const t = useTranslations('ui.glossary');
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<GlossaryFilter>('all');
  const inputRef = useRef<HTMLInputElement>(null);

  const visibleTyres = useMemo(() => filterTyres(tyres, query, filter), [tyres, query, filter]);
  const visibleTerms = useMemo(() => filterTerms(terms, query, filter), [terms, query, filter]);

  const totalMatches = visibleTyres.length + visibleTerms.length;

  // Chip counts follow the search text, so "drs" does not still read "All 18".
  const categoryCounts = useMemo(() => {
    const matchingTerms = filterTerms(terms, query, 'all');
    const matchingTyres = filterTyres(tyres, query, 'all');
    const counts: Record<string, number> = {
      all: matchingTerms.length + matchingTyres.length,
      Tyres: matchingTyres.length,
    };
    for (const t of matchingTerms) {
      counts[t.category] = (counts[t.category] || 0) + 1;
    }
    return counts;
  }, [terms, tyres, query]);

  const byCategory = useMemo(() => {
    const acc: Partial<Record<GlossaryTerm['category'], GlossaryTerm[]>> = {};
    for (const t of visibleTerms) {
      (acc[t.category] ??= []).push(t);
    }
    return acc;
  }, [visibleTerms]);

  // Keyboard shortcut '/' to search
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && query) {
        setQuery('');
        return;
      }
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
  }, [query]);


  const empty = totalMatches === 0;

  return (
    <div className="flex flex-col gap-10">
      {/* Floating Apple-grade Search & Segmented Filter Dock */}
      <div className="sticky top-0 z-30 -mx-4 border-b border-white/[0.08] bg-bg/85 px-4 py-3.5 shadow-lg backdrop-blur-2xl sm:-mx-6 sm:px-6 md:top-14">
        <div className="relative flex items-center">
          {/* Search Glass Icon */}
          <svg
            className="pointer-events-none absolute left-3.5 h-4 w-4 text-text-low/80"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>

          <input
            ref={inputRef}
            id="glossary-search"
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t('search')}
            className="w-full rounded-full border border-white/10 bg-white/[0.03] py-2.5 pl-10 pr-24 font-mono text-sm text-text-hi placeholder:text-text-low outline-none transition-all focus:border-white/25 focus:bg-white/[0.05] [&::-webkit-search-cancel-button]:appearance-none"
          />

          {/* Right Action Affordances */}
          <div className="absolute right-3 flex items-center gap-1.5">
            {query ? (
              <button
                type="button"
                onClick={() => setQuery('')}
                className="flex h-5 w-5 items-center justify-center rounded-full bg-white/10 text-xs text-text-mid transition-colors hover:bg-white/20 hover:text-white"
                aria-label={t('clear')}
              >
                ✕
              </button>
            ) : null}
            <kbd className="hidden select-none rounded border border-white/10 bg-white/[0.04] px-1.5 py-0.5 font-mono text-[10px] text-text-low sm:inline-block">
              /
            </kbd>
          </div>
        </div>

        {/* iOS-Style Segmented Control Pills */}
        <div className="mt-3 flex items-center gap-1.5 overflow-x-auto pb-0.5 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {GLOSSARY_FILTERS.map((chip) => {
            const selected = filter === chip.id;
            const count = categoryCounts[chip.id] ?? 0;

            return (
              <button
                key={chip.id}
                type="button"
                onClick={() => setFilter(chip.id)}
                aria-pressed={selected}
                className={[
                  'inline-flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1.5 font-mono text-xs uppercase tracking-wider transition-all duration-150 ease-out active:scale-95',
                  selected
                    ? 'bg-white text-black font-semibold shadow-sm'
                    : 'border border-white/[0.06] bg-white/[0.02] text-text-mid hover:border-white/15 hover:bg-white/[0.05] hover:text-white',
                ].join(' ')}
              >
                <span>{t(`cat.${chip.id}`)}</span>
                <span
                  className={[
                    'rounded-full px-1.5 py-0.2 text-[10px] tabular-nums',
                    selected ? 'bg-black/10 text-black' : 'bg-white/[0.06] text-text-low',
                  ].join(' ')}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Empty State */}
      {empty ? (
        <div className="flex flex-col items-center justify-center gap-3 py-16 text-center">
          <span className="flex h-12 w-12 items-center justify-center rounded-full border border-white/10 bg-white/[0.02] text-text-low text-xl">
            ∅
          </span>
          <h3 className="font-condensed text-xl font-700 uppercase tracking-tight text-white">
            {t('noMatch')}
          </h3>
          <p className="body-md max-w-sm text-text-mid">
            {t('noMatchBody', { query })}
          </p>
          <button
            type="button"
            onClick={() => {
              setQuery('');
              setFilter('all');
            }}
            className="mt-2 rounded-full border border-white/15 bg-white/[0.05] px-4 py-1.5 font-mono text-xs font-semibold uppercase tracking-wider text-text-hi transition-colors hover:bg-white/10"
          >
            {t('reset')}
          </button>
        </div>
      ) : null}

      {/* Tyre Compounds: the tyre rack (TyreCompoundExplorer) */}
      {visibleTyres.length > 0 ? <TyreCompoundExplorer tyres={visibleTyres} /> : null}

      {/* Technical Categories Grid */}
      {TERM_CATEGORY_ORDER.map((category) => {
        const categoryTerms = byCategory[category];
        if (!categoryTerms?.length) return null;

        return (
          <section
            key={category}
            id={category.toLowerCase().replace(/\s+/g, '-')}
            className="scroll-mt-36 flex flex-col gap-4"
          >
            <div className="flex items-center justify-between border-b border-hairline/60 pb-2.5">
              <div className="flex items-center gap-2.5">
                <div className="relative flex h-7 w-7 shrink-0 items-center justify-center overflow-hidden rounded-md border border-white/10 bg-white/[0.03] p-0.5 shadow-sm">
                  <CategoryDiagram category={category} className="h-full w-full" />
                </div>
                <div className="flex items-baseline gap-2">
                  <h2 className="headline-md uppercase tracking-tight text-text-hi">
                    {category === 'Aerodynamics' ? t('cat.AerodynamicsFull') : t(`cat.${category}`)}
                  </h2>
                  <span className="font-mono text-xs text-text-low">
                    ({categoryTerms.length})
                  </span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
              {categoryTerms.map((term) => (
                <TermDossierCard key={term.slug} term={term} />
              ))}
            </div>
          </section>
        );
      })}

    </div>
  );
}
