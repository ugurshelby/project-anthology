import type { CalendarRace } from '@/lib/f1Calendar';
import { isRaceDone } from '@/lib/f1Calendar';

/**
 * Horizontal season progress rail — completed rounds as solid accent segments,
 * next round as pulsing dot, remainder as faint ticks.
 */
export function SeasonTimeline({
  races,
  nextRound,
}: {
  races: CalendarRace[];
  nextRound?: string;
}) {
  const total = races.length;

  return (
    <div className="mb-6 flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <span className="label-caps text-text-mid">Season timeline</span>
        <span className="data-tabular text-text-low">
          {races.filter((r) => isRaceDone(r)).length} / {total} rounds
        </span>
      </div>
      <div className="relative flex h-8 items-center gap-0.5 overflow-x-auto pb-1">
        {races.map((race) => {
          const round = String(race.round ?? '');
          const done = isRaceDone(race);
          const isNext = !done && round === nextRound;
          return (
            <div key={round} className="group relative flex min-w-[10px] flex-1 flex-col items-center gap-1">
              <span
                className={[
                  'block h-1.5 w-full rounded-full transition-colors',
                  done ? 'bg-accent' : isNext ? 'bg-accent animate-pulse' : 'bg-white/10',
                ].join(' ')}
              />
              <span
                className={[
                  'absolute -bottom-0.5 h-2 w-2 rounded-full',
                  isNext ? 'bg-accent shadow-[0_0_8px_var(--accent)]' : 'bg-transparent',
                ].join(' ')}
              />
              <span className="sr-only">
                R{round} {race.raceName} {done ? 'completed' : isNext ? 'next' : 'upcoming'}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
