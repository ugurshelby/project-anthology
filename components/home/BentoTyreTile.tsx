const TYRES = [
  { label: 'Soft (C5)', color: '#dc2626', sets: '2 sets' },
  { label: 'Medium (C4)', color: '#eab308', sets: '3 sets' },
  { label: 'Hard (C3)', color: 'rgba(255,255,255,0.4)', sets: '1 set' },
] as const;

export function BentoTyreTile() {
  return (
    <div className="bento-panel bento-panel-accent flex min-h-[140px] flex-col justify-between p-3 lg:p-6">
      <span
        className="mb-2 block font-condensed text-[9px] uppercase tracking-[0.2em] lg:mb-4 lg:text-[11px]"
        style={{ color: 'var(--muted)' }}
      >
        Tyre Allocation Data
      </span>
      <div className="flex flex-col gap-2 lg:gap-3">
        {TYRES.map((tyre) => (
          <div key={tyre.label} className="flex items-center gap-2 lg:gap-3">
            <div
              className="flex h-3 w-3 items-center justify-center rounded-full border-2 lg:h-4 lg:w-4"
              style={{ borderColor: tyre.color }}
            >
              <div className="h-1 w-1 rounded-full" style={{ backgroundColor: tyre.color }} />
            </div>
            <span className="font-mono text-[10px] uppercase lg:text-xs">
              {tyre.label} — {tyre.sets}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
