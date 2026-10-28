import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { getDriverView } from '@/lib/data/profiles';
import { countryName } from '@/lib/i18n/format';
import { SITE_NAME, siteUrl, localizedAlternates } from '@/lib/seo';
import { teamThemeVars } from '@/lib/theme';
import { getNewsForEntity } from '@/lib/data/news';
import { getMedia } from '@/lib/media/read';
import nextDynamic from 'next/dynamic';
import { BentoGrid } from '@/components/layout/BentoGrid';
import { BentoCard } from '@/components/bento/BentoCard';
import { DriverProfileHero } from '@/components/profile/DriverProfileHero';
import { DriverTelemetryRibbon } from '@/components/profile/DriverTelemetryRibbon';
import type { DriverPulseRound } from '@/components/profile/DriverSeasonPulse';
import { LoreSection } from '@/components/profile/LoreSection';
import { PageThemeSync } from '@/components/layout/PageThemeSync';
import { JsonLd } from '@/components/seo/JsonLd';
import { SeasonRail } from '@/components/history/SeasonRail';
import { HistoryCard } from '@/components/history/HistoryCard';
import { StatTiles } from '@/components/history/StatTiles';
import { DriverJourney } from '@/components/history/DriverJourney';
import { CareerArc } from '@/components/history/CareerArc';
import { getMachineryCarsForDriver } from '@/data/machinery/cars';
import { MachineryCrossLink } from '@/components/machinery/MachineryCrossLink';
import { countryCode } from '@/lib/data/countryFlags';
import { getSeasonHeadToHead, fetchAllRoundResults, getSeasonData, type MrData } from '@/lib/data/f1';
import type { TeamHeadToHead } from '@/lib/f1/headToHead';

const DriverSeasonPulse = nextDynamic(
  () => import('@/components/profile/DriverSeasonPulse').then((m) => m.DriverSeasonPulse),
  {
    loading: () => <div className="h-28 rounded-2xl bg-surface-raised/40 animate-pulse" />,
  }
);

const DriverTeammateDuel = nextDynamic(
  () => import('@/components/profile/DriverTeammateDuel').then((m) => m.DriverTeammateDuel)
);

const RelatedNewsList = nextDynamic(
  () => import('@/components/news/RelatedNewsList').then((m) => m.RelatedNewsList)
);

/**
 * Cached per URL, rebuilt at most every 10 minutes (caching design, DECISIONS 2026-10-28). `?season=` reaches this
 * page as the `year` param of the `season/[year]` variant route (proxy rewrite), never as searchParams.
 */
export const revalidate = 600;

export function generateStaticParams() {
  return [];
}

type PageProps = {
  params: Promise<{ driverId: string; locale: string; year?: string }>;
};

function parseSeason(raw: string | undefined): number | undefined {
  if (raw === undefined) return undefined;
  const parsed = Number(raw);
  return Number.isInteger(parsed) ? parsed : undefined;
}

function taglineFromLore(lore: { lore: string }): string | null {
  const first = lore.lore.split(/(?<=[.!?])\s+/)[0]?.trim();
  if (!first) return null;
  if (first.length <= 140) return first;
  // Cut at a word boundary ("…second race of that se…" read as a typo).
  const cut = first.slice(0, 137);
  return `${cut.slice(0, Math.max(cut.lastIndexOf(' '), 80)).replace(/[\s,;:]+$/, '')}…`;
}

