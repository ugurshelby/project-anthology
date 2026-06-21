import type { Metadata } from 'next';
import { getCurrentSeasonCircuitCards } from '@/lib/data/circuits';
import { CURRENT_SEASON } from '@/lib/f1Calendar';

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
  void { cards, CURRENT_SEASON };

  return <main id="main-content">Circuits</main>;
}
