import { resolveTeamUiColor } from '@/config/team-colors';
import type { RaceResultRow, QualifyingRow } from '@/lib/f1/mrdata';

/** Race / sprint classification table — mono, right-aligned, tabular-nums (§6). */
export function RaceResultsTable({ rows }: { rows: RaceResultRow[] }) {
  return (
    <div className="flex flex-col">
      <div className="label-caps flex items-center gap-3 border-b border-hairline py-2 text-text-low">
        <span className="w-6 text-right">P</span>
        <span className="flex-1">Driver</span>
        <span className="hidden w-28 sm:block">Time / Status</span>
        <span className="w-10 text-right">PTS</span>
      </div>
      {rows.map((r) => {
        const color = resolveTeamUiColor(undefined, r.constructorName);
        return (
          <div key={r.position + r.driverName} className="flex items-center gap-3 border-b border-hairline py-2.5 last:border-b-0">
            <span className="data-tabular w-6 text-right text-text-mid">{r.position}</span>
            <span aria-hidden className="h-4 w-0.5 rounded-full" style={{ backgroundColor: color }} />
            <span className="flex-1 truncate">
              <span className="font-condensed text-base font-600 uppercase text-text-hi" style={{ fontFamily: 'var(--font-condensed)' }}>
                {r.driverName}
              </span>
              {r.fastestLap ? <span className="label-caps ml-2 text-accent">FL</span> : null}
            </span>
            <span className="data-tabular hidden w-28 text-text-mid sm:block">{r.timeOrStatus}</span>
            <span className="data-tabular w-10 text-right text-text">{r.points}</span>
          </div>
        );
      })}
    </div>
  );
}

/** Qualifying classification table — Q1/Q2/Q3 times. */
export function QualifyingTable({ rows }: { rows: QualifyingRow[] }) {
  return (
    <div className="flex flex-col">
      <div className="label-caps flex items-center gap-3 border-b border-hairline py-2 text-text-low">
        <span className="w-6 text-right">P</span>
        <span className="flex-1">Driver</span>
        <span className="w-20 text-right">Best</span>
      </div>
      {rows.map((r) => {
        const best = r.q3 || r.q2 || r.q1 || '—';
        return (
          <div key={r.position + r.driverName} className="flex items-center gap-3 border-b border-hairline py-2.5 last:border-b-0">
            <span className="data-tabular w-6 text-right text-text-mid">{r.position}</span>
            <span className="font-condensed flex-1 truncate text-base font-600 uppercase text-text-hi" style={{ fontFamily: 'var(--font-condensed)' }}>
              {r.driverName}
            </span>
            <span className="data-tabular w-20 text-right text-text">{best}</span>
          </div>
        );
      })}
    </div>
  );
}
