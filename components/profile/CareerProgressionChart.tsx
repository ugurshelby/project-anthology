export interface ProgressionPoint {
  label: string;
  /** Numeric value; higher = better (e.g. points, or inverted finishing position). */
  value: number;
}

/**
 * Career progression chart (design.md §6) — a minimal, server-rendered SVG line.
 * No client chart library; single accent stroke, mono axis labels, "museum
 * catalog" discipline. Falls back to an empty state when there's <2 points.
 */
export function CareerProgressionChart({ points }: { points: ProgressionPoint[] }) {
  if (points.length < 2) {
    return <p className="data-tabular text-text-low">Not enough data yet.</p>;
  }

  const W = 320;
  const H = 120;
  const pad = 8;
  const values = points.map((p) => p.value);
  const max = Math.max(...values);
  const min = Math.min(...values);
  const range = max - min || 1;

  const coords = points.map((p, i) => {
    const x = pad + (i / (points.length - 1)) * (W - pad * 2);
    const y = pad + (1 - (p.value - min) / range) * (H - pad * 2);
    return { x, y };
  });

  const path = coords.map((c, i) => `${i === 0 ? 'M' : 'L'}${c.x.toFixed(1)} ${c.y.toFixed(1)}`).join(' ');

  return (
    <div className="flex flex-col gap-2">
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full" role="img" aria-label="Career progression">
        <path d={path} fill="none" stroke="var(--team-secondary)" strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />
        {coords.map((c, i) => (
          <circle key={i} cx={c.x} cy={c.y} r="2.5" fill="var(--team-secondary)" />
        ))}
      </svg>
      <div className="flex justify-between">
        {points.map((p) => (
          <span key={p.label} className="label-caps text-text-low">
            {p.label}
          </span>
        ))}
      </div>
    </div>
  );
}
