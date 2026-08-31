import Link from 'next/link';
import type { NewsItem } from '@/lib/data/types';

/** Compact related-news list for profile pages — text-only, no cover image required. */
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
        {items.map((item) => (
          <li key={item.id}>
            <Link
              href={`/news/${item.id}`}
              className="group flex flex-col gap-0.5 border-b border-hairline py-3 last:border-b-0"
            >
              <span className="label-caps text-text-low">
                {item.dateLabel} · {item.sourceName}
              </span>
              <span
                className="font-condensed text-base font-500 leading-tight text-text transition-colors group-hover:text-text-hi"
                style={{ fontFamily: 'var(--font-condensed)' }}
              >
                {item.title}
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
