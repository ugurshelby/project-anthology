import type { Metadata } from 'next';
import { getSeasonData } from '@/lib/data/f1';
import { CURRENT_SEASON } from '@/lib/f1Calendar';

export const revalidate = 0;
export const dynamic = 'force-dynamic';

const TITLE = 'Season';
const DESCRIPTION = `Formula 1 ${CURRENT_SEASON} season: driver and constructor standings, race calendar, and race recaps.`;

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  openGraph: {
    title: `${TITLE} — F1 ${CURRENT_SEASON}`,
    description: DESCRIPTION,
    url: '/season',
    type: 'website',
  },
  twitter: { card: 'summary_large_image', title: `${TITLE} — F1 ${CURRENT_SEASON}`, description: DESCRIPTION },
  alternates: { canonical: '/season' },
};

export default async function SeasonPage() {
  const seasonData = await getSeasonData(CURRENT_SEASON);
  void seasonData;

  return <main id="main-content">Season</main>;
}
