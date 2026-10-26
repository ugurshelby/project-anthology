import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import {
  circuitCounts,
  getCurrentSeasonCircuitCards,
  getCurrentSeasonRaces,
  nextCircuitIndex,
} from '@/lib/data/circuits';
import { PageShell } from '@/components/layout/BentoGrid';
import { NextCircuitHero } from '@/components/circuit/NextCircuitHero';
import { CircuitsDirectory } from '@/components/circuit/CircuitsDirectory';
import { getMediaBatch } from '@/lib/media/read';
import { getCircuitFacts } from '@/data/circuits/facts';
import { localizedAlternates } from '@/lib/seo';

export const revalidate = 900;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'ui.circuit' });
  const TITLE = t('metaTitle');
  const DESCRIPTION = t('metaDescription');
  return {
    title: TITLE,
    description: DESCRIPTION,
    openGraph: {
      title: t('metaOg', { title: TITLE }),
      description: DESCRIPTION,
      url: '/circuits',
      type: 'website',
    },
    twitter: { card: 'summary_large_image', title: t('metaOg', { title: TITLE }), description: DESCRIPTION },
    alternates: localizedAlternates('/circuits', locale),
  };
}

export default async function CircuitsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: 'ui.circuit' });
  const [races, cards] = await Promise.all([getCurrentSeasonRaces(), getCurrentSeasonCircuitCards()]);

  // Batch query venue photography for all circuits in current season
  const circuitIds = cards.map((c) => c.circuitId);
  const mediaMap = await getMediaBatch('circuit', circuitIds);
  const mediaRecord = Object.fromEntries(mediaMap.entries());

  // Attach facts to each card for telemetry display
  const cardsWithFacts = cards.map((c) => ({
    ...c,
    facts: getCircuitFacts(c.circuitId, locale),
  }));

  const nextIndex = nextCircuitIndex(cards);
  const nextRace = nextIndex >= 0 ? races[nextIndex] : null;
  const nextCard = nextIndex >= 0 ? cardsWithFacts[nextIndex] : null;
  const gridCards = nextIndex >= 0 ? cardsWithFacts.filter((_, i) => i !== nextIndex) : cardsWithFacts;

  return (
    <PageShell>
      <header className="mb-6 flex flex-col gap-2 md:mb-8">
        <span className="label-caps text-text-mid">{t('listEyebrow')}</span>
        <h1 className="headline-lg uppercase text-text-hi">{t('listTitle')}</h1>
        <p className="max-w-2xl text-sm text-text-mid font-sans leading-relaxed">
          {t('listSubtitle')}
        </p>
      </header>

      {nextCard && nextRace ? (
        <NextCircuitHero
          card={nextCard}
          race={nextRace}
          totalRounds={cards.length}
          media={mediaRecord[nextCard.circuitId]}
        />
      ) : null}

      <CircuitsDirectory
        cards={gridCards}
        mediaRecord={mediaRecord}
        counts={circuitCounts(cards)}
      />
    </PageShell>
  );
}
