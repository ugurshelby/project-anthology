import type { Metadata } from 'next';
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

// Pull live RSS on every request (aggregate() has its own 15-min in-memory cache).
export const revalidate = 0;

export default async function NewsPage() {
  const news = await aggregate({ maxItems: 100 });
  void news;

  return <main id="main-content">News</main>;
}
