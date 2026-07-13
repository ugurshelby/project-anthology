/** Completed-rounds progress bar — replaces a bare "9 / 22" number pair with a filled track. */
export function RoundsProgress({ completed, total }: { completed: number; total: number }) {
  const pct = total > 0 ? Math.min(100, Math.round((completed / total) * 100)) : 0;

  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-baseline justify-between gap-2">
        <span className="label-caps text-text-low">Completed</span>
        <span className="data-tabular text-text-mid">{completed} / {total}</span>
      </div>
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-surface-raised">
        <div className="h-full rounded-full bg-accent" style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}
