import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { LegalPage } from '@/components/legal/LegalPage';
import { mailTag } from '@/lib/legal-mail';
import { localizedAlternates } from '@/lib/seo';
import { Link } from '@/i18n/routing';
import { getPublishedStories } from '@/lib/data/stories';
import { formatStoryImageCredit, storyImageCreditSummary } from '@/data/stories/image-credits';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'legal.mediaSources' });
  return {
    title: t('metaTitle'),
    description: t('metaDescription'),
    alternates: localizedAlternates('/media-sources', locale),
  };
}

export default async function MediaSourcesPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: 'legal.mediaSources' });
  const tl = await getTranslations({ locale, namespace: 'legal' });

  // Story photographs: only images with a recorded source are listed publicly;
  // 'unverified' entries are the owner's internal worklist (master-plan 7.1).
  const storyImages = storyImageCreditSummary();
  const storyTitles = new Map<string, string>();
  if (storyImages.bySlug.length > 0) {
    for (const story of await getPublishedStories()) {
      storyTitles.set(story.slug, locale === 'tr' && story.titleTr ? story.titleTr : story.title);
    }
  }

  return (
    <LegalPage
      eyebrow={t('eyebrow')}
      title={t('title')}
      intro={t('intro')}
      updated={t('updated')}
      updatedLabel={tl('updatedLabel')}
      sections={[
        {
          title: t('s1Title'),
          body: (
            <>
              <p>{t('s1p1')}</p>
              <p>{t('s1p2')}</p>
            </>
          ),
        },
        {
          title: t('s2Title'),
          body: <p>{t('s2p1')}</p>,
        },
        {
          title: t('s3Title'),
          body: <p>{t('s3p1')}</p>,
        },
        {
          title: t('storiesTitle'),
          body: (
            <>
              <p>{t('storiesP1')}</p>
              <p className="data-tabular text-text-low">
                {t('storiesCount', { sourced: storyImages.sourced, total: storyImages.total })}
              </p>
              {storyImages.bySlug.length === 0 ? (
                <p>{t('storiesEmpty')}</p>
              ) : (
                <ul aria-label={t('storiesListLabel')} className="space-y-4">
                  {storyImages.bySlug.map(({ slug, images }) => (
                    <li key={slug}>
                      <Link
                        href={`/anthology/${slug}`}
                        className="font-semibold text-text-hi underline-offset-2 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                      >
                        {storyTitles.get(slug) ?? slug}
                      </Link>
                      <ul className="mt-1 space-y-1">
                        {images.map(({ src, credit }) => (
                          <li key={src}>
                            <a
                              href={credit.sourceUrl}
                              target="_blank"
                              rel="noopener noreferrer nofollow"
                              className="underline underline-offset-2 hover:text-text-hi focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                            >
                              {formatStoryImageCredit(credit)}
                            </a>
                          </li>
                        ))}
                      </ul>
                    </li>
                  ))}
                </ul>
              )}
            </>
          ),
        },
        {
          title: t('s4Title'),
          body: <p>{t.rich('s4p1', { mail: mailTag })}</p>,
        },
      ]}
    />
  );
}
