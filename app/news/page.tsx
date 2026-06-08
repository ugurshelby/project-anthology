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
        <SectionDivider title="Latest" />
        {rest.length === 0 ? (
          <p className="text-sm text-muted" style={{ color: 'var(--muted)' }}>
            News cache empty — sync-news cron will populate headlines.
          </p>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {rest.map((item) => (
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
                    className="font-mono text-[9px] uppercase tracking-wider text-muted"
                    style={{ color: 'var(--muted)' }}
                  >
                    {item.dateLabel} · {item.sourceName}
                  </p>
                  <p className="mt-2 line-clamp-3 text-xs font-light text-muted" style={{ color: 'var(--muted)' }}>
                    {item.summary}
                  </p>
                  <a
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-3 inline-block font-condensed text-[10px] uppercase tracking-[0.12em]"
                    style={{ color: 'var(--accent)' }}
                  >
                    Read story →
                  </a>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
