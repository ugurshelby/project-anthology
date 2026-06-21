import type { Metadata } from 'next';
import { getCurrentTeams } from '@/lib/data/entities';

export const dynamic = 'force-dynamic';

const DESCRIPTION = 'Current Formula 1 constructors — championship standings, points, and driver lineups.';

export const metadata: Metadata = {
  title: 'Constructors',
  description: DESCRIPTION,
  alternates: { canonical: '/teams' },
  openGraph: { title: 'Constructors — Apex', description: DESCRIPTION, url: '/teams', type: 'website' },
  twitter: { card: 'summary_large_image', title: 'Constructors — Apex', description: DESCRIPTION },
};

export default async function TeamsGridPage() {
  const { season, rows, data } = await getCurrentTeams();
  void { season, rows, data };

  return <main id="main-content">Constructors</main>;
}
