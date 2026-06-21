import { resolveTeamUiColor } from '@/config/team-colors';

export interface PodiumEntry {
  position: 1 | 2 | 3;
  driverCode: string;
  constructorName?: string;
}

const HEIGHTS: Record<1 | 2 | 3, string> = { 1: 'h-28', 2: 'h-20', 3: 'h-16' };
const ORDER: Array<1 | 2 | 3> = [2, 1, 3];

/** Last-race podium bars (design.md §3.3). P1 tallest, center; team-colored caps. */
export function PodiumViz({ entries, raceLabel }: { entries: PodiumEntry[]; raceLabel?: string }) {
  const byPos = new Map(entries.map((e) => [e.position, e]));
  return (
    <div className="flex flex-col gap-3">
      {raceLabel ? <span className="label-caps text-text-mid">{raceLabel}</span> : null}
      <div className="flex items-end justify-center gap-3">
        {ORDER.map((pos) => {
          const e = byPos.get(pos);
          if (!e) return <div key={pos} className="flex-1" />;
          const color = resolveTeamUiColor(undefined, e.constructorName);
          return (
            <div key={pos} className="flex flex-1 flex-col items-center gap-2">
              <span className="font-condensed text-lg font-600 uppercase text-text-hi" style={{ fontFamily: 'var(--font-condensed)' }}>
                {e.driverCode.toUpperCase()}
              </span>
              <div className={['flex w-full items-start justify-center rounded-t-[var(--radius-chip)] bg-surface-raised pt-2', HEIGHTS[pos]].join(' ')} style={{ borderTop: `3px solid ${color}` }}>
                <span className="data-tabular text-text-mid">P{pos}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
