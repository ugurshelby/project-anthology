import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { getLatestNews } from '@/lib/data/news';
import { PageShell } from '@/components/layout/BentoGrid';
import { hasRealImage, sortWireByTime } from '@/lib/news/categories';
import { NewsLeadBlock } from '@/components/news/NewsLeadBlock';
import { NewsEditorialFeed } from '@/components/news/NewsEditorialFeed';
import { SITE_NAME, localizedAlternates } from '@/lib/seo';

interface PageProps {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale } = await params;
  const isTr = locale === 'tr';
  const t = await getTranslations({ locale, namespace: 'ui.news.page' });
  const title = t('title');
  const description = t('metaDescription');

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

// DB-backed (news_stories, filled by the sync-news cron) — no live RSS on the request path. Cached, rebuilt at
// most every 5 minutes and right after each sync-news run (caching design, DECISIONS 2026-10-28).
export const revalidate = 300;

export default async function NewsPage({ params }: PageProps) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: 'ui.news.page' });
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
  const wirePool = sortWireByTime(withoutImages.filter((item) => !usedIds.has(item.id)));

  return (
    <PageShell>
      <header className="mb-6 flex flex-col gap-1 md:mb-8">
        <span className="label-caps text-text-mid font-mono">
          {t('kicker')}
        </span>
        <h1 className="headline-lg uppercase text-text-hi">
          {t('title')}
        </h1>
        <p className="mt-1 max-w-xl body-md text-text-mid">
          {t('intro')}
        </p>
      </header>

      {news.length === 0 ? (
        <div className="rounded-[var(--radius-lg)] border border-hairline bg-surface/30 p-8 text-center">
          <p className="body-md text-text-mid font-mono">
            {t('empty')}
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
