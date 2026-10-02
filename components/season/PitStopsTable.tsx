import { useTranslations } from 'next-intl';
import { resolveTeamUiColor } from '@/config/team-colors';
import type { PitStopRow, RaceResultRow } from '@/lib/f1/mrdata';

interface PitStopsTableProps {
  rows: PitStopRow[];
  results?: RaceResultRow[];
}

export function PitStopsTable({ rows, results = [] }: PitStopsTableProps) {
  const t = useTranslations('ui.table');
  if (rows.length === 0) return null;

  // Build driver lookup map from race results
  const driverMap = new Map<
    string,
    { name: string; constructorName: string; constructorId?: string }
  >();
  for (const r of results) {
    if (r.driverId) {
      driverMap.set(r.driverId, {
        name: r.driverName,
        constructorName: r.constructorName,
        constructorId: r.constructorId,
      });
    }
  }

  // Find the fastest stationary pit stop
  let fastestDuration = Infinity;
  for (const r of rows) {
    const d = parseFloat(r.duration);
    if (!Number.isNaN(d) && d > 0 && d < fastestDuration) {
      fastestDuration = d;
    }
  }

  return (
    <div className="flex flex-col">
      <div className="label-caps flex items-center gap-3 border-b border-hairline py-2 text-text-low text-xs">
        <span className="w-10 text-left">{t('lap')}</span>
        <span className="w-8 text-center">{t('stop')}</span>
        <span className="flex-1">{t('driverTeam')}</span>
        <span className="w-24 text-right">{t('duration')}</span>
        <span className="hidden w-20 text-right sm:block">{t('time')}</span>
      </div>

      <div className="divide-y divide-hairline max-h-[460px] overflow-y-auto pr-1">
        {rows.map((row, idx) => {
          const info = driverMap.get(row.driverId);
          const driverName = info?.name || row.driverId.replace(/_/g, ' ');
          const teamName = info?.constructorName || '';
          const teamColor = resolveTeamUiColor(info?.constructorId, teamName);
          const durNum = parseFloat(row.duration);
          const isFastest = !Number.isNaN(durNum) && durNum > 0 && durNum === fastestDuration;

          return (
            <div
              key={`${row.driverId}-${row.lap}-${row.stop}-${idx}`}
              className="flex items-center gap-3 py-2.5 transition-colors hover:bg-surface-raised/40"
            >
              <span className="data-tabular w-10 text-left text-sm text-text-mid font-mono">
                L{row.lap}
              </span>

              <span className="data-tabular w-8 text-center text-xs text-text-low font-mono">
                #{row.stop}
              </span>

              <div className="flex min-w-0 flex-1 items-center gap-2">
                <span
                  aria-hidden
                  className="h-3.5 w-0.5 shrink-0 rounded-full"
                  style={{ backgroundColor: teamColor }}
                />
                <div className="flex flex-col min-w-0 truncate">
                  <span
                    className="font-condensed text-sm sm:text-base font-600 uppercase text-text-hi truncate"
                    style={{ fontFamily: 'var(--font-condensed)' }}
                  >
                    {driverName}
                  </span>
                  {teamName ? (
                    <span className="text-[11px] text-text-mid truncate leading-none">
                      {teamName}
                    </span>
                  ) : null}
                </div>
              </div>

              <div className="flex w-24 flex-col items-end">
                <span
                  className={[
                    'data-tabular text-sm font-semibold',
                    isFastest ? 'text-accent' : 'text-text-hi',
                  ].join(' ')}
                >
                  {row.duration ? `${row.duration}s` : '—'}
                </span>
                {isFastest ? (
                  <span className="label-caps text-[9px] text-accent font-mono uppercase tracking-wider">
                    {t('fastest')}
                  </span>
                ) : null}
              </div>

              <span className="data-tabular hidden w-20 text-right text-xs text-text-mid font-mono sm:block">
                {row.time || '—'}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
