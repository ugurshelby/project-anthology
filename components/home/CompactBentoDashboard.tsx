import { HomeAtmosphere } from '@/components/home/HomeAtmosphere';
import { BentoConstructorsTile } from '@/components/home/BentoConstructorsTile';
import { BentoLastRaceTile } from '@/components/home/BentoLastRaceTile';
import { BentoLeaderTile } from '@/components/home/BentoLeaderTile';
import { BentoNeonDivider } from '@/components/home/BentoNeonDivider';
import { BentoNewsTile } from '@/components/home/BentoNewsTile';
import { BentoOnThisDayPanel } from '@/components/home/BentoOnThisDayPanel';
import { BentoRaceTile } from '@/components/home/BentoRaceTile';
import { BentoStandingsTile } from '@/components/home/BentoStandingsTile';
import { BentoTyreTile } from '@/components/home/BentoTyreTile';
import type { CompactBentoDashboardProps } from '@/components/home/types';

export function CompactBentoDashboard({
  season,
  leader,
  standings,
  constructors,
  lastRaceRecap,
  nextPanel,
  news,
  onThisDay,
  renderNowMs,
  totalRounds,
  currentRound,
}: CompactBentoDashboardProps) {
  return (
    <div className="bento-dashboard content-wrap relative overflow-hidden">
      <HomeAtmosphere />
      <div className="relative z-10">
        {/* 6-card bento: layout switches between mobile paired grid, tablet
            twin-column and desktop asymmetric L via grid-template-areas. Cards
            are placed by grid-area name, so order here is incidental. */}
        <div className="home-bento">
          <div className="home-bento-leader">
            <BentoLeaderTile leader={leader} season={season} />
          </div>

          <div className="home-bento-next">
            {nextPanel ? (
              <BentoRaceTile panel={nextPanel} renderNowMs={renderNowMs} variant="sidebar" />
            ) : (
              <div className="bento-panel h-full" aria-hidden />
            )}
          </div>

          <div className="home-bento-drivers">
            <BentoStandingsTile
              standings={standings}
              currentRound={currentRound}
              totalRounds={totalRounds}
              season={season}
            />
          </div>

          <div className="home-bento-constructors">
            <BentoConstructorsTile constructors={constructors} season={season} />
          </div>

          <div className="home-bento-lastrace">
            <BentoLastRaceTile recap={lastRaceRecap} />
          </div>

          <div className="home-bento-tyres">
            <BentoTyreTile />
          </div>
        </div>

        {/* On This Day — full-width editorial panel, fenced by a divider on
            each side so it reads as its own band between the grid and news. */}
        {onThisDay.length > 0 ? (
          <>
            <div className="mt-12">
              <BentoNeonDivider />
            </div>
            <BentoOnThisDayPanel entries={onThisDay} />
            <div className="mt-12">
              <BentoNeonDivider />
            </div>
          </>
        ) : (
          <div className="mt-12">
            <BentoNeonDivider />
          </div>
        )}

        {/* Latest Intel — unchanged 3-up news grid. */}
        <div className="mt-8">
          <BentoNewsTile news={news} />
        </div>
      </div>
    </div>
  );
}
