import Link from 'next/link';
import type { NewsItem } from '@/lib/data/types';

interface BentoNewsTileProps {
  news: NewsItem[];
}

export function BentoNewsTile({ news }: BentoNewsTileProps) {
  if (news.length === 0) {
    return (
      <section className="bento-panel col-span-2 p-4 lg:col-span-full lg:p-0 lg:border-0 lg:bg-transparent">
        <p className="text-sm" style={{ color: 'var(--muted)' }}>
          No cached headlines yet.
        </p>
      </section>
    );
  }

  const [featured] = news;
  const desktopItems = news.slice(0, 3);

  return (
    <section className="col-span-2 lg:col-span-full">
      <div className="mb-4 flex items-center gap-4 lg:mb-6">
        <h3
          className="font-display text-xl tracking-[0.04em] lg:text-2xl lg:tracking-[0.12em]"
          style={{ color: 'var(--paper)' }}
        >
          Latest Intel
        </h3>
        <div className="hidden h-px flex-grow lg:block" style={{ backgroundColor: 'var(--border)' }} />
        <Link
          href="/news"
          className="font-condensed text-[10px] uppercase tracking-[0.12em] hover:underline lg:text-[11px]"
          style={{ color: 'var(--accent)' }}
        >
          View all →
        </Link>
      </div>

      {/* Mobile / tablet: stacked articles */}
      <div className="bento-panel flex flex-col gap-4 p-4 lg:hidden">
        {news.slice(0, 2).map((item) => (
          <article
            key={item.id}
            className="border-b pb-4 last:border-0 last:pb-0"
            style={{ borderColor: 'var(--border)' }}
          >
            <div className="mb-1 flex items-center gap-2">
              <span
                className="font-mono text-[8px] px-1 py-0.5"
                style={{ backgroundColor: 'rgba(255,255,255,0.08)' }}
              >
                {item.sourceName.toUpperCase()}
              </span>
              <span className="font-mono text-[8px]" style={{ color: 'var(--muted)' }}>
                {item.dateLabel}
              </span>
            </div>
            <h4
              className="mb-2 font-display text-lg leading-tight tracking-[0.04em]"
              style={{ color: 'var(--paper)' }}
            >
              {item.title}
            </h4>
            <a
              href={item.url}
              target="_blank"
              rel="noopener noreferrer"
              className="font-condensed text-[10px] uppercase tracking-[0.12em]"
              style={{ color: 'var(--accent)' }}
            >
              Read story →
            </a>
          </article>
        ))}
      </div>

      {/* Desktop: 3-card grid */}
      <div className="hidden grid-cols-3 gap-8 lg:grid">
        {desktopItems.map((item) => (
          <article
            key={item.id}
            className="bento-panel group cursor-pointer p-6 transition-colors"
            style={{ borderLeftColor: 'var(--border)' }}
          >
            <span
              className="mb-2 block font-mono text-[10px] uppercase"
              style={{ color: item === featured ? 'var(--accent)' : 'var(--muted)' }}
            >
              {item.sourceName} · {item.dateLabel}
            </span>
            <h4
              className="mb-4 font-display text-xl leading-tight tracking-[0.04em] transition-colors group-hover:text-[var(--accent)]"
              style={{ color: 'var(--paper)' }}
            >
              {item.title}
            </h4>
            <div className="mt-auto flex items-center justify-between">
              <span className="font-condensed text-[10px] uppercase tracking-[0.12em]" style={{ color: 'var(--muted)' }}>
                {item.summary.slice(0, 40)}…
              </span>
              <a
                href={item.url}
                target="_blank"
                rel="noopener noreferrer"
                className="font-condensed border px-2 py-1 text-[10px] uppercase tracking-[0.12em] transition-colors group-hover:border-[var(--accent)] group-hover:bg-[var(--accent)] group-hover:text-white"
                style={{ borderColor: 'var(--border-hover)', color: 'var(--paper)' }}
              >
                Read story
              </a>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
