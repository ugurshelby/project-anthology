import type { Metadata } from 'next';
import {
  getCurrentSeasonCircuitCards,
  nextCircuitIndex,
  circuitGridSpan,
  isFeaturedCircuitCard,
} from '@/lib/data/circuits';
import { PageShell, BentoGrid } from '@/components/layout/BentoGrid';
import { CircuitCardView } from '@/components/circuit/CircuitCardView';
import { ScrollToNextCircuit } from '@/components/circuit/ScrollToNextCircuit';

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
  const cards = await getCurrentSeasonCircuitCards();
  const featuredIndex = nextCircuitIndex(cards);

  return (
    <PageShell>
      <ScrollToNextCircuit />
      <header className="mb-8 flex flex-col gap-1">
        <span className="label-caps text-text-mid">Track Maps</span>
        <h1 className="headline-lg uppercase text-text-hi">Circuits</h1>
      </header>
      <BentoGrid>
        {cards.map((card, i) => (
          <CircuitCardView
            key={card.circuitId}
            card={card}
            featured={isFeaturedCircuitCard(i, featuredIndex)}
            span={circuitGridSpan(i, featuredIndex)}
          />
        ))}
      </BentoGrid>
    </PageShell>
  );
}
