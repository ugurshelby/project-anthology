import { BentoConstructorsTile } from '@/components/home/BentoConstructorsTile';
import { BentoLastRaceTile } from '@/components/home/BentoLastRaceTile';
import { BentoLeaderTile } from '@/components/home/BentoLeaderTile';
import { BentoNewsTile } from '@/components/home/BentoNewsTile';
import { BentoRaceTile } from '@/components/home/BentoRaceTile';
import { BentoStandingsTile } from '@/components/home/BentoStandingsTile';
import { BentoTyreTile } from '@/components/home/BentoTyreTile';
import type { CompactBentoDashboardProps } from '@/components/home/types';

export function CompactBentoDashboard({
  leader,
  standings,
  constructors,
  lastRaceRecap,
  nextPanel,
  news,
  renderNowMs,
  totalRounds,
  currentRound,
}: CompactBentoDashboardProps) {
  return (
    <div className="bento-dashboard content-wrap px-3 py-6 lg:px-8 lg:py-8">
      {/* Mobile + tablet compact bento */}
      <div className="mx-auto grid max-w-[480px] grid-cols-2 gap-3 md:max-w-[768px] md:gap-4 lg:hidden">
        <BentoLeaderTile leader={leader} />
        {nextPanel ? (
          <BentoRaceTile panel={nextPanel} renderNowMs={renderNowMs} />
        ) : null}
        <BentoLastRaceTile recap={lastRaceRecap} />
        <BentoConstructorsTile constructors={constructors} />
        <BentoTyreTile />
        <BentoStandingsTile
          standings={standings}
          currentRound={currentRound}
          totalRounds={totalRounds}
        />
        <BentoNewsTile news={news} />
      </div>

      {/* Desktop bento mosaic */}
      <div className="hidden lg:grid lg:grid-cols-12 lg:gap-8">
        <div className="col-span-8 flex flex-col gap-8">
          <BentoLeaderTile leader={leader} />
          <div className="grid grid-cols-3 gap-8">
            <BentoLastRaceTile recap={lastRaceRecap} />
            <BentoConstructorsTile constructors={constructors} />
            <BentoTyreTile />
          </div>
        </div>

        <div className="col-span-4 flex flex-col gap-8">
          {nextPanel ? (
            <BentoRaceTile panel={nextPanel} variant="sidebar" renderNowMs={renderNowMs} />
          ) : null}
          <BentoStandingsTile
            standings={standings}
            currentRound={currentRound}
            totalRounds={totalRounds}
          />
        </div>

        <div className="col-span-12">
          <BentoNewsTile news={news} />
        </div>
      </div>
    </div>
  );
}
