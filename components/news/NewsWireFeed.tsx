'use client';

import { Link } from '@/i18n/routing';
import { useLocale } from 'next-intl';
import type { NewsItem } from '@/lib/data/types';
import { localizedNewsTitle } from '@/lib/news/i18n';
import { detectTeamTag, formatWireTime } from '@/lib/news/categories';

/**
 * Brutalist / telemetry wire — imageless or agency briefs as single-line
 * dispatch rows instead of empty photo cards.
 */
export function NewsWireFeed({
  items,
  heading,
}: {
  items: NewsItem[];
  heading?: string;
}) {
  const locale = useLocale();
  if (items.length === 0) return null;

  const defaultHeading = locale === 'tr' ? 'Telgraf // 24S Telemetri Akışı' : 'The Wire // 24H Dispatch';
  const displayHeading = heading ?? defaultHeading;

  return (
    <section className="mt-10 border border-hairline bg-surface/40 rounded-[var(--radius-lg)] overflow-hidden">
      <details className="group" open>
        <summary className="flex min-h-12 cursor-pointer list-none items-center justify-between border-b border-hairline px-4 py-3 marker:content-none [&::-webkit-details-marker]:hidden md:px-5 transition-colors hover:bg-white/[0.02]">
          <h2 className="label-caps text-text-mid font-mono">{displayHeading}</h2>
          <span className="data-tabular text-[13px] text-text-low font-mono">
            {items.length} {locale === 'tr' ? 'bülten' : 'items'}
          </span>
        </summary>
        <ul className="divide-y divide-hairline">
          {items.map((item) => {
            const title = localizedNewsTitle(item, locale);
            const team = detectTeamTag(item.title, item.summary);
            return (
              <li key={item.id}>
                <Link
                  href={`/news/${item.id}`}
                  className="group flex flex-col gap-1.5 px-4 py-3.5 transition-colors hover:bg-white/[0.03] md:flex-row md:items-baseline md:gap-3 md:px-5"
                >
                  <span className="data-tabular shrink-0 text-[12px] text-text-low font-mono">
                    [{formatWireTime(item.publishedTs)}]
                  </span>
                  <span className="data-tabular shrink-0 text-[12px] text-accent/90 font-mono font-medium">
                    [{team ?? item.sourceName.toUpperCase().slice(0, 12)}]
                  </span>
                  <span className="min-w-0 flex-1 text-sm leading-snug text-text-hi group-hover:text-white break-words">
                    &ldquo;{title}&rdquo;
                  </span>
                  <span className="data-tabular shrink-0 text-[12px] text-text-low font-mono">
                    {locale === 'tr' ? 'Kaynak' : 'Source'}: {item.sourceName}
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      </details>
    </section>
  );
}
