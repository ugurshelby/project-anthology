'use client';

import { useMemo, useState } from 'react';
import { Link } from '@/i18n/routing';
import { useLocale } from 'next-intl';
import { ApexImage } from '@/components/media/ApexImage';
import type { NewsItem } from '@/lib/data/types';
import { localizedNewsTitle } from '@/lib/news/i18n';
import {
  classifyNewsCategory,
  hasRealImage,
  type NewsCategory,
} from '@/lib/news/categories';
import { NewsFilterBar } from '@/components/news/NewsFilterBar';
import { NewsCard } from '@/components/news/NewsList';
import { NewsWireFeed } from '@/components/news/NewsWireFeed';

const INITIAL_COUNT = 12;
const LOAD_STEP = 12;
const MOBILE_CARD_COUNT = 5;

function matchesFilter(item: NewsItem, filter: NewsCategory): boolean {
  if (filter === 'all') return true;
  return classifyNewsCategory(item.title, item.summary) === filter;
}

function CompactNewsRow({ item }: { item: NewsItem }) {
  const locale = useLocale();
  const hasImage = hasRealImage(item);
  const title = localizedNewsTitle(item, locale);

  return (
    <Link
      href={`/news/${item.id}`}
      className="group flex items-start gap-3 border-b border-hairline py-3.5 last:border-b-0 transition-colors hover:bg-white/[0.02] px-1 rounded-[var(--radius-chip)]"
    >
      {hasImage ? (
        <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-[var(--radius-chip)] bg-surface">
          <ApexImage
            src={item.image}
            alt=""
            fill
            kind="media"
            sizes="64px"
            loading="lazy"
            className="object-cover transition-transform duration-200 group-hover:scale-105"
          />
        </div>
      ) : (
        <div className="mt-1 flex h-10 w-1 shrink-0 rounded-full bg-hairline group-hover:bg-accent transition-colors" />
      )}
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="data-tabular text-xs uppercase tracking-wider text-text-mid font-mono">
            {item.dateLabel} · {item.sourceName}
          </span>
          {item.sources && item.sources.length > 1 ? (
            <span className="label-caps rounded-full border border-white/10 bg-white/5 px-1.5 py-0.5 text-[9px] font-mono text-text-mid">
              {item.sources.length} {locale === 'tr' ? 'kaynak' : 'sources'}
            </span>
          ) : null}
        </div>
        <span
          className="mt-0.5 line-clamp-2 block font-condensed text-base font-700 uppercase leading-tight text-text-hi group-hover:text-white break-words"
          style={{ fontFamily: 'var(--font-condensed)' }}
        >
          {title}
        </span>
      </div>
    </Link>
  );
}

/**
 * Client editorial feed: sticky category pills, responsive card→compact
 * list switch, wire for imageless items, and load-more pagination.
 */
export function NewsEditorialFeed({
  cards,
  wire,
}: {
  /** Items with (or without) images destined for the card/list column. */
  cards: NewsItem[];
  /** Imageless / agency briefs for telemetry wire. */
  wire: NewsItem[];
}) {
  const locale = useLocale();
  const [filter, setFilter] = useState<NewsCategory>('all');
  const [visible, setVisible] = useState(INITIAL_COUNT);

  const filteredCards = useMemo(
    () => cards.filter((item) => matchesFilter(item, filter)),
    [cards, filter],
  );
  const filteredWire = useMemo(
    () => wire.filter((item) => matchesFilter(item, filter)),
    [wire, filter],
  );

  const shown = filteredCards.slice(0, visible);
  const hasMore = visible < filteredCards.length;

  // Mobile: first N as cards, remainder as compact rows.
  const mobileCards = shown.slice(0, MOBILE_CARD_COUNT);
  const mobileCompact = shown.slice(MOBILE_CARD_COUNT);

  return (
    <div className="mt-6 flex flex-col gap-6 md:mt-8">
      <NewsFilterBar
        active={filter}
        onChange={(next) => {
          setFilter(next);
          setVisible(INITIAL_COUNT);
        }}
      />

      {shown.length === 0 && filteredWire.length === 0 ? (
        <p className="body-md py-8 text-center text-text-mid font-mono">
          {locale === 'tr' ? 'Bu kategoride henüz bir haber bulunmuyor.' : 'No dispatches in this lane right now.'}
        </p>
      ) : null}

      {/* Desktop / tablet: unbroken card grid */}
      <div className="hidden grid-cols-1 gap-5 sm:grid md:grid-cols-2 lg:grid-cols-3">
        {shown.map((item) => (
          <NewsCard key={item.id} item={item} />
        ))}
      </div>

      {/* Mobile: 5 cards then compact list */}
      <div className="flex flex-col gap-4 sm:hidden">
        <div className="grid grid-cols-1 gap-4">
          {mobileCards.map((item) => (
            <NewsCard key={item.id} item={item} />
          ))}
        </div>
        {mobileCompact.length > 0 ? (
          <div className="rounded-[var(--radius-lg)] border border-hairline bg-surface/30 px-4 py-2">
            <span className="label-caps block py-2 text-text-low font-mono">
              {locale === 'tr' ? 'Diğer Haberler' : 'More dispatches'}
            </span>
            {mobileCompact.map((item) => (
              <CompactNewsRow key={item.id} item={item} />
            ))}
          </div>
        ) : null}
      </div>

      {hasMore ? (
        <div className="flex justify-center pt-2">
          <button
            type="button"
            onClick={() => setVisible((n) => n + LOAD_STEP)}
            className="touch-target label-caps flex min-h-11 items-center rounded-[var(--radius-pill)] border border-white/15 bg-white/[0.04] px-6 py-2.5 text-text-mid font-mono transition-colors hover:border-white/30 hover:text-text-hi focus-visible:outline focus-visible:outline-2 focus-visible:outline-white"
          >
            {locale === 'tr' ? 'Daha Fazla Haber Göster' : 'Load Older Dispatches'}
          </button>
        </div>
      ) : null}

      <NewsWireFeed items={filteredWire} />
    </div>
  );
}
