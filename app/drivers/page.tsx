import type { Metadata } from 'next';
import { getDriversByTeam } from '@/lib/data/entities';

export const dynamic = 'force-dynamic';

const DESCRIPTION = 'Current Formula 1 drivers — championship standings, teams, and points.';

export const metadata: Metadata = {
  title: 'Drivers',
  description: DESCRIPTION,
  alternates: { canonical: '/drivers' },
  openGraph: { title: 'Drivers — Apex', description: DESCRIPTION, url: '/drivers', type: 'website' },
  twitter: { card: 'summary_large_image', title: 'Drivers — Apex', description: DESCRIPTION },
};

export default async function DriversGridPage() {
  const { season, groups, flat } = await getDriversByTeam();
  void { season, groups, flat };

  return <main id="main-content">Drivers</main>;
}