function extractDriverRounds(
  roundResults: Array<{ round: number; data: MrData }>,
  driverId: string,
  driverName?: string,
  driverCode?: string | null,
): DriverPulseRound[] {
  const normId = driverId.toLowerCase();
  const normCode = driverCode?.toUpperCase();
  const list: DriverPulseRound[] = [];

  for (const item of roundResults) {
    const races = (item.data?.MRData as { RaceTable?: { Races?: Array<Record<string, unknown>> } } | undefined)?.RaceTable?.Races;
    const race = races?.[0];
    if (!race) continue;
    const raceName = String(race.raceName ?? `Round ${item.round}`);
    const circuit = race.Circuit as { circuitId?: string; Location?: { country?: string } } | undefined;
    const circuitId = circuit?.circuitId;
    const results = (race.Results as Array<{
      position?: string;
      positionText?: string;
      points?: string;
      status?: string;
      Driver?: { driverId?: string; code?: string; givenName?: string; familyName?: string };
      FastestLap?: { rank?: string };
    }> | undefined) ?? [];

    const found = results.find((r) => {
      const rId = r.Driver?.driverId?.toLowerCase();
      if (rId && (rId === normId || rId.replace(/-/g, '_') === normId.replace(/-/g, '_'))) return true;
      if (normCode && r.Driver?.code?.toUpperCase() === normCode) return true;
      if (driverName && `${r.Driver?.givenName ?? ''} ${r.Driver?.familyName ?? ''}`.trim().toLowerCase() === driverName.toLowerCase()) return true;
      return false;
    });

    if (found) {
      list.push({
        round: String(item.round),
        raceName,
        circuitId,
        countryCode: countryCode(circuit?.Location?.country ?? ''),
        position: found.position ?? '—',
        positionText: found.positionText,
        points: found.points,
        status: found.status,
        fastestLap: found.FastestLap?.rank === '1',
      });
    }
  }
  return list;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { driverId, locale, year } = await params;
  const view = await getDriverView(driverId, parseSeason(year), locale);
  const tp = await getTranslations({ locale, namespace: 'ui.pages.driver' });
  if (!view) return { title: (await getTranslations({ locale, namespace: 'system.entityNotFound' }))('driver') };

  const team = view.teams[view.teams.length - 1]?.name;
  const title = `${view.name} — ${view.year}`;
  const description = team
    ? tp('description', { name: view.name, year: view.year, team })
    : tp('descriptionNoTeam', { name: view.name, year: view.year });
  const canonical = `/drivers/${view.id}`;
  return {
    title,
    description,
    alternates: localizedAlternates(canonical, locale),
    openGraph: {
      title: `${title} — ${SITE_NAME}`,
      description,
      url: canonical,
      type: 'profile',
      images: [{ url: '/opengraph-image', width: 1200, height: 630, alt: view.name }],
    },
    twitter: { card: 'summary_large_image', title: `${title} — ${SITE_NAME}`, description, images: ['/opengraph-image'] },
  };
}

