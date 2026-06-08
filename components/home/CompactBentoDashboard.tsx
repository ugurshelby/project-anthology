import { BentoConstructorsTile } from '@/components/home/BentoConstructorsTile';
import { BentoLastRaceTile } from '@/components/home/BentoLastRaceTile';
import { BentoLeaderTile } from '@/components/home/BentoLeaderTile';
import { BentoNeonDivider } from '@/components/home/BentoNeonDivider';
import { BentoNewsTile } from '@/components/home/BentoNewsTile';
import { BentoOnThisDayTile } from '@/components/home/BentoOnThisDayTile';
import { BentoRaceTile } from '@/components/home/BentoRaceTile';
import { BentoStandingsTile } from '@/components/home/BentoStandingsTile';
import { BentoTyreTile } from '@/components/home/BentoTyreTile';
import type { CompactBentoDashboardProps } from '@/components/home/types';

function MidRowPanels({
  lastRaceRecap,
  constructors,
  standings,
  currentRound,
  totalRounds,
}: {
  lastRaceRecap: CompactBentoDashboardProps['lastRaceRecap'];
  constructors: CompactBentoDashboardProps['constructors'];
  standings: CompactBentoDashboardProps['standings'];
  currentRound: number;
  totalRounds: number;
}) {
  return (
    <div className="bento-mid-row col-span-2 w-full lg:col-span-12">
      <BentoLastRaceTile recap={lastRaceRecap} />
      <BentoConstructorsTile constructors={constructors} />
      <BentoTyreTile />
      <BentoStandingsTile
        standings={standings}
        currentRound={currentRound}
        totalRounds={totalRounds}
      />
    </div>
  );
}

export function CompactBentoDashboard({
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
    <div className="bento-dashboard content-wrap px-3 py-6 lg:px-8 lg:py-8">
      {/* Mobile + tablet */}
      <div className="mx-auto max-w-[480px] md:max-w-[768px] lg:hidden">
        <div className="grid grid-cols-2 gap-3 md:gap-4">
          <div className="bento-hero-tile col-span-2">
            <BentoLeaderTile leader={leader} />
          </div>
          {nextPanel ? (
            <div className="bento-hero-tile col-span-2">
              <BentoRaceTile panel={nextPanel} renderNowMs={renderNowMs} variant="sidebar" />
            </div>
          ) : null}
          <MidRowPanels
            lastRaceRecap={lastRaceRecap}
            constructors={constructors}
            standings={standings}
            currentRound={currentRound}
            totalRounds={totalRounds}
          />
          <BentoNeonDivider />
          {onThisDay.length > 0 ? <BentoOnThisDayTile entries={onThisDay} /> : null}
          <BentoNewsTile news={news} />
        </div>
      </div>

      {/* Desktop: hero row (Leader + Next Race), then full-width 4-panel row */}
      <div className="hidden lg:grid lg:grid-cols-12 lg:items-stretch lg:gap-8">
        <div className="bento-hero-tile col-span-8">
          <BentoLeaderTile leader={leader} />
        </div>

        {nextPanel ? (
          <div className="bento-hero-tile col-span-4">
            <BentoRaceTile
              panel={nextPanel}
              variant="sidebar"
              renderNowMs={renderNowMs}
            />
          </div>
        ) : (
          <div className="bento-hero-tile col-span-4" aria-hidden />
        )}

        <MidRowPanels
          lastRaceRecap={lastRaceRecap}
          constructors={constructors}
          standings={standings}
          currentRound={currentRound}
          totalRounds={totalRounds}
        />

        <BentoNeonDivider />
        {onThisDay.length > 0 ? <BentoOnThisDayTile entries={onThisDay} /> : null}
        <BentoNewsTile news={news} />
      </div>
    </div>
  );
}
