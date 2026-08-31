import Link from 'next/link';
import Image from 'next/image';
import type { NewsItem } from '@/lib/data/types';
import { hasRealImage } from '@/lib/data/news';

/**
 * A single wire item — cover image (always real, callers filter via
 * hasRealImage before rendering a list), headline, source/date. Links to our
 * own /news/[id] detail page rather than the external source.
 */
export function WireItem({ item }: { item: NewsItem }) {
  return (
    <Link
      href={`/news/${item.id}`}
      className="group flex flex-col gap-2 border-b border-hairline py-3 last:border-b-0 md:flex-row md:items-center md:gap-4"
    >
      <div className="relative h-40 w-full shrink-0 overflow-hidden rounded-[var(--radius-chip)] md:h-16 md:w-24">
        <Image
          src={item.image}
          alt=""
          fill
          sizes="(max-width: 768px) 100vw, 96px"
          className="object-cover transition-transform duration-200 group-hover:scale-105"
        />
      </div>
      <div className="flex min-w-0 flex-col gap-1">
        <span className="label-caps text-text-low">
          {item.dateLabel} · {item.sourceName}
        </span>
        <span
          className="font-condensed text-lg font-500 leading-tight text-text transition-colors group-hover:text-text-hi"
          style={{ fontFamily: 'var(--font-condensed)' }}
        >
          {item.title}
        </span>
      </div>
    </Link>
  );
}

/** "THE WIRE" list (design.md home §3.3). Only items with a real cover image are shown. */
export function NewsList({ items, heading = 'THE WIRE' }: { items: NewsItem[]; heading?: string }) {
  const withImages = items.filter(hasRealImage);
  return (
    <div className="flex flex-col gap-2">
      <span className="label-caps text-text-mid">{heading}</span>
      {withImages.length === 0 ? (
        <p className="body-md py-4 text-text-mid">No headlines available right now.</p>
      ) : (
        <div className="flex flex-col">
          {withImages.map((item) => (
            <WireItem key={item.id} item={item} />
          ))}
        </div>
      )}
    </div>
  );
}

/** Featured news hero — large image + headline. Links to our own detail page. */
export function NewsHero({ item }: { item: NewsItem }) {
  return (
    <Link
      href={`/news/${item.id}`}
      className="group relative flex min-h-64 flex-col justify-end overflow-hidden rounded-[var(--radius-lg)] border border-hairline bg-surface p-6 md:p-8"
    >
      <Image
        src={item.image}
        alt=""
        fill
        sizes="100vw"
        className="object-cover opacity-50 transition-opacity group-hover:opacity-60"
      />
      <span aria-hidden className="absolute inset-0 bg-gradient-to-t from-bg via-bg/60 to-transparent" />
      <div className="relative z-10 flex flex-col gap-2">
        <span className="label-caps text-text-mid">
          {item.dateLabel} · {item.sourceName}
        </span>
        <h2 className="headline-lg text-text-hi">{item.title}</h2>
      </div>
    </Link>
  );
}

/** Grid card for the /news listing — desktop 3-col grid item, mobile full-width stack. */
export function NewsCard({ item }: { item: NewsItem }) {
  return (
    <Link
      href={`/news/${item.id}`}
      className="group relative flex min-h-56 flex-col justify-end overflow-hidden rounded-[var(--radius-lg)] border border-hairline bg-surface p-5"
    >
      <Image
        src={item.image}
        alt=""
        fill
        sizes="(max-width: 1024px) 100vw, 33vw"
        className="object-cover opacity-60 transition-opacity duration-200 group-hover:opacity-70"
      />
      <span aria-hidden className="absolute inset-0 bg-gradient-to-t from-bg via-bg/70 to-transparent" />
      <div className="relative z-10 flex flex-col gap-1.5">
        <span className="label-caps text-text-mid">
          {item.dateLabel} · {item.sourceName}
        </span>
        <span
          className="font-condensed text-xl font-600 uppercase leading-tight text-text-hi"
          style={{ fontFamily: 'var(--font-condensed)' }}
        >
          {item.title}
        </span>
      </div>
    </Link>
  );
}
