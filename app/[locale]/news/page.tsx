import type { Metadata } from 'next';
import { getLatestNews } from '@/lib/data/news';
import { PageShell } from '@/components/layout/BentoGrid';
import { hasRealImage } from '@/lib/news/categories';
import { NewsLeadBlock } from '@/components/news/NewsLeadBlock';
import { NewsEditorialFeed } from '@/components/news/NewsEditorialFeed';
import { localizedAlternates } from '@/lib/seo';

const TITLE = 'News';
const DESCRIPTION =
  'Curated Formula 1 headlines aggregated from across the paddock — featured stories, race recaps, tech upgrades, and the 24H wire.';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  return {
    title: TITLE,
    description: DESCRIPTION,
    openGraph: {
      title: `${TITLE} — F1 Headlines`,
      description: DESCRIPTION,
      url: '/news',
      type: 'website',
    },
    twitter: { card: 'summary_large_image', title: `${TITLE} — F1 Headlines`, description: DESCRIPTION },
    alternates: localizedAlternates('/news', locale),
  };
}

// DB-backed (news_stories, filled by the sync-news cron) — no live RSS on the request path.
export const revalidate = 300;

export default async function NewsPage() {
  const news = await getLatestNews(80, { includeImageless: true });
  const withImages = news.filter(hasRealImage);
  const withoutImages = news.filter((item) => !hasRealImage(item));

  const lead = withImages[0] ?? news[0] ?? null;
  const secondary = withImages.slice(1, 3);
  const usedIds = new Set([lead?.id, ...secondary.map((s) => s.id)].filter(Boolean) as string[]);

  // Remaining imaged stories → editorial cards; leftover imageless → wire.
  // Also fold short agency-style pieces (no image) into the wire exclusively.
  const cardPool = withImages.filter((item) => !usedIds.has(item.id));
  const wirePool = withoutImages.filter((item) => !usedIds.has(item.id));

  return (
    <PageShell>
      <header className="mb-6 flex flex-col gap-1 md:mb-8">
        <span className="label-caps text-text-mid">The Wire</span>
        <h1 className="headline-lg uppercase text-text-hi">News</h1>
        <p className="mt-1 max-w-xl body-md text-text-mid">
          Featured paddock dispatches, race weekends, and a live telemetry feed of everything else.
        </p>
      </header>

      {news.length === 0 ? (
        <p className="body-md text-center text-text-mid">
          No headlines available right now. Check back soon.
        </p>
      ) : (
        <>
          {lead ? <NewsLeadBlock lead={lead} secondary={secondary} /> : null}
          <NewsEditorialFeed cards={cardPool} wire={wirePool} />
        </>
      )}
    </PageShell>
  );
}
