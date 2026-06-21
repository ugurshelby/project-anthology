import type { Metadata } from 'next';
import { aggregate } from '@/lib/news/aggregate';
import { PageShell } from '@/components/layout/BentoGrid';
import { NewsHero, WireItem } from '@/components/news/NewsList';
import { hasRealImage } from '@/lib/data/news';

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

// Pull live RSS on every request (aggregate() has its own 15-min in-memory cache).
export const revalidate = 0;

export default async function NewsPage() {
  const news = await aggregate({ maxItems: 100 });
  const featured = news.find((n) => hasRealImage(n)) ?? news[0];
  const rest = news.filter((n) => n.id !== featured?.id);

  return (
    <PageShell>
      <header className="mb-8 flex flex-col gap-1">
        <span className="label-caps text-text-mid">The Wire</span>
        <h1 className="headline-lg uppercase text-text-hi">News</h1>
      </header>

      {featured ? <NewsHero item={featured} /> : null}

      <div className="mt-8 grid grid-cols-1 gap-x-10 md:grid-cols-2">
        {rest.map((item) => (
          <WireItem key={item.id} item={item} />
        ))}
      </div>
    </PageShell>
  );
}
