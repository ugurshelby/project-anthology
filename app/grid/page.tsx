import type { Metadata } from 'next';
import { getDriversByTeam, getCurrentTeams } from '@/lib/data/entities';
import { PageShell } from '@/components/layout/BentoGrid';
import { DriverCard, TeamCard } from '@/components/standings/GridCards';

export const dynamic = 'force-dynamic';

const DESCRIPTION = 'The current Formula 1 grid — every constructor with its driver line-up, championship standings, and points.';

export const metadata: Metadata = {
  title: 'Grid',
  description: DESCRIPTION,
  alternates: { canonical: '/grid' },
  openGraph: { title: 'Grid — Apex', description: DESCRIPTION, url: '/grid', type: 'website' },
  twitter: { card: 'summary_large_image', title: 'Grid — Apex', description: DESCRIPTION },
};

export default async function GridPage() {
  const [{ season, groups }, { rows: teamRows }] = await Promise.all([
    getDriversByTeam(),
    getCurrentTeams(),
  ]);
  const teamByConstructorId = new Map(teamRows.map((r) => [r.constructorId, r]));

  return (
    <PageShell>
      <header className="mb-8 flex flex-col items-center gap-1 text-center">
        <span className="label-caps text-text-mid">{season} Championship</span>
        <h1 className="headline-lg uppercase text-text-hi">Grid</h1>
      </header>

      <div className="mx-auto flex w-full max-w-5xl flex-col gap-6">
        {groups.length === 0 ? (
          <p className="body-md text-center text-text-mid">Grid data unavailable right now.</p>
        ) : (
          groups.map((group) => {
            const teamRow = teamByConstructorId.get(group.constructorId);
            const [d1, d2] = group.drivers;
            return (
              <div key={group.constructorId} className="grid grid-cols-4 gap-4 md:grid-cols-8 lg:grid-cols-12">
                {d1 ? <DriverCard row={d1} season={season} /> : <div className="col-span-4" />}
                {d2 ? <DriverCard row={d2} season={season} /> : <div className="col-span-4" />}
                {teamRow ? <TeamCard row={teamRow} /> : <div className="col-span-4" />}
              </div>
            );
          })
        )}
      </div>
    </PageShell>
  );
}
