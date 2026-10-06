import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { getDriversByTeam, getCurrentTeams } from '@/lib/data/entities';
import { powerUnitLabel } from '@/lib/f1/power-units';
import { getSeasonHeadToHead } from '@/lib/data/f1';
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
  initialViewOverride,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ season?: string; view?: 'constructor' | 'driver' }>;
  initialViewOverride?: 'constructor' | 'driver';
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const resolvedSearchParams = await searchParams;
  const raw = Number(resolvedSearchParams.season);
  const requested = Number.isInteger(raw) && raw >= F1_SEASON_MIN && raw <= CURRENT_SEASON ? raw : CURRENT_SEASON;
  const viewParam = initialViewOverride ?? (resolvedSearchParams.view === 'driver' ? 'driver' : 'constructor');
  const [{ season, groups, flat }, { rows: teamRows }, headToHead] = await Promise.all([
    getDriversByTeam(requested),
    getCurrentTeams(requested),
    getSeasonHeadToHead(requested).catch((): Record<string, TeamHeadToHead> => ({})),
  ]);
  const railYears = seasonRailYears(Array.from({ length: CURRENT_SEASON - F1_SEASON_MIN + 1 }, (_, i) => F1_SEASON_MIN + i));
  const teamByConstructorId = new Map(teamRows.map((r) => [r.constructorId, r]));

  const units: GarageUnit[] = groups.map((group) => {
    const teamRow = teamByConstructorId.get(group.constructorId);
    const h2h = headToHead[group.constructorId.toLowerCase()];
    return {
      constructorId: group.constructorId,
      constructorName: group.constructorName,
      constructorPosition: group.constructorPosition,
      points: teamRow?.points ?? '0',
      wins: teamRow?.wins ?? '0',
      powerUnit: season === CURRENT_SEASON ? powerUnitLabel(group.constructorId) : enginesFor(group.constructorId || group.constructorName, season),
      drivers: group.drivers.slice(0, 2),
      headToHead: h2h,
    };
  });

  return (
    <PageShell>
      <SeasonRail years={railYears} selected={season} hrefTemplate={`/grid?season={year}${viewParam === 'driver' ? '&view=driver' : ''}`} className="mb-6" />
      <GridExplorer season={season} units={units} drivers={flat} initialView={viewParam} />
    </PageShell>
  );
}
