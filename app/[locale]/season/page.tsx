import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { getSeasonData } from '@/lib/data/f1';
import { CURRENT_SEASON, F1_SEASON_MIN, getNextRace } from '@/lib/f1Calendar';
import { PageShell, BentoGrid } from '@/components/layout/BentoGrid';
import { SeasonTitleFightHero } from '@/components/season/SeasonTitleFightHero';
import { SeasonTimeline } from '@/components/season/SeasonTimeline';
import { HorizontalRaceStrip } from '@/components/season/HorizontalRaceStrip';
import { DriverPodiumStandings } from '@/components/season/DriverPodiumStandings';
import { TeamTelemetryBars } from '@/components/season/TeamTelemetryBars';
import { SeasonHighlightTiles } from '@/components/season/SeasonHighlightTiles';
import { SeasonProgressionChart } from '@/components/season/SeasonProgressionChart';
import { BentoCard } from '@/components/bento/BentoCard';
import { LatestRaceCard } from '@/components/home/LatestRaceCard';
import { localizedAlternates } from '@/lib/seo';

export const revalidate = 0;
export const dynamic = 'force-dynamic';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'ui.pages.season' });
  const TITLE = t('metaTitle');
  const DESCRIPTION = t('metaDescription', { season: CURRENT_SEASON });
  return {
    title: TITLE,
    description: DESCRIPTION,
    openGraph: {
      title: t('metaOg', { season: CURRENT_SEASON }),
      description: DESCRIPTION,
      url: '/season',
      type: 'website',
    },
    twitter: { card: 'summary_large_image', title: t('metaOg', { season: CURRENT_SEASON }), description: DESCRIPTION },
    alternates: localizedAlternates('/season', locale),
  };
}

export default async function SeasonPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: 'ui.pages.season' });
  const seasonData = await getSeasonData(CURRENT_SEASON);
  const { standings, constructors, races, raceSummaries, highlights, recap, evolutionSeries } = seasonData;

  const nextRace = getNextRace(races);
  const nextRound = nextRace?.round != null ? String(nextRace.round) : undefined;
  const leader = standings[0];
  const challenger = standings[1] ?? null;

  if (!leader) {
    return (
      <PageShell>
        <span className="label-caps text-text-mid">{t('noStandings', { season: CURRENT_SEASON })}</span>
      </PageShell>
    );
  }

  return (
    <PageShell>
      <div className="relative w-full max-w-full min-w-0">
        <span aria-hidden className="film-grain pointer-events-none fixed inset-0 z-0" />

        <div className="relative z-10 flex w-full max-w-full min-w-0 flex-col">
          <SeasonTitleFightHero
            year={CURRENT_SEASON}
            minSeason={F1_SEASON_MIN}
            currentSeason={CURRENT_SEASON}
            leader={leader}
            challenger={challenger}
          />

          <SeasonTimeline races={races} nextRound={nextRound} />

          <HorizontalRaceStrip summaries={raceSummaries} nextRound={nextRound} season={CURRENT_SEASON} />

          {evolutionSeries && evolutionSeries.length > 0 ? (
            <div className="my-4 md:my-6">
              <SeasonProgressionChart series={evolutionSeries} season={CURRENT_SEASON} />
            </div>
          ) : null}

          <BentoGrid>
            <DriverPodiumStandings drivers={standings} season={CURRENT_SEASON} />
            <TeamTelemetryBars teams={constructors} />
            <SeasonHighlightTiles highlights={highlights} season={CURRENT_SEASON} />
            <BentoCard span={4}>
              {recap ? (
                <LatestRaceCard recap={recap} season={CURRENT_SEASON} />
              ) : (
                <span className="label-caps text-text-mid">{t('noCompleted')}</span>
              )}
            </BentoCard>
          </BentoGrid>
        </div>
      </div>
    </PageShell>
  );
}
