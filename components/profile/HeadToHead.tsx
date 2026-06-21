interface H2HMetric {
  label: string;
  left: number;
  right: number;
}

/**
 * Head-to-Head (design.md §3.4 — signature element). Center-divided bars grow
 * left/right. One side neutral grey, the other the team secondary; the driver
 * abbreviation + name carry the identity so color is never the sole signal (§6).
 * Mono numbers.
 */
export function HeadToHead({
  leftName,
  rightName,
  metrics,
}: {
  leftName: string;
  rightName: string;
  metrics: H2HMetric[];
}) {
  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center justify-between">
        <span className="font-condensed text-lg font-600 uppercase text-text-hi" style={{ fontFamily: 'var(--font-condensed)' }}>
          {leftName}
        </span>
        <span className="label-caps text-text-low">H2H</span>
        <span
          className="font-condensed text-lg font-600 uppercase"
          style={{ fontFamily: 'var(--font-condensed)', color: 'var(--team-secondary)' }}
        >
          {rightName}
        </span>
      </div>

      {metrics.map((m) => {
        const total = m.left + m.right || 1;
        const leftPct = (m.left / total) * 100;
        return (
          <div key={m.label} className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between">
              <span className="data-tabular text-text-hi">{m.left}</span>
              <span className="label-caps text-text-mid">{m.label}</span>
              <span className="data-tabular text-text-hi">{m.right}</span>
            </div>
            <div className="flex h-1.5 overflow-hidden rounded-full bg-surface-raised">
              <span className="bg-text-low" style={{ width: `${leftPct}%` }} />
              <span style={{ width: `${100 - leftPct}%`, backgroundColor: 'var(--team-secondary)' }} />
            </div>
          </div>
        );
      })}
    </div>
  );
}
