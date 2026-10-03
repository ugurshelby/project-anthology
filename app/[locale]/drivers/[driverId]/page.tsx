import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { getDriverView } from '@/lib/data/profiles';
import { countryName } from '@/lib/i18n/format';
import { SITE_NAME, siteUrl, localizedAlternates } from '@/lib/seo';
import { teamThemeVars } from '@/lib/theme';
import { getNewsForEntity } from '@/lib/data/news';
import { BentoGrid } from '@/components/layout/BentoGrid';
import { BentoCard } from '@/components/bento/BentoCard';
import { DriverProfileHero } from '@/components/profile/DriverProfileHero';
import { LoreSection } from '@/components/profile/LoreSection';
import { RelatedNewsList } from '@/components/news/RelatedNewsList';
import { PageThemeSync } from '@/components/layout/PageThemeSync';
import { JsonLd } from '@/components/seo/JsonLd';
import { SeasonRail } from '@/components/history/SeasonRail';
import { HistoryCard } from '@/components/history/HistoryCard';
import { StatTiles } from '@/components/history/StatTiles';
import { DriverJourney } from '@/components/history/DriverJourney';
import { CareerArc } from '@/components/history/CareerArc';

/** Vercel @vercel/next + Next 16 segment SSG packaging bug — force server render. */
export const dynamic = 'force-dynamic';

type PageProps = {
  params: Promise<{ driverId: string; locale: string }>;
  searchParams: Promise<{ season?: string }>;
};

function parseSeason(raw: string | undefined): number | undefined {
  if (raw === undefined) return undefined;
  const parsed = Number(raw);
  return Number.isInteger(parsed) ? parsed : undefined;
}

function taglineFromLore(lore: { lore: string }): string | null {
  const first = lore.lore.split(/(?<=[.!?])\s+/)[0]?.trim();
  if (!first) return null;
  return first.length > 110 ? `${first.slice(0, 107)}…` : first;
}

export async function generateMetadata({ params, searchParams }: PageProps): Promise<Metadata> {
  const { driverId, locale } = await params;
  const view = await getDriverView(driverId, parseSeason((await searchParams).season), locale);
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

export default async function DriverProfilePage({ params, searchParams }: PageProps) {
  const { driverId, locale } = await params;
  setRequestLocale(locale);
  const view = await getDriverView(driverId, parseSeason((await searchParams).season), locale);
  if (!view) notFound();

  const t = await getTranslations({ locale, namespace: 'history' });
  const lastTeam = view.teams[view.teams.length - 1];
  const theme = teamThemeVars(lastTeam?.id ?? null, view.year);
  // news is about the present: only show it when the selected season is the current one
  const relatedNews = view.isCurrentSeason ? await getNewsForEntity(view.name, 4) : [];

  const s = view.season;
  const metaParts: string[] = [];
  if (s.position != null) metaParts.push(`P${s.position}`);
  if (s.position != null || s.points > 0) metaParts.push(`${Number.isInteger(s.points) ? s.points : s.points.toFixed(1)} ${t('stats.ptsShort')}`);

  const career = view.asOf;
  const born = view.born ? view.born.slice(0, 4) : null;

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
        editorialTagline={view.lore ? taglineFromLore(view.lore) : null}
        driverCode={view.code}
        constructorId={lastTeam?.id.replace(/-/g, '_') ?? null}
        constructorName={lastTeam?.name ?? null}
      />

      <div className="mt-4 md:mt-6">
        <BentoGrid>
          <HistoryCard span={7} texture={lastTeam?.id} eyebrow={s.champion ? t('driver.champion', { year: view.year }) : undefined} heading={t('driver.seasonHeading', { year: view.year })}>
            <StatTiles
              items={[
                { label: t('stats.position'), value: s.position != null ? `P${s.position}` : null },
                { label: t('stats.points'), value: s.position != null || s.points > 0 ? s.points : null },
                { label: t('stats.wins'), value: s.wins > 0 || s.starts > 0 ? s.wins : null },
                { label: t('stats.podiums'), value: s.podiums > 0 || s.starts > 0 ? s.podiums : null },
                { label: t('stats.poles'), value: s.poles > 0 || s.starts > 0 ? s.poles : null },
                { label: t('stats.starts'), value: s.starts > 0 ? s.starts : null },
              ]}
            />
          </HistoryCard>

          <HistoryCard span={5} texture={lastTeam?.id} heading={t('driver.careerHeading', { year: view.year })}>
            <StatTiles
              items={[
                { label: t('stats.seasons'), value: career.seasons },
                { label: t('stats.starts'), value: career.starts > 0 ? career.starts : null },
                { label: t('stats.wins'), value: career.wins },
                { label: t('stats.podiums'), value: career.podiums },
                { label: t('stats.poles'), value: career.poles },
                {
                  label: t('stats.titles'),
                  value: career.titles > 0 ? career.titles : null,
                  sub: career.titles > 0 ? career.titleYears.join(' · ') : undefined,
                },
              ]}
            />
          </HistoryCard>

          {view.arc.filter((a) => a.position != null).length > 1 ? (
            <HistoryCard span={12} texture={lastTeam?.id} heading={t('driver.arcHeading')}>
              <CareerArc points={view.arc} selectedYear={view.year} caption={t('driver.arcCaption', { name: view.name })} />
            </HistoryCard>
          ) : null}

          {view.stints.length > 0 ? (
            <HistoryCard span={12} texture={lastTeam?.id} heading={t('driver.journeyHeading')}>
              <DriverJourney stints={view.stints} driverId={view.id} selectedYear={view.year} />
            </HistoryCard>
          ) : null}

          {view.lore ? (
            <BentoCard span={relatedNews.length > 0 ? 8 : 12}>
              <LoreSection
                heading={t('driver.storyHeading')}
                bio={view.lore.bio}
                milestones={view.lore.milestones}
                lore={view.lore.lore}
                facts={[
                  ...(view.nationality ? [{ label: t('driver.nationalityLabel'), value: countryName(view.nationality, locale) }] : []),
                  ...(born ? [{ label: t('driver.bornLabel'), value: born }] : []),
                ]}
              />
            </BentoCard>
          ) : null}

          {relatedNews.length > 0 ? (
            <BentoCard span={view.lore ? 4 : 12}>
              <RelatedNewsList items={relatedNews} heading={t('driver.newsHeading')} />
            </BentoCard>
          ) : null}
        </BentoGrid>
      </div>
    </main>
  );
}
