import Image from 'next/image';
import type { NewsItem } from '@/lib/data/types';
import { hasRealImage } from '@/lib/data/news';

/** A single wire item — mono timestamp, headline, source. */
export function WireItem({ item }: { item: NewsItem }) {
  return (
    <a
      href={item.url}
      target="_blank"
      rel="noopener noreferrer"
      className="group flex flex-col gap-1 border-b border-hairline py-3 last:border-b-0"
    >
      <span className="label-caps text-text-low">
        {item.dateLabel} · {item.sourceName}
      </span>
      <span className="font-condensed text-lg font-500 leading-tight text-text transition-colors group-hover:text-text-hi" style={{ fontFamily: 'var(--font-condensed)' }}>
        {item.title}
      </span>
    </a>
  );
}

/** "THE WIRE" list (design.md home §3.3). */
export function NewsList({ items, heading = 'THE WIRE' }: { items: NewsItem[]; heading?: string }) {
  return (
    <div className="flex flex-col gap-2">
      <span className="label-caps text-text-mid">{heading}</span>
      <div className="flex flex-col">
        {items.map((item) => (
          <WireItem key={item.id} item={item} />
        ))}
      </div>
    </div>
  );
}

/** Featured news hero — large image + headline (uses real-image guard). */
export function NewsHero({ item }: { item: NewsItem }) {
  const showImage = hasRealImage(item);
  return (
    <a
      href={item.url}
      target="_blank"
      rel="noopener noreferrer"
      className="group relative flex min-h-64 flex-col justify-end overflow-hidden rounded-[var(--radius-lg)] border border-hairline bg-surface p-6 md:p-8"
    >
      {showImage ? (
        <>
          <Image src={item.image} alt="" fill sizes="100vw" className="object-cover opacity-50 transition-opacity group-hover:opacity-60" />
          <span aria-hidden className="absolute inset-0 bg-gradient-to-t from-bg via-bg/60 to-transparent" />
        </>
      ) : null}
      <div className="relative z-10 flex flex-col gap-2">
        <span className="label-caps text-text-mid">
          {item.dateLabel} · {item.sourceName}
        </span>
        <h2 className="headline-lg text-text-hi">{item.title}</h2>
      </div>
    </a>
  );
}
