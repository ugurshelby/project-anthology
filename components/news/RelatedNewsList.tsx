import { Link } from '@/i18n/routing';
import { useLocale } from 'next-intl';
import { ApexImage } from '@/components/media/ApexImage';
import type { NewsItem } from '@/lib/data/types';
import { localizedNewsTitle } from '@/lib/news/i18n';
import { hasRealImage } from '@/lib/news/categories';
import { formatDispatchAge } from '@/lib/news/time';

/** Compact related-news feed — 64px thumb + title + relative dispatch time. Zero placeholder images. */
export function RelatedNewsList({
  items,
  heading,
}: {
  items: NewsItem[];
  heading?: string;
}) {
  const locale = useLocale();
  if (items.length === 0) return null;

  const defaultHeading = locale === 'tr' ? 'İlgili Telgraf Akışı' : 'In The Wire';
  const displayHeading = heading ?? defaultHeading;

  return (
    <div className="flex flex-col gap-2">
      <span className="label-caps text-text-mid font-mono">{displayHeading}</span>
      <ul className="flex flex-col">
        {items.map((item) => {
          const age = formatDispatchAge(item.publishedTs);
          const hasImage = hasRealImage(item);
          const title = localizedNewsTitle(item, locale);
          return (
            <li key={item.id}>
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
                  <span className="data-tabular text-xs uppercase tracking-wider text-text-mid font-mono">
                    {age || item.dateLabel} · {item.sourceName}
                  </span>
                  <span
                    className="mt-0.5 line-clamp-2 block font-condensed text-base font-700 leading-tight text-text-hi group-hover:text-white break-words"
                    style={{ fontFamily: 'var(--font-condensed)' }}
                  >
                    {title}
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
