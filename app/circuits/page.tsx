import type { Metadata } from 'next';
import {
  getCurrentSeasonCircuitCards,
  getCurrentSeasonRaces,
  nextCircuitIndex,
} from '@/lib/data/circuits';
import { PageShell } from '@/components/layout/BentoGrid';
import { CircuitCardView } from '@/components/circuit/CircuitCardView';
import { NextCircuitHero } from '@/components/circuit/NextCircuitHero';

export const revalidate = 900;

const TITLE = 'Circuits';
const DESCRIPTION =
  'Track maps of the Formula 1 calendar — every circuit rendered as a clean vector layout.';

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  openGraph: {
    title: `${TITLE} — F1 Track Maps`,
    description: DESCRIPTION,
    url: '/circuits',
    type: 'website',
  },
  twitter: { card: 'summary_large_image', title: `${TITLE} — F1 Track Maps`, description: DESCRIPTION },
  alternates: { canonical: '/circuits' },
};

export default async function CircuitsPage() {
  const [races, cards] = await Promise.all([getCurrentSeasonRaces(), getCurrentSeasonCircuitCards()]);
  const nextIndex = nextCircuitIndex(cards);
  const nextRace = nextIndex >= 0 ? races[nextIndex] : null;
  const nextCard = nextIndex >= 0 ? cards[nextIndex] : null;
  const gridCards = nextIndex >= 0 ? cards.filter((_, i) => i !== nextIndex) : cards;

  return (
    <PageShell>
      <header className="mb-6 flex flex-col gap-1 md:mb-8">
        <span className="label-caps text-text-mid">Track Maps</span>
        <h1 className="headline-lg uppercase text-text-hi">Circuits</h1>
      </header>

      {nextCard && nextRace ? (
        <NextCircuitHero card={nextCard} race={nextRace} totalRounds={cards.length} />
      ) : null}

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-5 lg:grid-cols-3 lg:gap-6">
        {gridCards.map((card) => (
          <CircuitCardView key={card.circuitId} card={card} status={card.done ? 'done' : 'upcoming'} />
        ))}
      </div>
    </PageShell>
  );
}
