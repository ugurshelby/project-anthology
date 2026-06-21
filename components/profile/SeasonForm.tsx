export interface FormResult {
  /** Short GP label, e.g. "GBR" / "MON". */
  gp: string;
  /** Finish position or status, e.g. "P1", "DNF". */
  result: string;
}

/** Season form (design.md §3.3) — last results as position chips + GP label. */
export function SeasonForm({ results }: { results: FormResult[] }) {
  return (
    <div className="flex gap-2 overflow-x-auto">
      {results.map((r, i) => {
        const dnf = /dnf|dns|dsq/i.test(r.result);
        return (
          <div
            key={`${r.gp}-${i}`}
            className="flex min-w-16 flex-1 flex-col items-center gap-1 rounded-[var(--radius-chip)] border border-hairline bg-surface-raised px-2 py-3"
          >
            <span
              className="font-condensed text-2xl font-700"
              style={{
                fontFamily: 'var(--font-condensed)',
                color: dnf ? 'var(--color-text-low)' : 'var(--team-secondary)',
              }}
            >
              {r.result}
            </span>
            <span className="label-caps text-text-low">{r.gp}</span>
          </div>
        );
      })}
    </div>
  );
}
