import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { getDriversByTeam, getCurrentTeams } from '@/lib/data/entities';
import { powerUnitLabel } from '@/lib/f1/power-units';
import { getSeasonDriverTeamPoints, getSeasonHeadToHead } from '@/lib/data/f1';
import type { TeamPointsShare } from '@/lib/f1/mrdata';
import type { TeamHeadToHead } from '@/lib/f1/headToHead';
import { PageShell } from '@/components/layout/BentoGrid';
import { GridExplorer } from '@/components/standings/GridExplorer';
import type { GarageUnit } from '@/components/standings/GarageTeamPanel';
import { localizedAlternates } from '@/lib/seo';
import { CURRENT_SEASON, F1_SEASON_MIN } from '@/lib/f1Calendar';
import { SeasonRail } from '@/components/history/SeasonRail';
import { seasonRailYears } from '@/lib/history/seasons';
import { enginesFor } from '@/lib/history/enrich';

export const dynamic = 'force-dynamic';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'ui.grid' });
  const tp = await getTranslations({ locale, namespace: 'ui.pages.gridPage' });
  const DESCRIPTION = t('metaDescription');
  return {
    title: t('metaTitle'),
    description: DESCRIPTION,
    alternates: localizedAlternates('/grid', locale),
    openGraph: { title: tp('og'), description: DESCRIPTION, url: '/grid', type: 'website' },
    twitter: { card: 'summary_large_image', title: tp('og'), description: DESCRIPTION },
  };
}

export default async function GridPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ season?: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const resolvedSearchParams = await searchParams;
  const raw = Number(resolvedSearchParams.season);
  const requested = Number.isInteger(raw) && raw >= F1_SEASON_MIN && raw <= CURRENT_SEASON ? raw : CURRENT_SEASON;
  const [{ season, groups, flat }, { rows: teamRows }, headToHead, teamPoints] = await Promise.all([
    getDriversByTeam(requested),
    getCurrentTeams(requested),
    getSeasonHeadToHead(requested).catch((): Record<string, TeamHeadToHead> => ({})),
    getSeasonDriverTeamPoints(requested).catch((): Record<string, TeamPointsShare[]> => ({})),
  ]);
  const railYears = seasonRailYears(Array.from({ length: CURRENT_SEASON - F1_SEASON_MIN + 1 }, (_, i) => F1_SEASON_MIN + i));
  const teamByConstructorId = new Map(teamRows.map((r) => [r.constructorId, r]));

  const units: GarageUnit[] = groups.map((group) => {
    const teamRow = teamByConstructorId.get(group.constructorId);
    const h2h = headToHead[group.constructorId.toLowerCase()];
    const drivers = group.drivers.slice(0, 2);
    // Season totals include points scored for another team; say so, or the team total looks wrong.
    const pointsElsewhere: Record<string, TeamPointsShare[]> = {};
    for (const d of drivers) {
      const others = (teamPoints[d.driverId] ?? []).filter((s) => s.constructorId !== group.constructorId);
      if (others.length > 0) pointsElsewhere[d.driverId] = others;
    }
    // …and the team total includes points from drivers who are no longer in its two seats.
    const shown = new Set(drivers.map((d) => d.driverId));
    const formerScorers = Object.entries(teamPoints)
      .filter(([driverId]) => !shown.has(driverId))
      .flatMap(([driverId, shares]) => {
        const share = shares.find((s) => s.constructorId === group.constructorId);
        const name = flat.find((d) => d.driverId === driverId)?.driverName ?? driverId;
        return share ? [{ driverId, name, points: share.points }] : [];
      });
    return {
      constructorId: group.constructorId,
      constructorName: group.constructorName,
      constructorPosition: group.constructorPosition,
      points: teamRow?.points ?? '0',
      wins: teamRow?.wins ?? '0',
      powerUnit: season === CURRENT_SEASON ? powerUnitLabel(group.constructorId) : enginesFor(group.constructorId || group.constructorName, season),
      drivers,
      headToHead: h2h,
      pointsElsewhere,
      formerScorers,
    };
  });

  return (
    <PageShell>
      <SeasonRail years={railYears} selected={season} hrefTemplate="/grid?season={year}" className="mb-6" />
      <GridExplorer season={season} units={units} />
    </PageShell>
  );
}
