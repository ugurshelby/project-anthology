import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getSeasonData } from '@/lib/data/f1';
import { CURRENT_SEASON, F1_SEASON_MIN, getNextRace } from '@/lib/f1Calendar';
import { PageShell, BentoGrid } from '@/components/layout/BentoGrid';
import { SeasonTitleFightHero } from '@/components/season/SeasonTitleFightHero';
import { SeasonTimeline } from '@/components/season/SeasonTimeline';
import { HorizontalRaceStrip } from '@/components/season/HorizontalRaceStrip';
import { DriverPodiumStandings } from '@/components/season/DriverPodiumStandings';
import { TeamTelemetryBars } from '@/components/season/TeamTelemetryBars';
import { SeasonHighlightTiles } from '@/components/season/SeasonHighlightTiles';
import { BentoCard } from '@/components/bento/BentoCard';
import { LatestRaceCard } from '@/components/home/LatestRaceCard';
import { localizedAlternates } from '@/lib/seo';

export const revalidate = 0;
export const dynamic = 'force-dynamic';

interface PageProps {
  params: Promise<{ year: string; locale: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { year: yearStr, locale } = await params;
  const year = Number(yearStr);
  if (!Number.isInteger(year) || year < F1_SEASON_MIN || year > CURRENT_SEASON) {
    return { title: 'Season not found' };
  }

  const title = `Season ${year}`;
  const description = `Formula 1 ${year} season archive: driver and constructor championship standings, race calendar, and results.`;

  return {
    title,
    description,
    openGraph: {
      title: `${title} — F1 Archive`,
      description,
      url: `/season/${year}`,
      type: 'website',
    },
    twitter: { card: 'summary_large_image', title: `${title} — F1 Archive`, description },
    alternates: localizedAlternates(`/season/${year}`, locale),
  };
}

export default async function HistoricalSeasonPage({ params }: PageProps) {
  const { year: yearStr } = await params;
  const year = Number(yearStr);

  if (!Number.isInteger(year) || year < F1_SEASON_MIN || year > CURRENT_SEASON) {
    notFound();
  }

  const seasonData = await getSeasonData(year);
  const { standings, constructors, races, raceSummaries, highlights, recap } = seasonData;

  const nextRace = year === CURRENT_SEASON ? getNextRace(races) : undefined;
  const nextRound = nextRace?.round != null ? String(nextRace.round) : undefined;
  const leader = standings[0];
  const challenger = standings[1] ?? null;

  if (!leader) {
    return (
      <PageShell>
        <span className="label-caps text-text-mid">No standings data available for {year}</span>
      </PageShell>
    );
  }

  return (
    <PageShell>
      <div className="relative w-full max-w-full min-w-0">
        <span aria-hidden className="film-grain pointer-events-none fixed inset-0 z-0" />

        <div className="relative z-10 flex w-full max-w-full min-w-0 flex-col">
          <SeasonTitleFightHero
            year={year}
            minSeason={F1_SEASON_MIN}
            currentSeason={CURRENT_SEASON}
            leader={leader}
            challenger={challenger}
          />

          {races.length > 0 ? (
            <SeasonTimeline races={races} nextRound={nextRound} />
          ) : null}

          {raceSummaries.length > 0 ? (
            <HorizontalRaceStrip summaries={raceSummaries} nextRound={nextRound} season={year} />
          ) : null}

          <BentoGrid>
            <DriverPodiumStandings drivers={standings} season={year} />
            {constructors.length > 0 ? (
              <TeamTelemetryBars teams={constructors} />
            ) : null}
            {highlights ? (
              <SeasonHighlightTiles highlights={highlights} season={year} />
            ) : null}
            <BentoCard span={4}>
              {recap ? (
                <LatestRaceCard recap={recap} season={year} />
              ) : (
                <span className="label-caps text-text-mid">
                  {year < CURRENT_SEASON ? 'Season concluded' : 'No completed races yet'}
                </span>
              )}
            </BentoCard>
          </BentoGrid>
        </div>
      </div>
    </PageShell>
  );
}
