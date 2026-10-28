import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { getTeamView } from '@/lib/data/profiles';
import { getTeamLore } from '@/data/teams';
import { SITE_NAME, siteUrl, localizedAlternates } from '@/lib/seo';
import { teamThemeVars } from '@/lib/theme';
import { getNewsForEntity } from '@/lib/data/news';
import { getMedia, getMediaBatch } from '@/lib/media/read';
import { carKey } from '@/lib/media/keys';
import { countryName, formatNumber } from '@/lib/i18n/format';
import { BentoGrid } from '@/components/layout/BentoGrid';
import { BentoCard } from '@/components/bento/BentoCard';
import { TeamSeasonHero } from '@/components/history/TeamSeasonHero';
import { TeamTelemetryRibbon } from '@/components/history/TeamTelemetryRibbon';
import { TeamCockpitLineup } from '@/components/history/TeamCockpitLineup';
import { LoreSection } from '@/components/profile/LoreSection';
import { RelatedNewsList } from '@/components/news/RelatedNewsList';
import { PageThemeSync } from '@/components/layout/PageThemeSync';
import { JsonLd } from '@/components/seo/JsonLd';
import { SeasonRail } from '@/components/history/SeasonRail';
import { HistoryCard } from '@/components/history/HistoryCard';
import { StatTiles } from '@/components/history/StatTiles';
import { CareerArc } from '@/components/history/CareerArc';
import { TeamDnaSection } from '@/components/history/TeamDnaSection';
import { getMachineryCarsForTeam } from '@/data/machinery/cars';
import { MachineryCrossLink } from '@/components/machinery/MachineryCrossLink';

/**
 * Cached per URL, rebuilt at most every 10 minutes (caching design, DECISIONS 2026-10-28). `?season=` reaches this
 * page as the `year` param of the `season/[year]` variant route (proxy rewrite), never as searchParams.
 */
export const revalidate = 600;

export function generateStaticParams() {
  return [];
}

type PageProps = {
  params: Promise<{ constructorId: string; locale: string; year?: string }>;
};