export default async function DriverProfilePage({ params }: PageProps) {
  const { driverId, locale, year } = await params;
  setRequestLocale(locale);
  const view = await getDriverView(driverId, parseSeason(year), locale);
  if (!view) notFound();

  const t = await getTranslations({ locale, namespace: 'history' });
  const lastTeam = view.teams[view.teams.length - 1];
  const theme = teamThemeVars(lastTeam?.id ?? null, view.year);

  // Parallel data fetching for media, live news, teammate H2H, and season bundle
  const [driverMedia, relatedNews, headToHeadMap, seasonDataBundle] = await Promise.all([
    getMedia('driver', view.id),
    view.isCurrentSeason ? getNewsForEntity(view.name, 4) : Promise.resolve([]),
    getSeasonHeadToHead(view.year).catch((): Record<string, TeamHeadToHead> => ({})),
    getSeasonData(view.year).catch(() => null),
  ]);

  // Round-by-round finishes for DriverSeasonPulse
  const roundResults = seasonDataBundle?.races
    ? await fetchAllRoundResults(view.year, seasonDataBundle.races).catch(() => [])
    : [];
  const driverRounds = extractDriverRounds(roundResults, view.id, view.name, view.code);

  const s = view.season;
  const metaParts: string[] = [];
  if (s.position != null) metaParts.push(`P${s.position}`);
  if (s.position != null || s.points > 0) metaParts.push(`${Number.isInteger(s.points) ? s.points : s.points.toFixed(1)} ${t('stats.ptsShort')}`);

  const career = view.asOf;
  const born = view.born ? view.born.slice(0, 4) : null;
  const machineryCars = getMachineryCarsForDriver(view.id, view.name);

  // Teammate Head-to-Head duel resolution
  const teamH2HKey = lastTeam ? lastTeam.id.toLowerCase().replace(/-/g, '_') : null;
  const teamH2H = teamH2HKey
    ? (headToHeadMap[teamH2HKey] ?? headToHeadMap[lastTeam?.id.toLowerCase() ?? ''])
    : null;

  let duelProps: React.ComponentProps<typeof DriverTeammateDuel> | null = null;
  if (teamH2H && teamH2H.drivers && teamH2H.drivers.length === 2) {
    const normDriverId = view.id.toLowerCase().replace(/-/g, '_');
    const driverIdx = teamH2H.drivers.findIndex(
      (d) =>
        d.driverId?.toLowerCase().replace(/-/g, '_') === normDriverId ||
        (view.code && d.driverCode?.toUpperCase() === view.code.toUpperCase()) ||
        d.driverName?.toLowerCase() === view.name.toLowerCase()
    );

    if (driverIdx !== -1) {
      const tmIdx = driverIdx === 0 ? 1 : 0;
      const tm = teamH2H.drivers[tmIdx];
      const tmStanding = seasonDataBundle?.standings.find(
        (st) =>
          st.driverId?.toLowerCase().replace(/-/g, '_') === tm.driverId?.toLowerCase().replace(/-/g, '_') ||
          (tm.driverCode && st.driverCode?.toUpperCase() === tm.driverCode.toUpperCase()) ||
          st.driverName?.toLowerCase() === tm.driverName?.toLowerCase()
      );

      duelProps = {
        driverName: view.name,
        driverCode: view.code ?? view.name.slice(0, 3).toUpperCase(),
        driverNumber: view.number,
        driverPoints: s.points,
        driverPosition: s.position,
        teammateName: tm.driverName,
        teammateCode: tm.driverCode ?? tm.driverName.slice(0, 3).toUpperCase(),
        teammateNumber: tmStanding?.permanentNumber ?? null,
        teammatePoints: tmStanding ? Number(tmStanding.points) || 0 : 0,
        teammatePosition: tmStanding ? Number(tmStanding.position) || null : null,
        qualiScore:
          driverIdx === 0
            ? [teamH2H.qualifying.wins[0], teamH2H.qualifying.wins[1]]
            : [teamH2H.qualifying.wins[1], teamH2H.qualifying.wins[0]],
        raceScore:
          driverIdx === 0
            ? [teamH2H.race.wins[0], teamH2H.race.wins[1]]
            : [teamH2H.race.wins[1], teamH2H.race.wins[0]],
        teamName: lastTeam?.name ?? teamH2H.constructorName,
      };
    }
  }

  return (
    <main
      id="main-content"
      style={theme as React.CSSProperties}
      className="mx-auto w-full max-w-[var(--container-max)] flex-1 bg-bg px-5 pt-2 pb-8 md:px-8 md:pt-4 lg:px-16 lg:pb-12"
    >
      <JsonLd
        data={{
          '@context': 'https://schema.org',
          '@type': 'Person',
          name: view.name,
          url: `${siteUrl()}/drivers/${view.id}`,
          jobTitle: 'Formula 1 driver',
          ...(lastTeam ? { affiliation: { '@type': 'SportsTeam', name: lastTeam.name } } : {}),
        }}
      />
      <PageThemeSync vars={theme} />

      <SeasonRail years={view.years} selected={view.year} hrefTemplate={`/drivers/${view.id}?season={year}`} className="mb-4 md:mb-6" />

      <DriverProfileHero
        kicker={lastTeam ? t('driver.kicker', { team: view.teams.map((x) => x.name).join(' / '), year: view.year }) : String(view.year)}
        title={view.name}
        meta={metaParts.length ? metaParts.join(' · ') : undefined}
        bigNumber={view.number}
        imageSrc={null}
        imageAlt={view.name}
        mediaResult={driverMedia}
        editorialTagline={view.lore ? taglineFromLore(view.lore) : null}
        driverCode={view.code}
        constructorId={lastTeam?.id.replace(/-/g, '_') ?? null}
        constructorName={lastTeam?.name ?? null}
        driverId={view.id}
        nationality={view.nationality ? countryName(view.nationality, locale) : null}
      />

      <DriverTelemetryRibbon career={career} year={view.year} />

      <div className="mt-4 md:mt-6">
        <BentoGrid>
          {driverRounds.length > 0 ? (
            <div className="col-span-1 md:col-span-8 lg:col-span-12">
              <div className="relative overflow-hidden rounded-2xl border border-hairline/80 bg-surface p-4 sm:p-5">
                <span aria-hidden className="pointer-events-none absolute inset-x-0 top-0 h-px bg-white/[0.06]" />
                <DriverSeasonPulse
                  rounds={driverRounds}
                  year={view.year}
                  driverName={view.name}
                />
              </div>
            </div>
          ) : null}

          {duelProps ? (
            <HistoryCard span={6} texture={lastTeam?.id} heading={t('driver.duelHeading')}>
              <DriverTeammateDuel {...duelProps} />
            </HistoryCard>
          ) : null}

          <HistoryCard span={duelProps ? 6 : 12} texture={lastTeam?.id} eyebrow={s.champion ? t('driver.champion', { year: view.year }) : undefined} heading={t('driver.seasonHeading', { year: view.year })}>
            <StatTiles
              items={[
                { label: t('stats.wins'), value: s.wins > 0 || s.starts > 0 ? s.wins : null },
                { label: t('stats.podiums'), value: s.podiums > 0 || s.starts > 0 ? s.podiums : null },
                { label: t('stats.poles'), value: s.poles > 0 || s.starts > 0 ? s.poles : null },
                { label: t('stats.starts'), value: s.starts > 0 ? s.starts : null },
              ]}
            />
          </HistoryCard>

          {view.arc.filter((a) => a.position != null).length > 1 ? (
            <HistoryCard span={12} texture={lastTeam?.id} heading={t('driver.arcHeading')} deferred>
              <CareerArc points={view.arc} selectedYear={view.year} caption={t('driver.arcCaption', { name: view.name })} />
            </HistoryCard>
          ) : null}

          {view.stints.length > 0 ? (
            <HistoryCard span={12} texture={lastTeam?.id} heading={t('driver.journeyHeading')} deferred>
              <DriverJourney stints={view.stints} driverId={view.id} selectedYear={view.year} />
            </HistoryCard>
          ) : null}

          {machineryCars.length > 0 ? (
            <div className="col-span-1 md:col-span-8 lg:col-span-12 bento-deferred">
              <MachineryCrossLink cars={machineryCars} locale={locale} />
            </div>
          ) : null}

          {view.lore ? (
            <BentoCard span={relatedNews.length > 0 ? 8 : 12} deferred>
              <LoreSection
                heading={t('driver.storyHeading')}
                bio={view.lore.bio}
                milestones={view.lore.milestones}
                lore={view.lore.lore}
                chapters={view.lore.chapters}
                quote={view.lore.quote}
                facts={[
                  ...(view.nationality ? [{ label: t('driver.nationalityLabel'), value: countryName(view.nationality, locale) }] : []),
                  ...(born ? [{ label: t('driver.bornLabel'), value: born }] : []),
                ]}
              />
            </BentoCard>
          ) : null}

          {relatedNews.length > 0 ? (
            <BentoCard span={view.lore ? 4 : 12} deferred>
              <RelatedNewsList items={relatedNews} heading={t('driver.newsHeading')} />
            </BentoCard>
          ) : null}
        </BentoGrid>
      </div>
    </main>
  );
}
