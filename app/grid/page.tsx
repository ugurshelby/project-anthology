import type { Metadata } from 'next';
import { getDriversByTeam, getCurrentTeams } from '@/lib/data/entities';
import { powerUnitLabel } from '@/lib/f1/power-units';
import { PageShell } from '@/components/layout/BentoGrid';
import { GridExplorer } from '@/components/standings/GridExplorer';
import type { GarageUnit } from '@/components/standings/GarageTeamPanel';

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
  const [{ season, groups, flat }, { rows: teamRows }] = await Promise.all([
    getDriversByTeam(),
    getCurrentTeams(),
  ]);
  const teamByConstructorId = new Map(teamRows.map((r) => [r.constructorId, r]));

  const units: GarageUnit[] = groups.map((group) => {
    const teamRow = teamByConstructorId.get(group.constructorId);
    return {
      constructorId: group.constructorId,
      constructorName: group.constructorName,
      constructorPosition: group.constructorPosition,
      points: teamRow?.points ?? '0',
      wins: teamRow?.wins ?? '0',
      powerUnit: powerUnitLabel(group.constructorId),
      drivers: group.drivers.slice(0, 2),
    };
  });

  return (
    <PageShell>
      <GridExplorer season={season} units={units} drivers={flat} />
    </PageShell>
  );
}
