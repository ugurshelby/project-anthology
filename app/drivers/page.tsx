import type { Metadata } from 'next';
import { getDriversByTeam } from '@/lib/data/entities';
import { PageShell, BentoGrid } from '@/components/layout/BentoGrid';
import { DriverCard } from '@/components/standings/GridCards';

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
  const { season, groups } = await getDriversByTeam();

  return (
    <PageShell>
      <header className="mb-8 flex flex-col gap-1">
        <span className="label-caps text-text-mid">{season} Grid</span>
        <h1 className="headline-lg uppercase text-text-hi">Drivers</h1>
      </header>

      <div className="flex flex-col gap-10">
        {groups.map((group) => (
          <section key={group.constructorId} className="flex flex-col gap-4">
            <div className="flex items-baseline gap-3 border-b border-hairline pb-2">
              <span className="data-tabular text-text-low">P{group.constructorPosition}</span>
              <h2 className="headline-md uppercase text-text-hi">{group.constructorName}</h2>
            </div>
            <BentoGrid>
              {group.drivers.map((row) => (
                <DriverCard key={row.driverId} row={row} season={season} />
              ))}
            </BentoGrid>
          </section>
        ))}
      </div>
    </PageShell>
  );
}
