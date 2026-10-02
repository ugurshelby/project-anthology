import type { Metadata } from 'next';
import { getDriversByTeam, getCurrentTeams } from '@/lib/data/entities';
import { powerUnitLabel } from '@/lib/f1/power-units';
import { PageShell } from '@/components/layout/BentoGrid';
import { GridExplorer } from '@/components/standings/GridExplorer';
import type { GarageUnit } from '@/components/standings/GarageTeamPanel';
import { localizedAlternates } from '@/lib/seo';
import { CURRENT_SEASON, F1_SEASON_MIN } from '@/lib/f1Calendar';
import { SeasonRail } from '@/components/history/SeasonRail';
import { seasonRailYears } from '@/lib/history/seasons';
import { enginesFor } from '@/lib/history/enrich';

export const dynamic = 'force-dynamic';

const DESCRIPTION = 'The current Formula 1 grid — every constructor with its driver line-up, championship standings, and points.';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  return {
    title: 'Grid',
    description: DESCRIPTION,
    alternates: localizedAlternates('/grid', locale),
    openGraph: { title: 'Grid — Apex', description: DESCRIPTION, url: '/grid', type: 'website' },
    twitter: { card: 'summary_large_image', title: 'Grid — Apex', description: DESCRIPTION },
  };
}

export default async function GridPage({ searchParams }: { searchParams: Promise<{ season?: string }> }) {
  const raw = Number((await searchParams).season);
  const requested = Number.isInteger(raw) && raw >= F1_SEASON_MIN && raw <= CURRENT_SEASON ? raw : CURRENT_SEASON;
  const [{ season, groups, flat }, { rows: teamRows }] = await Promise.all([
    getDriversByTeam(requested),
    getCurrentTeams(requested),
  ]);
  const railYears = seasonRailYears(Array.from({ length: CURRENT_SEASON - F1_SEASON_MIN + 1 }, (_, i) => F1_SEASON_MIN + i));
  const teamByConstructorId = new Map(teamRows.map((r) => [r.constructorId, r]));

  const units: GarageUnit[] = groups.map((group) => {
    const teamRow = teamByConstructorId.get(group.constructorId);
    return {
      constructorId: group.constructorId,
      constructorName: group.constructorName,
      constructorPosition: group.constructorPosition,
      points: teamRow?.points ?? '0',
      wins: teamRow?.wins ?? '0',
      powerUnit: season === CURRENT_SEASON ? powerUnitLabel(group.constructorId) : enginesFor(group.constructorId || group.constructorName, season),
      drivers: group.drivers.slice(0, 2),
    };
  });

  return (
    <PageShell>
      <SeasonRail years={railYears} selected={season} hrefTemplate="/grid?season={year}" className="mb-6" />
      <GridExplorer season={season} units={units} drivers={flat} />
    </PageShell>
  );
}
