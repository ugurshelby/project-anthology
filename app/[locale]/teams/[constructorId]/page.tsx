import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { getTeamView } from '@/lib/data/profiles';
import { getTeamLore } from '@/data/teams';
import { SITE_NAME, siteUrl, localizedAlternates } from '@/lib/seo';
import { teamThemeVars } from '@/lib/theme';
import { getNewsForEntity } from '@/lib/data/news';
import { getMedia } from '@/lib/media/read';
import { BentoGrid } from '@/components/layout/BentoGrid';
import { BentoCard } from '@/components/bento/BentoCard';
import { TeamSeasonHero } from '@/components/history/TeamSeasonHero';
import { LoreSection } from '@/components/profile/LoreSection';
import { RelatedNewsList } from '@/components/news/RelatedNewsList';
import { PageThemeSync } from '@/components/layout/PageThemeSync';
import { JsonLd } from '@/components/seo/JsonLd';
import { SeasonRail } from '@/components/history/SeasonRail';
import { HistoryCard } from '@/components/history/HistoryCard';
import { StatTiles } from '@/components/history/StatTiles';
import { TeamLineup } from '@/components/history/TeamLineup';
import { CareerArc } from '@/components/history/CareerArc';
import { TeamDnaSection } from '@/components/history/TeamDnaSection';
import { getMachineryCarsForTeam } from '@/data/machinery/cars';
import { MachineryCrossLink } from '@/components/machinery/MachineryCrossLink';

/** Vercel @vercel/next + Next 16 segment SSG packaging bug — force server render. */
export const dynamic = 'force-dynamic';

type PageProps = {
  params: Promise<{ constructorId: string; locale: string }>;
  searchParams: Promise<{ season?: string }>;
};

function parseSeason(raw: string | undefined): number | undefined {
  if (raw === undefined) return undefined;
  const parsed = Number(raw);
  return Number.isInteger(parsed) ? parsed : undefined;
}

export async function generateMetadata({ params, searchParams }: PageProps): Promise<Metadata> {
  const { constructorId, locale } = await params;
  const view = await getTeamView(constructorId, parseSeason((await searchParams).season));
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

export default async function TeamProfilePage({ params, searchParams }: PageProps) {
  const { constructorId, locale } = await params;
  setRequestLocale(locale);
  const view = await getTeamView(constructorId, parseSeason((await searchParams).season));
  if (!view) notFound();

  const t = await getTranslations({ locale, namespace: 'history' });
  const theme = teamThemeVars(view.id, view.year);
  const relatedNews = view.isCurrentSeason ? await getNewsForEntity(view.name, 4) : [];
  const lore = getTeamLore(view.headId, locale) ?? getTeamLore(view.headId.replace(/-/g, '_'), locale);

  const s = view.season;
  const metaParts: string[] = [];
  if (s.position != null) metaParts.push(`P${s.position}`);
  if (s.position != null || s.points > 0) metaParts.push(`${Number.isInteger(s.points) ? s.points : s.points.toFixed(1)} ${t('stats.ptsShort')}`);

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

      <SeasonRail years={view.years} selected={view.year} hrefTemplate={`/teams/${view.headId}?season={year}`} className="mb-4 md:mb-6" />

      <TeamSeasonHero
        kicker={t('team.kicker', { year: view.year })}
        name={view.name}
        year={view.year}
        meta={metaParts.length ? metaParts.join(' · ') : undefined}
        entrant={view.entrants[0] && view.entrants[0] !== view.name ? view.entrants[0] : null}
        badge={s.champion ? t('team.champion', { year: view.year }) : null}
        numbers={view.lineup.map((d) => d.number).filter((n): n is string => !!n).slice(0, 3)}
        constructorId={view.id}
        mediaResult={await getMedia('team', view.headId)}
      />

      <div className="mt-4 md:mt-6">
        <BentoGrid>
          <HistoryCard span={7} texture={view.id} eyebrow={s.champion ? t('team.champion', { year: view.year }) : undefined} heading={t('team.seasonHeading', { year: view.year })}>
            <StatTiles
              items={[
                { label: t('stats.position'), value: s.position != null ? `P${s.position}` : null },
                { label: t('stats.points'), value: s.position != null || s.points > 0 ? s.points : null },
                { label: t('stats.wins'), value: s.wins },
                { label: t('stats.podiums'), value: s.podiums },
                { label: t('stats.poles'), value: s.poles },
              ]}
            />
            {view.entrants.length > 0 || view.engines.length > 0 ? (
              <p className="body-sm mt-6 border-t border-hairline pt-4 text-text-mid">
                {view.entrants.length > 0 ? (
                  <>
                    {t('team.entrant')}: <span className="text-text-hi">{view.entrants.slice(0, 2).join(', ')}</span>
                  </>
                ) : null}
                {view.entrants.length > 0 && view.engines.length > 0 ? <span className="mx-2 text-text-low">·</span> : null}
                {view.engines.length > 0 ? (
                  <>
                    {t('team.engine')}: <span className="text-text-hi">{view.engines.join(', ')}</span>
                  </>
                ) : null}
              </p>
            ) : null}
          </HistoryCard>

          {view.dna ? (
          <HistoryCard span={5} texture={view.id} heading={t('team.lineageHeading', { year: view.year })}>
            <StatTiles
              items={[
                { label: t('stats.seasons'), value: asOf.seasons },
                { label: t('stats.wins'), value: asOf.wins },
                { label: t('stats.podiums'), value: asOf.podiums },
                { label: t('stats.poles'), value: asOf.poles },
                {
                  label: t('stats.titles'),
                  value: asOf.titles.length > 0 ? asOf.titles.length : null,
                  sub: asOf.titles.length > 0 ? asOf.titles.join(' · ') : undefined,
                },
              ]}
            />
          </HistoryCard>
          ) : null}

          {view.lineup.length > 0 ? (
            <HistoryCard span={12} texture={view.id} heading={t('team.lineupHeading', { year: view.year })}>
              <TeamLineup lineup={view.lineup} year={view.year} ui={view.palette.ui} />
            </HistoryCard>
          ) : null}

          {view.arc.filter((a) => a.position != null).length > 1 ? (
            <HistoryCard span={12} texture={view.id} heading={t('team.arcHeading')}>
              <CareerArc points={view.arc} selectedYear={view.year} caption={t('team.arcCaption', { name: view.name })} />
            </HistoryCard>
          ) : null}

          {view.dna ? <TeamDnaSection dna={view.dna} selectedYear={view.year} teamId={view.headId} /> : null}

          {machineryCars.length > 0 ? (
            <div className="col-span-12">
              <MachineryCrossLink cars={machineryCars} locale={locale} />
            </div>
          ) : null}

          {lore ? (
            <BentoCard span={relatedNews.length > 0 ? 8 : 12}>
              <LoreSection
                heading={t('team.storyHeading')}
                bio={lore.bio}
                milestones={lore.milestones}
                lore={lore.lore}
                facts={[
                  { label: t('team.base'), value: lore.hq.label },
                  { label: t('team.founded'), value: String(view.dna?.firstSeason ?? lore.founded) },
                ]}
              />
            </BentoCard>
          ) : null}

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
