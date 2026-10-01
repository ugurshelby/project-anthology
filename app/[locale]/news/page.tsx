import type { Metadata } from 'next';
import { getLatestNews } from '@/lib/data/news';
import { PageShell } from '@/components/layout/BentoGrid';
import { hasRealImage } from '@/lib/news/categories';
import { NewsLeadBlock } from '@/components/news/NewsLeadBlock';
import { NewsEditorialFeed } from '@/components/news/NewsEditorialFeed';
import { SITE_NAME, localizedAlternates } from '@/lib/seo';

interface PageProps {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale } = await params;
  const isTr = locale === 'tr';
  const title = isTr ? 'Haberler' : 'News';
  const description = isTr
    ? 'Padoktan derlenen Formula 1 manşetleri — öne çıkan hikâyeler, yarış analizleri, teknik güncellemeler ve 24 saatlik telemetri telgrafı.'
    : 'Curated Formula 1 headlines aggregated from across the paddock — featured stories, race recaps, tech upgrades, and the 24H wire.';

  return {
    title,
    description,
    openGraph: {
      title: `${title} — ${SITE_NAME}`,
      description,
      url: isTr ? '/tr/news' : '/news',
      type: 'website',
    },
    twitter: { card: 'summary_large_image', title: `${title} — ${SITE_NAME}`, description },
    alternates: localizedAlternates('/news', locale),
  };
}

// DB-backed (news_stories, filled by the sync-news cron) — no live RSS on the request path.
export const revalidate = 300;

export default async function NewsPage({ params }: PageProps) {
  const { locale } = await params;
  const isTr = locale === 'tr';
  const news = await getLatestNews(80, { includeImageless: true });

  const withImages = news.filter(hasRealImage);
  const withoutImages = news.filter((item) => !hasRealImage(item));

  // Lead: prioritize most recent imaged story, fallback to newest headline
  const lead = withImages[0] ?? news[0] ?? null;
  const secondary = withImages.slice(1, 3);
  if (secondary.length < 2) {
    const remainingForSide = news.filter(
      (n) => n.id !== lead?.id && !secondary.some((s) => s.id === n.id),
    );
    secondary.push(...remainingForSide.slice(0, 2 - secondary.length));
  }

  const usedIds = new Set([lead?.id, ...secondary.map((s) => s.id)].filter(Boolean) as string[]);
  const remaining = news.filter((item) => !usedIds.has(item.id));

  // Balanced editorial pool: remaining stories for the filterable card grid
  const cardPool = remaining;
  // Wire telemetry pool: specifically imageless briefs
  const wirePool = withoutImages.filter((item) => !usedIds.has(item.id));

  return (
    <PageShell>
      <header className="mb-6 flex flex-col gap-1 md:mb-8">
        <span className="label-caps text-text-mid font-mono">
          {isTr ? 'Padok Telgrafı' : 'The Wire'}
        </span>
        <h1 className="headline-lg uppercase text-text-hi">
          {isTr ? 'Haberler' : 'News'}
        </h1>
        <p className="mt-1 max-w-xl body-md text-text-mid">
          {isTr
            ? 'Padoktan derlenen son gelişmeler, yarış analizleri ve 24 saatlik telemetri telgraf akışı.'
            : 'Featured paddock dispatches, race weekends, and a live telemetry feed of everything else.'}
        </p>
      </header>

      {news.length === 0 ? (
        <div className="rounded-[var(--radius-lg)] border border-hairline bg-surface/30 p-8 text-center">
          <p className="body-md text-text-mid font-mono">
            {isTr
              ? 'Şu anda gösterilecek haber bulunmuyor. Padok hattı saat başı güncellenmektedir.'
              : 'No headlines available right now. Check back soon.'}
          </p>
        </div>
      ) : (
        <>
          {lead ? <NewsLeadBlock lead={lead} secondary={secondary} /> : null}
          <NewsEditorialFeed cards={cardPool} wire={wirePool} />
        </>
      )}
    </PageShell>
  );
}
