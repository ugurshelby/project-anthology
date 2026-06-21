import type { Metadata } from 'next';
import { getCurrentTeams } from '@/lib/data/entities';
import { PageShell, BentoGrid } from '@/components/layout/BentoGrid';
import { TeamCard } from '@/components/standings/GridCards';

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
  const { season, rows } = await getCurrentTeams();

  return (
    <PageShell>
      <header className="mb-8 flex flex-col gap-1">
        <span className="label-caps text-text-mid">{season} Championship</span>
        <h1 className="headline-lg uppercase text-text-hi">Constructors</h1>
      </header>
      <BentoGrid>
        {rows.map((row) => (
          <TeamCard key={row.constructorId} row={row} />
        ))}
      </BentoGrid>
    </PageShell>
  );
}
