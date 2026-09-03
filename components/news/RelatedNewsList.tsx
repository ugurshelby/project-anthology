import Link from 'next/link';
import Image from 'next/image';
import type { NewsItem } from '@/lib/data/types';
import { hasRealImage } from '@/lib/news/categories';
import { formatDispatchAge } from '@/lib/news/time';
import { NewsImageFallback } from '@/components/news/NewsImageFallback';

/** Compact related-news feed — 64px thumb + title + relative dispatch time. */
export function RelatedNewsList({
  items,
  heading = 'In The Wire',
}: {
  items: NewsItem[];
  heading?: string;
}) {
  if (items.length === 0) return null;

  return (
    <div className="flex flex-col gap-2">
      <span className="label-caps text-text-mid">{heading}</span>
      <ul className="flex flex-col">
        {items.map((item) => {
          const age = formatDispatchAge(item.publishedTs);
          const hasImage = hasRealImage(item);
          return (
            <li key={item.id}>
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
                    {age || item.dateLabel} · {item.sourceName}
                  </span>
                  <span
                    className="mt-0.5 line-clamp-2 block font-condensed text-base font-700 leading-tight text-text-hi"
                    style={{ fontFamily: 'var(--font-condensed)' }}
                  >
                    {item.title}
                  </span>
                </div>
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
