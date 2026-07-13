import type { SeasonRoundResult } from '@/lib/data/circuits';

const MEDAL: Record<string, string> = { '1': '#d4a441', '2': '#a8a8a8', '3': '#a3653f' };

/**
 * Scrollable "Results" panel — every finished round this season as a compact
 * podium card, 5 visible at a time with the rest reachable by scroll. Replaces
 * the old Driver Standings sidebar (which just duplicated /season and had no
 * relationship to the circuit being viewed).
 */
export function SeasonResultsPanel({ results }: { results: SeasonRoundResult[] }) {
  if (results.length === 0) {
    return <span className="label-caps text-text-low">No completed races yet</span>;
  }

  return (
    <div className="flex max-h-[420px] flex-col gap-3 overflow-y-auto pr-1">
      {results.map((r) => (
        <div key={r.round} className="flex flex-col gap-2 rounded-[var(--radius)] border border-hairline bg-surface-raised/40 p-3">
          <div className="flex items-baseline justify-between gap-2">
            <span className="font-condensed text-sm font-600 uppercase leading-tight text-text-hi" style={{ fontFamily: 'var(--font-condensed)' }}>
              R{r.round} · {r.raceName}
            </span>
          </div>
          <div className="flex flex-col gap-1">
            {r.podium.map((p) => (
              <div key={p.position} className="flex items-center gap-2 text-sm">
                <span className="data-tabular w-4 font-700" style={{ color: MEDAL[p.position] ?? undefined }}>
                  {p.position}
                </span>
                <span className="min-w-0 flex-1 truncate text-text-hi">{p.driverName}</span>
                <span className="data-tabular shrink-0 text-xs text-text-low">{p.constructorName}</span>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
