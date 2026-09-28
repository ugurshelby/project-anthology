import type { Metadata } from 'next';
import { setRequestLocale } from 'next-intl/server';
import { getPublishedRadioMoments } from '@/lib/data/radio';
import { getPublishedStories } from '@/lib/data/stories';
import { localizedAlternates } from '@/lib/seo';
import { PageShell, BentoGrid } from '@/components/layout/BentoGrid';
import { StoryCard } from '@/components/anthology/StoryCard';
import { RadioMomentCard } from '@/components/anthology/RadioMomentCard';

export const revalidate = 900;

interface PageProps {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale } = await params;
  const isTr = locale === 'tr';
  const title = isTr ? 'Antoloji — F1 Hikâyeleri & Telsiz' : 'Anthology — F1 Stories & Radio';
  const description = isTr
    ? 'Formula 1 tarihinden efsaneler, rekabetler, trajediler, mucizeler ve ikonik takım telsizleri antolojisi.'
    : 'An anthology of Formula 1 stories and iconic team radio moments — legends, rivalries, tragedies and miracles.';
  const urlPath = isTr ? '/tr/anthology' : '/anthology';

  return {
    title: isTr ? 'Antoloji' : 'Anthology',
    description,
    alternates: localizedAlternates('/anthology', locale),
    openGraph: {
      title,
      description,
      url: urlPath,
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
    },
  };
}

export default async function AnthologyPage({ params }: PageProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  const [stories, moments] = await Promise.all([
    getPublishedStories(),
    getPublishedRadioMoments(40),
  ]);

  const [lead, ...rest] = stories;
  const isTr = locale === 'tr';

  return (
    <PageShell>
      <header className="mb-8 flex flex-col gap-1">
        <span className="label-caps text-text-mid">
          {isTr ? 'Antoloji' : 'The Anthology'}
        </span>
        <h1 className="headline-lg uppercase text-text-hi">
          {isTr ? 'Hikâyeler ve Telsiz' : 'Stories & Radio'}
        </h1>
      </header>

      <BentoGrid>
        {stories.length === 0 ? (
          <div className="col-span-4 md:col-span-8 lg:col-span-12">
            <p className="body-md text-center text-text-mid">
              {isTr
                ? 'Henüz yayınlanmış bir hikâye bulunmuyor. Yakında tekrar kontrol edin.'
                : 'No stories published yet. Check back soon.'}
            </p>
          </div>
        ) : (
          <>
            {lead ? (
              <div className="col-span-4 md:col-span-8 lg:col-span-8">
                <StoryCard story={lead} wide />
              </div>
            ) : null}
            {rest.slice(0, 1).map((s) => (
              <div key={s.slug} className="col-span-4 md:col-span-8 lg:col-span-4">
                <StoryCard story={s} />
              </div>
            ))}
            {rest.slice(1, 3).map((s) => (
              <div key={s.slug} className="col-span-4 md:col-span-4 lg:col-span-6">
                <StoryCard story={s} />
              </div>
            ))}
            {moments.slice(0, 4).map((m) => (
              <div key={m.id} className="col-span-2 md:col-span-4 lg:col-span-3">
                <RadioMomentCard moment={m} />
              </div>
            ))}
            {rest.slice(3).map((s) => (
              <div key={s.slug} className="col-span-4 md:col-span-4 lg:col-span-4">
                <StoryCard story={s} />
              </div>
            ))}
            {moments.slice(4).map((m) => (
              <div key={m.id} className="col-span-2 md:col-span-4 lg:col-span-3">
                <RadioMomentCard moment={m} />
              </div>
            ))}
          </>
        )}
      </BentoGrid>
    </PageShell>
  );
}
