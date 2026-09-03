import Link from 'next/link';
import type { NewsItem } from '@/lib/data/types';
import { detectTeamTag, formatWireTime } from '@/lib/news/categories';

/**
 * Brutalist / telemetry wire — imageless or agency briefs as single-line
 * dispatch rows instead of empty photo cards.
 */
export function NewsWireFeed({
  items,
  heading = 'The Wire // 24H Dispatch',
}: {
  items: NewsItem[];
  heading?: string;
}) {
  if (items.length === 0) return null;

  return (
    <section className="mt-10 border border-hairline bg-surface/40">
      <div className="flex items-center justify-between border-b border-hairline px-4 py-3 md:px-5">
        <h2 className="label-caps text-text-mid">{heading}</h2>
        <span className="data-tabular text-[10px] text-zinc-500">{items.length} items</span>
      </div>
      <ul className="divide-y divide-hairline">
        {items.map((item) => {
          const team = detectTeamTag(item.title, item.summary);
          return (
            <li key={item.id}>
              <Link
                href={`/news/${item.id}`}
                className="group flex flex-col gap-1 px-4 py-3 transition-colors hover:bg-white/[0.03] md:flex-row md:items-baseline md:gap-3 md:px-5"
              >
                <span className="data-tabular shrink-0 text-xs text-zinc-500">
                  [{formatWireTime(item.publishedTs)}]
                </span>
                <span className="data-tabular shrink-0 text-xs text-accent/80">
                  [{team ?? item.sourceName.toUpperCase().slice(0, 12)}]
                </span>
                <span className="min-w-0 flex-1 text-sm leading-snug text-text-hi group-hover:text-white">
                  &ldquo;{item.title}&rdquo;
                </span>
                <span className="data-tabular shrink-0 text-xs text-zinc-500">
                  Source: {item.sourceName}
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
