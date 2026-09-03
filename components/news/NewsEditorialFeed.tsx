'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import type { NewsItem } from '@/lib/data/types';
import {
  classifyNewsCategory,
  hasRealImage,
  type NewsCategory,
} from '@/lib/news/categories';
import { NewsFilterBar } from '@/components/news/NewsFilterBar';
import { NewsCard } from '@/components/news/NewsList';
import { NewsWireFeed } from '@/components/news/NewsWireFeed';
import { NewsImageFallback } from '@/components/news/NewsImageFallback';

const INITIAL_COUNT = 12;
const LOAD_STEP = 12;
const MOBILE_CARD_COUNT = 5;

function matchesFilter(item: NewsItem, filter: NewsCategory): boolean {
  if (filter === 'all') return true;
  return classifyNewsCategory(item.title, item.summary) === filter;
}

function CompactNewsRow({ item }: { item: NewsItem }) {
  const hasImage = hasRealImage(item);
  return (
    <Link
      href={`/news/${item.id}`}
      className="group flex items-start gap-3 border-b border-hairline py-3 last:border-b-0"
    >
      <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-[var(--radius-chip)] bg-surface">
        {hasImage ? (
          <Image
            src={item.image}
            alt=""
            fill
            sizes="64px"
            loading="lazy"
            className="object-cover transition-transform duration-200 group-hover:scale-105"
          />
        ) : (
          <NewsImageFallback />
        )}
      </div>
      <div className="min-w-0 flex-1">
        <span className="data-tabular text-[10px] uppercase tracking-wider text-zinc-500">
          {item.dateLabel} · {item.sourceName}
        </span>
        <span
          className="mt-0.5 line-clamp-2 block font-condensed text-base font-700 uppercase leading-tight text-text-hi"
          style={{ fontFamily: 'var(--font-condensed)' }}
        >
          {item.title}
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
        <p className="body-md py-8 text-center text-text-mid">
          No dispatches in this lane right now.
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
          <div className="rounded-[var(--radius-lg)] border border-hairline bg-surface/30 px-4">
            <span className="label-caps block py-3 text-text-low">More dispatches</span>
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
            className="label-caps rounded-[var(--radius-pill)] border border-white/15 bg-white/[0.04] px-5 py-2.5 text-text-mid transition-colors hover:border-white/25 hover:text-text-hi"
          >
            Load Older Dispatches
          </button>
        </div>
      ) : null}

      <NewsWireFeed items={filteredWire} />
    </div>
  );
}