function parseSeason(raw: string | undefined): number | undefined {
  if (raw === undefined) return undefined;
  const parsed = Number(raw);
  return Number.isInteger(parsed) ? parsed : undefined;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { constructorId, locale, year } = await params;
  const view = await getTeamView(constructorId, parseSeason(year));
  const tp = await getTranslations({ locale, namespace: 'ui.pages.team' });
  if (!view) return { title: (await getTranslations({ locale, namespace: 'system.entityNotFound' }))('team') };

  const title = `${view.name} — ${view.year}`;
  const description = tp('description', { name: view.name, year: view.year });
  const canonical = `/teams/${view.headId}`;
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

export default async function TeamProfilePage({ params }: PageProps) {
  const { constructorId, locale, year } = await params;
  setRequestLocale(locale);
  const view = await getTeamView(constructorId, parseSeason(year));
  if (!view) notFound();

  const t = await getTranslations({ locale, namespace: 'history' });
  const theme = teamThemeVars(view.id, view.year);
  const lore = getTeamLore(view.headId, locale) ?? getTeamLore(view.headId.replace(/-/g, '_'), locale);

  const [carMedia, driverMediaMap, relatedNews] = await Promise.all([
    getMedia('car', carKey(view.headId, view.year)),
    getMediaBatch('driver', view.lineup.map((d) => d.driverId)),
    view.isCurrentSeason ? getNewsForEntity(view.name, 4) : Promise.resolve([]),
  ]);

  const s = view.season;
  const metaParts: string[] = [];
  if (s.position != null) metaParts.push(`P${s.position}`);
  if (s.position != null || s.points > 0) {
    metaParts.push(`${formatNumber(s.points, locale)} ${t('stats.ptsShort')}`);
  }

  const asOf = view.asOf;
  const machineryCars = getMachineryCarsForTeam(view.headId || view.id);

  return (
    <main
      id="main-content"
      style={theme as React.CSSProperties}
      className="mx-auto w-full max-w-[var(--container-max)] flex-1 bg-bg px-5 pt-2 pb-8 md:px-8 md:pt-4 lg:px-16 lg:pb-12"
    >
      <JsonLd
        data={{
          '@context': 'https://schema.org',
          '@type': 'SportsTeam',
          name: view.name,
          url: `${siteUrl()}/teams/${view.headId}`,
          sport: 'Formula 1',
          member: view.lineup.map((d) => ({ '@type': 'Person', name: d.name })),
        }}
      />
      <PageThemeSync vars={theme} />

      {/* Cinematic Poster Hero (Top 45vh) */}
      <TeamSeasonHero
        kicker={t('team.kicker', { year: view.year })}
        name={view.name}
        year={view.year}
        meta={metaParts.length ? metaParts.join(' · ') : undefined}
        entrant={view.entrants[0] && view.entrants[0] !== view.name ? view.entrants[0] : null}
        badge={s.champion ? t('team.champion', { year: view.year }) : null}
        numbers={view.lineup.map((d) => d.number).filter((n): n is string => !!n).slice(0, 3)}
        constructorId={view.id}
        carMediaResult={carMedia}
        country={countryName(view.country, locale)}
      />

      {/* Season Scrubber Timeline Strip (Owner rule §1.2.1 compliant) */}
      <SeasonRail
        years={view.years}
        selected={view.year}
        hrefTemplate={`/teams/${view.headId}?season={year}`}
        className="mb-6"
      />

      {/* Fast Facts Bento — Horizontal Telemetry Strip */}
      <TeamTelemetryRibbon
        titles={asOf.titles}
        allTimeWins={asOf.wins}
        allTimePodiums={asOf.podiums}
        allTimePoles={asOf.poles}
        allTimeSeasons={asOf.seasons}
        year={view.year}
      />

      {/* Dual Pilot Cockpit Modules */}
      {view.lineup.length > 0 ? (
        <TeamCockpitLineup
          lineup={view.lineup}
          year={view.year}
          ui={view.palette.ui}
          totalTeamPoints={s.points}
          driverMediaMap={driverMediaMap}
        />
      ) : null}

      <div className="mt-4 md:mt-6">
        <BentoGrid>
          {/* Season detail (the all-time record is the ribbon above; title badge and entrant are in the hero) */}
          <HistoryCard span={12} texture={view.id} heading={t('team.seasonHeading', { year: view.year })}>
            <StatTiles
              items={[
                { label: t('stats.wins'), value: s.wins },
                { label: t('stats.podiums'), value: s.podiums },
                { label: t('stats.poles'), value: s.poles },
              ]}
            />
            {view.engines.length > 0 ? (
              <p className="body-sm mt-6 border-t border-hairline pt-4 font-mono text-xs text-text-mid">
                {t('team.engine')}: <span lang="en" className="font-semibold text-text-hi">{view.engines.join(', ')}</span>
              </p>
            ) : null}
          </HistoryCard>

          {/* Career Arc & Championship Trajectory */}
          {view.arc.filter((a) => a.position != null).length > 1 ? (
            <HistoryCard span={12} texture={view.id} heading={t('team.arcHeading')}>
              <CareerArc points={view.arc} selectedYear={view.year} caption={t('team.arcCaption', { name: view.name })} />
            </HistoryCard>
          ) : null}

          {/* Lineage & Team DNA */}
          {view.dna ? <TeamDnaSection dna={view.dna} selectedYear={view.year} teamId={view.headId} /> : null}

          {/* Machinery Crosslink to Iconic Cars */}
          {machineryCars.length > 0 ? (
            <div className="col-span-1 md:col-span-8 lg:col-span-12">
              <MachineryCrossLink cars={machineryCars} locale={locale} />
            </div>
          ) : null}

          {/* Reformed Editorial Lore & Multi-Chapters */}
          {lore ? (
            <BentoCard span={relatedNews.length > 0 ? 8 : 12}>
              <LoreSection
                heading={t('team.storyHeading')}
                bio={lore.bio}
                milestones={lore.milestones}
                lore={lore.lore}
                chapters={lore.chapters}
                quote={lore.quote}
                facts={[
                  { label: t('team.base'), value: lore.hq.label },
                  { label: t('team.founded'), value: String(view.dna?.firstSeason ?? lore.founded) },
                ]}
              />
            </BentoCard>
          ) : null}

          {/* Related News Wire */}
          {relatedNews.length > 0 ? (
            <BentoCard span={lore ? 4 : 12}>
              <RelatedNewsList items={relatedNews} heading={t('team.newsHeading')} />
            </BentoCard>
          ) : null}
        </BentoGrid>
      </div>
    </main>
  );
}
