'use client';

import { useState, useMemo } from 'react';
import { useTranslations } from 'next-intl';
import { CircuitCardView } from './CircuitCardView';
import type { CircuitCard, CircuitCounts } from '@/lib/data/circuits';
import type { CircuitFacts } from '@/data/circuits/facts';
import type { MediaResult } from '@/lib/media/read';

export interface CardWithFacts extends CircuitCard {
  facts?: CircuitFacts | null;
}

export interface CircuitsDirectoryProps {
  cards: CardWithFacts[];
  mediaRecord: Record<string, MediaResult>;
  counts: CircuitCounts;
}

type FilterState = 'all' | 'upcoming' | 'done';
type ViewMode = 'cards' | 'compact';

/**
 * Apple WWDC Segmented & Fluid Circuits Directory:
 * Provides real-time filtering (All / Upcoming / Completed), layout view switching (Cards / Compact List),
 * and high-performance deferred rendering for below-the-fold venue cards.
 */
export function CircuitsDirectory({
  cards,
  mediaRecord,
  counts,
}: CircuitsDirectoryProps) {
  const t = useTranslations('ui.circuit');
  const [filter, setFilter] = useState<FilterState>('all');
  const [view, setView] = useState<ViewMode>('cards');

  const filteredCards = useMemo(() => {
    if (filter === 'upcoming') return cards.filter((c) => !c.done);
    if (filter === 'done') return cards.filter((c) => c.done);
    return cards;
  }, [cards, filter]);

  return (
    <section className="flex flex-col gap-6">
      {/* Control & Filter Ribbon (Apple Segmented Style) */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-white/[0.08] pb-5">
        {/* Status Filter Segmented Control */}
        <div
          role="tablist"
          aria-label="Circuit Filter"
          className="inline-flex items-center rounded-xl border border-white/[0.08] bg-surface/80 p-1 backdrop-blur-md"
        >
          <button
            type="button"
            role="tab"
            aria-selected={filter === 'all'}
            onClick={() => setFilter('all')}
            className={`flex items-center gap-2 rounded-lg px-3.5 py-1.5 text-xs font-mono uppercase tracking-[0.08em] transition-all duration-200 ${
              filter === 'all'
                ? 'bg-white/10 text-white font-600 shadow-sm border border-white/10'
                : 'text-text-mid hover:text-white'
            }`}
          >
            <span>{t('filterAll')}</span>
            <span className="rounded-full bg-white/10 px-1.5 py-0.2 text-[10px] tabular-nums text-text-low">
              {counts.all}
            </span>
          </button>

          <button
            type="button"
            role="tab"
            aria-selected={filter === 'upcoming'}
            onClick={() => setFilter('upcoming')}
            className={`flex items-center gap-2 rounded-lg px-3.5 py-1.5 text-xs font-mono uppercase tracking-[0.08em] transition-all duration-200 ${
              filter === 'upcoming'
                ? 'bg-white/10 text-white font-600 shadow-sm border border-white/10'
                : 'text-text-mid hover:text-white'
            }`}
          >
            <span>{t('filterUpcoming')}</span>
            <span className="rounded-full bg-white/10 px-1.5 py-0.2 text-[10px] tabular-nums text-accent font-600">
              {counts.upcoming}
            </span>
          </button>

          <button
            type="button"
            role="tab"
            aria-selected={filter === 'done'}
            onClick={() => setFilter('done')}
            className={`flex items-center gap-2 rounded-lg px-3.5 py-1.5 text-xs font-mono uppercase tracking-[0.08em] transition-all duration-200 ${
              filter === 'done'
                ? 'bg-white/10 text-white font-600 shadow-sm border border-white/10'
                : 'text-text-mid hover:text-white'
            }`}
          >
            <span>{t('filterDone')}</span>
            <span className="rounded-full bg-white/10 px-1.5 py-0.2 text-[10px] tabular-nums text-text-low">
              {counts.done}
            </span>
          </button>
        </div>

        {/* View Mode Switcher (Cards / List) */}
        <div className="flex items-center gap-3 self-end sm:self-auto">
          <span className="hidden lg:inline-block font-mono text-xs text-text-low">
            {t('totalCalendar', { races: counts.all, countries: counts.countries })}
          </span>
          <div className="inline-flex items-center rounded-lg border border-white/[0.08] bg-surface/60 p-1">
            <button
              type="button"
              aria-label={t('viewGrid')}
              title={t('viewGrid')}
              onClick={() => setView('cards')}
              className={`rounded-md p-1.5 transition-colors ${
                view === 'cards' ? 'bg-white/10 text-white' : 'text-text-low hover:text-text-mid'
              }`}
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="3" width="7" height="7" rx="1.5" />
                <rect x="14" y="3" width="7" height="7" rx="1.5" />
                <rect x="14" y="14" width="7" height="7" rx="1.5" />
                <rect x="3" y="14" width="7" height="7" rx="1.5" />
              </svg>
            </button>
            <button
              type="button"
              aria-label={t('viewCompact')}
              title={t('viewCompact')}
              onClick={() => setView('compact')}
              className={`rounded-md p-1.5 transition-colors ${
                view === 'compact' ? 'bg-white/10 text-white' : 'text-text-low hover:text-text-mid'
              }`}
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Circuit Directory Items Container */}
      {view === 'cards' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 lg:gap-6">
          {filteredCards.map((card, idx) => (
            <div key={card.circuitId} className={idx >= 6 ? 'bento-deferred' : undefined}>
              <CircuitCardView
                card={card}
                media={mediaRecord[card.circuitId]}
                facts={card.facts}
                status={card.done ? 'done' : 'upcoming'}
              />
            </div>
          ))}
        </div>
      ) : (
        <div className="flex flex-col gap-2.5">
          {filteredCards.map((card, idx) => (
            <div key={card.circuitId} className={idx >= 10 ? 'bento-deferred' : undefined}>
              <CircuitCardView
                card={card}
                media={mediaRecord[card.circuitId]}
                facts={card.facts}
                status={card.done ? 'done' : 'upcoming'}
                compact
              />
            </div>
          ))}
        </div>
      )}

      {/* Empty State */}
      {filteredCards.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-12 text-center rounded-2xl border border-white/[0.08] bg-surface/30">
          <p className="font-mono text-sm text-text-low">{t('noRaces')}</p>
        </div>
      ) : null}
    </section>
  );
}
