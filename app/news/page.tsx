import type { Metadata } from 'next';
import { AtmosphericHero } from '@/components/ui/AtmosphericHero';
import { NewsFeaturedHero } from '@/components/ui/NewsFeaturedHero';
import { SafeImage } from '@/components/ui/SafeImage';
import { SectionDivider } from '@/components/ui/SectionDivider';
import { hasRealImage } from '@/lib/data/news';
import { aggregate } from '@/lib/news/aggregate';

const TITLE = 'News';
const DESCRIPTION =
  'Curated Formula 1 headlines aggregated from across the paddock, deduplicated and updated continuously.';

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  openGraph: {
    title: `${TITLE} — F1 Headlines`,
    description: DESCRIPTION,
    url: '/news',
    type: 'website',
  },
  twitter: { card: 'summary_large_image', title: `${TITLE} — F1 Headlines`, description: DESCRIPTION },
  alternates: { canonical: '/news' },
};

// Pull live RSS on every request (aggregate() has its own 15-min in-memory
// cache, so this won't flood the sources). A static prerender would otherwise
// freeze headlines at build time.
export const revalidate = 0;

export default async function NewsPage() {
  const news = await aggregate({ maxItems: 100 });
  // Featured = newest item with a real (non-placeholder) image; rest = the grid.
  const featured = news.find(hasRealImage) ?? news[0] ?? null;
  const rest = featured ? news.filter((item) => item.id !== featured.id) : news;

  // Tiered hierarchy so the page reads as edited, not as an undifferentiated
  // wall: the items that actually have an image become the visual grid (max 6),
  // everything else drops to a compact headline-only list. No card ever renders
  // the "ASSET" placeholder — a missing image means a text row, not a grey box.
  const withImage = rest.filter(hasRealImage).slice(0, 6);
  const featuredGridIds = new Set(withImage.map((item) => item.id));
  const compact = rest.filter((item) => !featuredGridIds.has(item.id));

  return (
    <>
      {featured ? (
        <div id={featured.id} className="scroll-mt-20">
          <NewsFeaturedHero item={featured} />
        </div>
      ) : (
        <AtmosphericHero>
          <p
            className="font-condensed text-[11px] uppercase tracking-[0.2em]"
            style={{ color: 'var(--muted)' }}
          >
            Headlines
          </p>
          <h1
            className="mt-2 font-display text-[clamp(5rem,16vw,12rem)] leading-[0.88] tracking-[0.04em]"
            style={{ color: 'var(--paper)' }}
          >
            NEWS
          </h1>
        </AtmosphericHero>
      )}

      <div className="content-wrap">
        {rest.length === 0 ? (
          <>
            <SectionDivider title="Latest" />
            <p className="text-sm" style={{ color: 'var(--muted)' }}>
              No headlines yet. The news sync runs continuously — check back shortly.
            </p>
          </>
        ) : (
          <>
            {withImage.length > 0 ? (
              <section className="mb-12">
                <SectionDivider title="Latest" />
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {withImage.map((item) => (
                    <article
                      key={item.id}
                      id={item.id}
                      className="news-article-anchor anthology-card overflow-hidden scroll-mt-20"
                    >
                      <div className="relative aspect-video bg-card">
                        <SafeImage
                          src={item.image}
                          alt=""
                          fill
                          className="object-cover"
                          sizes="(max-width: 768px) 100vw, 33vw"
                        />
                        <div
                          className="absolute inset-0"
                          style={{
                            background:
                              'linear-gradient(180deg, transparent 30%, rgba(0,0,0,0.85) 100%)',
                          }}
                        />
                        <h2
                          className="absolute bottom-3 left-3 right-3 line-clamp-3 font-display text-[1.3rem] leading-tight tracking-[0.04em]"
                          style={{ color: 'var(--paper)' }}
                        >
                          {item.title}
                        </h2>
                      </div>
                      <div className="p-4">
                        <p
                          className="font-mono text-[9px] uppercase tracking-wider"
                          style={{ color: 'var(--paper)' }}
                        >
                          {item.dateLabel} · {item.sourceName}
                        </p>
                        <p className="mt-2 line-clamp-3 text-xs font-light" style={{ color: 'var(--muted)' }}>
                          {item.summary}
                        </p>
                        <a
                          href={item.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="mt-3 inline-block font-condensed text-[10px] uppercase tracking-[0.12em]"
                          style={{ color: 'var(--paper)' }}
                        >
                          Read story →
                        </a>
                      </div>
                    </article>
                  ))}
                </div>
              </section>
            ) : null}

            {compact.length > 0 ? (
              <section>
                <SectionDivider title="More Headlines" />
                <ul className="divide-y divide-border border-y border-border">
                  {compact.map((item) => (
                    <li key={item.id} id={item.id} className="news-article-anchor scroll-mt-20">
                      <a
                        href={item.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group flex items-baseline gap-4 px-1 py-3 transition-colors hover:bg-[rgba(255,255,255,0.03)]"
                      >
                        <span
                          className="hidden shrink-0 font-mono text-[10px] uppercase tracking-wider sm:block sm:w-28"
                          style={{ color: 'var(--paper)' }}
                        >
                          {item.dateLabel}
                        </span>
                        <span
                          className="min-w-0 flex-1 truncate font-condensed text-[15px] uppercase tracking-[0.03em]"
                          style={{ color: 'var(--paper)' }}
                        >
                          {item.title}
                        </span>
                        <span
                          className="hidden shrink-0 font-mono text-[10px] uppercase tracking-wider md:block"
                          style={{ color: 'var(--muted)' }}
                        >
                          {item.sourceName}
                        </span>
                      </a>
                    </li>
                  ))}
                </ul>
              </section>
            ) : null}
          </>
        )}
      </div>
    </>
  );
}
