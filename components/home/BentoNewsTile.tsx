import Link from 'next/link';
import { SafeImage } from '@/components/ui/SafeImage';
import type { NewsItem } from '@/lib/data/types';

interface BentoNewsTileProps {
  news: NewsItem[];
}

function newsHref(id: string): string {
  return `/news#${encodeURIComponent(id)}`;
}

function NewsCard({ item }: { item: NewsItem }) {
  return (
    <Link
      href={newsHref(item.id)}
      className="bento-panel group relative flex min-h-[140px] flex-col justify-end overflow-hidden p-4 transition-colors lg:min-h-[200px] lg:p-6"
    >
      {item.image ? (
        <SafeImage
          src={item.image}
          alt=""
          fill
          className="object-cover opacity-25 transition-opacity duration-300 group-hover:opacity-35"
          sizes="(max-width: 1024px) 100vw, 33vw"
        />
      ) : null}
      <div
        className="absolute inset-0"
        style={{
          background:
            'linear-gradient(180deg, rgba(10,10,10,0.55) 0%, rgba(10,10,10,0.82) 55%, rgba(10,10,10,0.95) 100%)',
        }}
      />
      <div className="relative z-10">
        <span
          className="mb-2 block font-mono text-[8px] uppercase lg:text-[10px]"
          style={{ color: 'var(--muted)' }}
        >
          {item.sourceName} · {item.dateLabel}
        </span>
        <h4
          className="line-clamp-2 font-display text-base leading-tight tracking-[0.04em] transition-colors group-hover:text-[var(--paper)] lg:text-xl"
          style={{ color: 'var(--paper)' }}
        >
          {item.title}
        </h4>
        <p
          className="mt-2 line-clamp-2 hidden text-xs font-light lg:block"
          style={{ color: 'var(--muted)' }}
        >
          {item.summary}
        </p>
        <span
          className="mt-3 inline-block font-condensed text-[10px] uppercase tracking-[0.12em]"
          style={{ color: 'var(--muted)' }}
        >
          Read on news →
        </span>
      </div>
    </Link>
  );
}

export function BentoNewsTile({ news }: BentoNewsTileProps) {
  if (news.length === 0) {
    return (
      <section className="col-span-2 lg:col-span-full">
        <p className="text-sm" style={{ color: 'var(--muted)' }}>
          No cached headlines yet.
        </p>
      </section>
    );
  }

  const desktopItems = news.slice(0, 3);

  return (
    <section className="col-span-2 lg:col-span-full">
      <div className="mb-4 flex items-end gap-4 lg:mb-6">
        <div className="shrink-0">
          <h3
            className="font-display text-xl tracking-[0.04em] lg:text-2xl"
            style={{ color: 'var(--paper)' }}
          >
            Latest Intel
          </h3>
          <div className="section-divider-bar mt-2" />
        </div>
        <div className="hidden h-px flex-grow lg:block" style={{ backgroundColor: 'var(--border)' }} />
        <Link
          href="/news"
          className="font-condensed text-[10px] uppercase tracking-[0.12em] hover:underline lg:text-[11px]"
          style={{ color: 'var(--muted)' }}
        >
          View all →
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {desktopItems.map((item) => (
          <NewsCard key={item.id} item={item} />
        ))}
      </div>
    </section>
  );
}
