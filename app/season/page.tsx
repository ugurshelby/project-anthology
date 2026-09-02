import type { Metadata } from 'next';
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

export const revalidate = 0;
export const dynamic = 'force-dynamic';

const TITLE = 'Season';
const DESCRIPTION = `Formula 1 ${CURRENT_SEASON} season: driver and constructor standings, race calendar, and race recaps.`;

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  openGraph: {
    title: `${TITLE} — F1 ${CURRENT_SEASON}`,
    description: DESCRIPTION,
    url: '/season',
    type: 'website',
  },
  twitter: { card: 'summary_large_image', title: `${TITLE} — F1 ${CURRENT_SEASON}`, description: DESCRIPTION },
  alternates: { canonical: '/season' },
};

export default async function SeasonPage() {
  const seasonData = await getSeasonData(CURRENT_SEASON);
  const { standings, constructors, races, raceSummaries, highlights, recap } = seasonData;

  const nextRace = getNextRace(races);
  const nextRound = nextRace?.round != null ? String(nextRace.round) : undefined;
  const leader = standings[0];
  const challenger = standings[1] ?? null;

  if (!leader) {
    return (
      <PageShell>
        <span className="label-caps text-text-mid">No standings data for {CURRENT_SEASON}</span>
      </PageShell>
    );
  }

  return (
    <PageShell>
      <div className="relative">
        <span aria-hidden className="film-grain pointer-events-none fixed inset-0 z-0" />

        <div className="relative z-10 flex flex-col">
          <SeasonTitleFightHero
            year={CURRENT_SEASON}
            minSeason={F1_SEASON_MIN}
            currentSeason={CURRENT_SEASON}
            leader={leader}
            challenger={challenger}
          />

          <SeasonTimeline races={races} nextRound={nextRound} />

          <HorizontalRaceStrip summaries={raceSummaries} nextRound={nextRound} season={CURRENT_SEASON} />

          <BentoGrid>
            <DriverPodiumStandings drivers={standings} season={CURRENT_SEASON} />
            <TeamTelemetryBars teams={constructors} />
            <SeasonHighlightTiles highlights={highlights} season={CURRENT_SEASON} />
            <BentoCard span={4}>
              {recap ? (
                <LatestRaceCard recap={recap} season={CURRENT_SEASON} />
              ) : (
                <span className="label-caps text-text-low">No completed races yet</span>
              )}
            </BentoCard>
          </BentoGrid>
        </div>
      </div>
    </PageShell>
  );
}
