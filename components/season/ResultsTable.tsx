import { useTranslations } from 'next-intl';
import { resolveTeamUiColor } from '@/config/team-colors';
import type { RaceResultRow, QualifyingRow } from '@/lib/f1/mrdata';

function GridDeltaBadge({ grid, finish }: { grid: string | null; finish: string }) {
  const g = grid ? parseInt(grid, 10) : NaN;
  const f = parseInt(finish, 10);
  if (isNaN(g) || isNaN(f) || g <= 0) {
    return <span className="w-8 text-center font-mono text-[11px] text-text-low/60">—</span>;
  }
  const delta = g - f;
  if (delta > 0) {
    return (
      <span
        title={`Grid P${g} → P${f} (+${delta})`}
        className="inline-flex w-8 items-center justify-center rounded-[4px] border border-[#00d26a]/25 bg-[#00d26a]/10 px-1 py-0.5 font-mono text-[10px] font-bold tracking-tight text-[#00d26a]"
      >
        +{delta}
      </span>
    );
  }
  if (delta < 0) {
    return (
      <span
        title={`Grid P${g} → P${f} (${delta})`}
        className="inline-flex w-8 items-center justify-center rounded-[4px] border border-[#ff3b30]/25 bg-[#ff3b30]/10 px-1 py-0.5 font-mono text-[10px] font-bold tracking-tight text-[#ff3b30]"
      >
        {delta}
      </span>
    );
  }
  return (
    <span
      title={`Grid P${g} → P${f} (=)`}
      className="inline-flex w-8 items-center justify-center rounded-[4px] border border-white/5 bg-white/[0.02] px-1 py-0.5 font-mono text-[10px] text-text-low"
    >
      0
    </span>
  );
}

/** Race / sprint classification table — mono, right-aligned, tabular-nums (§6). */
export function RaceResultsTable({ rows }: { rows: RaceResultRow[] }) {
  const t = useTranslations('ui.table');
  const tc = useTranslations('ui.common');
  return (
    <div className="flex flex-col">
      <div className="label-caps flex items-center gap-2 border-b border-hairline py-2 text-text-low sm:gap-3">
        <span className="w-6 text-right">P</span>
        <span className="w-8 text-center text-[10px] font-mono tracking-wider">+/-</span>
        <span className="flex-1">{tc('driver')}</span>
        <span className="hidden w-28 sm:block">{t('timeStatus')}</span>
        <span className="w-10 text-right">{tc('pts')}</span>
      </div>
      {rows.map((r) => {
        const color = resolveTeamUiColor(undefined, r.constructorName);
        return (
          <div key={r.position + r.driverName} className="flex items-center gap-2 border-b border-hairline py-2.5 last:border-b-0 sm:gap-3">
            <span className="data-tabular w-6 text-right text-text-mid">{r.position}</span>
            <GridDeltaBadge grid={r.grid} finish={r.position} />
            <span aria-hidden className="h-4 w-0.5 rounded-full" style={{ backgroundColor: color }} />
            <span className="flex-1 truncate">
              <span className="font-condensed text-base font-600 uppercase text-text-hi" style={{ fontFamily: 'var(--font-condensed)' }}>
                {r.driverName}
              </span>
              {r.fastestLap ? <span className="label-caps ml-2 text-accent">{tc('fastestLapShort')}</span> : null}
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
  const t = useTranslations('ui.table');
  const tc = useTranslations('ui.common');
  return (
    <div className="flex flex-col">
      <div className="label-caps flex items-center gap-3 border-b border-hairline py-2 text-text-low">
        <span className="w-6 text-right">P</span>
        <span className="flex-1">{tc('driver')}</span>
        <span className="w-20 text-right">{t('best')}</span>
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
