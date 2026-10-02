import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import {
  getCurrentSeasonCircuitCards,
  getCurrentSeasonRaces,
  nextCircuitIndex,
} from '@/lib/data/circuits';
import { PageShell } from '@/components/layout/BentoGrid';
import { CircuitCardView } from '@/components/circuit/CircuitCardView';
import { NextCircuitHero } from '@/components/circuit/NextCircuitHero';
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
  const nextIndex = nextCircuitIndex(cards);
  const nextRace = nextIndex >= 0 ? races[nextIndex] : null;
  const nextCard = nextIndex >= 0 ? cards[nextIndex] : null;
  const gridCards = nextIndex >= 0 ? cards.filter((_, i) => i !== nextIndex) : cards;

  return (
    <PageShell>
      <header className="mb-6 flex flex-col gap-1 md:mb-8">
        <span className="label-caps text-text-mid">{t('listEyebrow')}</span>
        <h1 className="headline-lg uppercase text-text-hi">{t('listTitle')}</h1>
      </header>

      {nextCard && nextRace ? (
        <NextCircuitHero card={nextCard} race={nextRace} totalRounds={cards.length} />
      ) : null}

      <div className="flex flex-col gap-2 md:hidden">
        {gridCards.map((card) => (
          <CircuitCardView key={card.circuitId} card={card} status={card.done ? 'done' : 'upcoming'} compact />
        ))}
      </div>
      <div className="hidden gap-4 md:grid md:grid-cols-2 md:gap-5 lg:grid-cols-3 lg:gap-6">
        {gridCards.map((card) => (
          <CircuitCardView key={card.circuitId} card={card} status={card.done ? 'done' : 'upcoming'} />
        ))}
      </div>
    </PageShell>
  );
}
