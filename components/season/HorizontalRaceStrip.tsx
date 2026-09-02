'use client';

import { useMemo, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { circuitIconSrc } from '@/lib/assets/f1-icons';
import { countryFlag } from '@/lib/data/countryFlags';
import type { SeasonRaceSummary } from '@/lib/f1/mrdata';

function gpShortName(raceName: string): string {
  return raceName.replace(/ Grand Prix$/i, '').toUpperCase();
}

/**
 * Horizontal snap rail of compact race cards + inline micro-summary panel.
 * Selecting a card updates the detail strip without a full page navigation.
 */
export function HorizontalRaceStrip({
  summaries,
  nextRound,
  season,
}: {
  summaries: SeasonRaceSummary[];
  nextRound?: string;
  season: number;
}) {
  const defaultRound = useMemo(() => {
    const next = summaries.find((s) => !s.done && s.round === nextRound);
    if (next) return next.round;
    const lastDone = [...summaries].reverse().find((s) => s.done);
    return lastDone?.round ?? summaries[0]?.round ?? '1';
  }, [summaries, nextRound]);

  const [selectedRound, setSelectedRound] = useState(defaultRound);
  const selected = summaries.find((s) => s.round === selectedRound) ?? summaries[0];

  return (
    <div className="mb-8 flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <span className="label-caps text-text-mid">Race calendar</span>
        {selected ? (
          <Link href={`/season/${season}/round/${selected.round}`} className="label-caps text-accent hover:opacity-80">
            Full weekend →
          </Link>
        ) : null}
      </div>

      <div className="flex snap-x snap-mandatory gap-3 overflow-x-auto pb-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {summaries.map((race) => {
          const isNext = !race.done && race.round === nextRound;
          const isActive = race.round === selectedRound;
          const flag = countryFlag(race.country);
          return (
            <button
              key={race.round}
              type="button"
              onClick={() => setSelectedRound(race.round)}
              className={[
                'snap-start shrink-0 rounded-[var(--radius-lg)] border px-4 py-3 text-left backdrop-blur-sm transition-[transform,box-shadow,border-color] duration-200',
                'min-w-[148px] sm:min-w-[168px]',
                isActive
                  ? 'scale-[1.02] border-accent/50 bg-surface/80 shadow-[0_0_24px_rgba(255,24,1,0.12)]'
                  : isNext
                    ? 'border-accent/30 bg-surface/60'
                    : 'border-white/[0.08] bg-surface/40 hover:border-white/[0.14]',
              ].join(' ')}
            >
              <div className="flex items-center justify-between gap-2">
                <span className="data-tabular text-text-mid">R{race.round}</span>
                {flag ? <span aria-hidden className="text-sm">{flag}</span> : null}
              </div>
              <span className="mt-1 block font-condensed text-sm font-600 leading-tight uppercase text-text-hi" style={{ fontFamily: 'var(--font-condensed)' }}>
                {gpShortName(race.raceName)}
              </span>
              <span className="data-tabular mt-1 block text-xs text-text-low">
                {race.done && race.winnerCode ? race.winnerCode.toUpperCase() : isNext ? 'NEXT' : '—'}
              </span>
            </button>
          );
        })}
      </div>

      {selected ? <RaceMicroSummary race={selected} season={season} isNext={!selected.done && selected.round === nextRound} /> : null}
    </div>
  );
}

function RaceMicroSummary({
  race,
  season,
  isNext,
}: {
  race: SeasonRaceSummary;
  season: number;
  isNext: boolean;
}) {
  const svg = circuitIconSrc(race.circuitId);
  const flag = countryFlag(race.country);

  return (
    <div
      key={race.round}
      className="relative overflow-hidden rounded-[var(--radius-lg)] border border-white/[0.08] bg-surface/50 p-5 backdrop-blur-sm transition-opacity duration-300"
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex min-w-0 flex-1 flex-col gap-2">
          <span className="label-caps flex items-center gap-1.5 text-text-mid">
            {flag ? <span aria-hidden>{flag}</span> : null}
            R{race.round} · {race.country}
            {isNext ? (
              <span className="inline-flex items-center gap-1 rounded-[var(--radius-pill)] border border-accent/40 bg-accent/10 px-2 py-0.5 text-accent">
                <span aria-hidden className="h-1 w-1 animate-pulse rounded-full bg-accent" />
                NEXT
              </span>
            ) : null}
          </span>
          <h3 className="headline-md uppercase text-text-hi">{race.raceName}</h3>
          {race.done && race.podium.length > 0 ? (
            <div className="flex flex-wrap gap-3">
              {race.podium.map((p) => (
                <span key={p.position} className="data-tabular text-sm text-text-mid">
                  P{p.position} {p.driverCode.toUpperCase()}
                </span>
              ))}
            </div>
          ) : (
            <span className="data-tabular text-text-low">Weekend schedule available</span>
          )}
          {race.fastestLapDriver ? (
            <span className="label-caps text-text-low">
              FL · {race.fastestLapDriver}
              {race.fastestLapTime ? ` · ${race.fastestLapTime}` : ''}
            </span>
          ) : null}
          <Link href={`/season/${season}/round/${race.round}`} className="label-caps mt-1 w-fit text-accent hover:opacity-80">
            Open round →
          </Link>
        </div>
        {svg ? (
          <div className="relative mx-auto h-28 w-44 shrink-0 sm:mx-0 sm:h-32 sm:w-52">
            <Image src={svg} alt="" fill sizes="208px" className="object-contain opacity-80 brightness-0 invert" />
          </div>
        ) : null}
      </div>
    </div>
  );
}
