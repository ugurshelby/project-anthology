import Link from 'next/link';
import Image from 'next/image';
import type { NewsItem } from '@/lib/data/types';
import { detectTeamTag, formatWireTime, hasRealImage } from '@/lib/news/categories';

export function HomeWireFeed({ items }: { items: NewsItem[] }) {
  const feed = items.slice(0, 6);

  return (
    <div className="flex h-full flex-col">
      <div className="mb-3 flex items-baseline justify-between gap-2">
        <h2 className="label-caps text-text-mid">The Wire</h2>
        <Link href="/news" className="label-caps text-accent">
          All →
        </Link>
      </div>
      {feed.length === 0 ? (
        <p className="body-md text-text-mid">No dispatches right now.</p>
      ) : (
        <ul className="flex flex-col">
          {feed.map((item) => {
            const team = detectTeamTag(item.title, item.summary);
            const thumb = hasRealImage(item);
            return (
              <li key={item.id}>
                <Link
                  href={`/news/${item.id}`}
                  className="group flex items-start gap-2.5 border-b border-hairline py-2.5 last:border-b-0"
                >
                  {thumb ? (
                    <div className="relative hidden h-12 w-12 shrink-0 overflow-hidden rounded-[var(--radius-chip)] bg-surface md:block">
                      <Image
                        src={item.image}
                        alt=""
                        fill
                        sizes="48px"
                        loading="lazy"
                        className="object-cover"
                      />
                    </div>
                  ) : null}
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 font-mono text-[10px] uppercase tracking-wider text-zinc-500">
                      <span>[{formatWireTime(item.publishedTs)}]</span>
                      <span className="text-accent/80">[{team ?? item.sourceName.toUpperCase().slice(0, 10)}]</span>
                    </div>
                    <span className="mt-0.5 line-clamp-2 block text-sm leading-snug text-text-hi group-hover:text-white">
                      {item.title}
                    </span>
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
