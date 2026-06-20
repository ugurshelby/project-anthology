import { HomeAtmosphere } from '@/components/home/HomeAtmosphere';
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

        {/* ── MOBILE (< 768px): single column stack ───────────────────── */}
        <div className="flex flex-col gap-4 sm:hidden">
          {/* Hero: Championship Leader — tall cinematic card */}
          <div style={{ minHeight: 320 }}>
            <BentoLeaderTile leader={leader} season={season} />
          </div>

          {/* Next Race */}
          {nextPanel ? (
            <div style={{ minHeight: 200 }}>
              <BentoRaceTile panel={nextPanel} renderNowMs={renderNowMs} variant="sidebar" />
            </div>
          ) : null}

          {/* Mid panels: 2-col equal grid */}
          <div className="grid grid-cols-2 gap-3" style={{ minHeight: 260 }}>
            <BentoLastRaceTile recap={lastRaceRecap} />
            <BentoConstructorsTile constructors={constructors} season={season} />
          </div>
          <div className="grid grid-cols-2 gap-3" style={{ minHeight: 260 }}>
            <BentoTyreTile />
            <BentoStandingsTile
              standings={standings}
              currentRound={currentRound}
              totalRounds={totalRounds}
              season={season}
            />
          </div>

          <BentoNeonDivider />

          {/* Bottom row: OnThisDay + News stacked */}
          {onThisDay.length > 0 ? <BentoOnThisDayTile entries={onThisDay} /> : null}
          <BentoNewsTile news={news} />
        </div>

        {/* ── TABLET (768px – 1023px): 2-col grid ─────────────────────── */}
        <div className="hidden sm:grid sm:grid-cols-2 sm:gap-4 lg:hidden">
          <div className="col-span-2" style={{ minHeight: 400 }}>
            <BentoLeaderTile leader={leader} season={season} />
          </div>

          {nextPanel ? (
            <div className="col-span-2" style={{ minHeight: 240 }}>
              <BentoRaceTile panel={nextPanel} renderNowMs={renderNowMs} variant="sidebar" />
            </div>
          ) : null}

          {/* 4 mid panels in 2×2 grid */}
          <div style={{ minHeight: 280 }}><BentoLastRaceTile recap={lastRaceRecap} /></div>
          <div style={{ minHeight: 280 }}><BentoConstructorsTile constructors={constructors} season={season} /></div>
          <div style={{ minHeight: 280 }}><BentoTyreTile /></div>
          <div style={{ minHeight: 280 }}>
            <BentoStandingsTile
              standings={standings}
              currentRound={currentRound}
              totalRounds={totalRounds}
              season={season}
            />
          </div>

          <div className="col-span-2"><BentoNeonDivider /></div>

          {/* Bottom: OnThisDay half-width, News half-width */}
          {onThisDay.length > 0 ? (
            <div className="col-span-1"><BentoOnThisDayTile entries={onThisDay} /></div>
          ) : null}
          <div className={onThisDay.length > 0 ? 'col-span-1' : 'col-span-2'}>
            <BentoNewsTile news={news} />
          </div>
        </div>

        {/* ── DESKTOP (≥ 1024px): 12-col bento grid ───────────────────── */}
        <div className="hidden lg:grid lg:grid-cols-12 lg:items-stretch lg:gap-4">
          {/* Hero row: Leader 8 + NextRace 4 */}
          <div className="bento-hero-tile col-span-8">
            <BentoLeaderTile leader={leader} season={season} />
          </div>
          {nextPanel ? (
            <div className="bento-hero-tile col-span-4">
              <BentoRaceTile panel={nextPanel} variant="sidebar" renderNowMs={renderNowMs} />
            </div>
          ) : (
            <div className="bento-hero-tile col-span-4" aria-hidden />
          )}

          {/* Mid row: 4 equal panels (3+3+3+3 = 12) */}
          <div className="bento-mid-row col-span-12 mt-[80px] w-full">
            <BentoLastRaceTile recap={lastRaceRecap} />
            <BentoConstructorsTile constructors={constructors} season={season} />
            <BentoTyreTile />
            <BentoStandingsTile
              standings={standings}
              currentRound={currentRound}
              totalRounds={totalRounds}
              season={season}
            />
          </div>

          {/* Divider */}
          <div className="col-span-12 mt-[80px]">
            <BentoNeonDivider />
          </div>

          {/* Bottom row: OnThisDay 4 + News 8 = 12 (always fills) */}
          {onThisDay.length > 0 ? (
            <>
              <div className="col-span-4">
                <BentoOnThisDayTile entries={onThisDay} />
              </div>
              <div className="col-span-8">
                <BentoNewsTile news={news} />
              </div>
            </>
          ) : (
            <div className="col-span-12">
              <BentoNewsTile news={news} />
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
