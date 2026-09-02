import Image from 'next/image';
import { BentoCard } from '@/components/bento/BentoCard';
import { driverIconSrc } from '@/lib/assets/f1-icons';
import type { SeasonHighlights } from '@/lib/f1/mrdata';

/**
 * Compact editorial highlight tiles — fastest-lap king and season DNF rate.
 */
export function SeasonHighlightTiles({
  highlights,
  season,
}: {
  highlights: SeasonHighlights;
  season: number;
}) {
  const fl = highlights.fastestLapKing;
  const portrait = fl ? driverIconSrc(fl.driverCode, fl.driverName, season) : null;

  return (
    <>
      <BentoCard span={4} className="flex flex-col justify-between gap-3 border border-white/[0.08] bg-surface/50">
        <span className="label-caps text-text-mid">Fastest Lap King</span>
        {fl ? (
          <div className="flex items-end justify-between gap-3">
            <div className="flex flex-col gap-1">
              <span className="hero-number text-4xl text-accent">{fl.count}</span>
              <span className="font-condensed text-sm font-600 uppercase text-text-hi" style={{ fontFamily: 'var(--font-condensed)' }}>
                {fl.driverName.split(' ').pop()}
              </span>
              <span className="data-tabular text-xs text-text-low">fastest laps</span>
            </div>
            {portrait ? (
              <div className="relative h-16 w-12 shrink-0">
                <Image src={portrait} alt="" fill sizes="48px" className="object-contain object-bottom opacity-80" />
              </div>
            ) : null}
          </div>
        ) : (
          <span className="data-tabular text-text-low">No data yet</span>
        )}
      </BentoCard>

      <BentoCard span={4} className="flex flex-col justify-between gap-3 border border-white/[0.08] bg-surface/50">
        <span className="label-caps text-text-mid">Season Hardship</span>
        <div className="flex flex-col gap-1">
          <span className="hero-number text-4xl text-text-hi">{highlights.dnfRatePercent}%</span>
          <span className="data-tabular text-sm text-text-mid">DNF rate</span>
          <span className="data-tabular text-xs text-text-low">
            {highlights.dnfCount} retirements · {highlights.classifiedCount} classified entries
          </span>
        </div>
      </BentoCard>
    </>
  );
}
