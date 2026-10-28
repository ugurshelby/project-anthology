'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';

/** Sector strokes: accent, light, muted (purple stays reserved for the lap record, rules §9). */
const SECTOR_COLORS = ['var(--accent)', '#e8e8e8', '#8a93a3'] as const;

export interface TracePoint {
  x: number;
  y: number;
  dM: number;
}

export interface TracePin {
  dM: number;
  kmh: number;
  gear: number;
  x: number;
  y: number;
}

/**
 * Measured pole-lap outline (master-plan 13.4): the sample positions as a line split into the
 * three timing sectors, sector boundary ticks, and the slowest points as pins that show speed
 * and gear on hover, tap or keyboard focus. No corner names or numbers (no source for them).
 */
export function TelemetryTrace({
  points,
  boundariesM,
  pins,
  label,
}: {
  points: readonly TracePoint[];
  boundariesM: readonly [number, number];
  pins: readonly TracePin[];
  label: string;
}) {
  const t = useTranslations('ui.circuit.telemetry');
  const [active, setActive] = useState<number | null>(null);
  if (points.length < 2) return null;

  const xs = points.map((p) => p.x);
  const ys = points.map((p) => p.y);
  const minX = Math.min(...xs);
  const minY = Math.min(...ys);
  const w = Math.max(...xs) - minX;
  const h = Math.max(...ys) - minY;
  const pad = Math.max(w, h) * 0.06;
  const viewBox = `${minX - pad} ${minY - pad} ${w + pad * 2} ${h + pad * 2}`;
  const unit = Math.max(w, h) / 100;

  const sectorOf = (dM: number) => (dM < boundariesM[0] ? 0 : dM < boundariesM[1] ? 1 : 2);
  const segments: string[][] = [[], [], []];
  points.forEach((p, i) => {
    const s = sectorOf(p.dM);
    segments[s].push(`${p.x},${p.y}`);
    // Repeat the first point of the next sector so the line has no gap at the boundary.
    const next = points[i + 1];
    if (next && sectorOf(next.dM) !== s) segments[s].push(`${next.x},${next.y}`);
  });
  const boundaryPoints = boundariesM.map((b) => points.find((p) => p.dM >= b)).filter((p): p is TracePoint => Boolean(p));

  return (
    <svg viewBox={viewBox} role="img" aria-label={label} className="h-full w-full overflow-visible">
      {segments.map((pts, s) =>
        pts.length > 1 ? (
          <polyline
            key={s}
            points={pts.join(' ')}
            fill="none"
            style={{ stroke: SECTOR_COLORS[s] }}
            strokeWidth={unit * 1.1}
            strokeLinejoin="round"
            strokeLinecap="round"
          >
            <title>{t('sector', { n: s + 1 })}</title>
          </polyline>
        ) : null,
      )}
      {boundaryPoints.map((p, i) => (
        <circle key={`b${i}`} cx={p.x} cy={p.y} r={unit * 1.6} fill="#0a0a0a" stroke="#ffffff" strokeWidth={unit * 0.5} />
      ))}
      {pins.map((pin, i) => {
        const on = active === i;
        const text = t('slowPoint', { kmh: pin.kmh, gear: pin.gear });
        return (
          <g
            key={`p${i}`}
            role="button"
            tabIndex={0}
            aria-label={text}
            aria-pressed={on}
            className="cursor-pointer outline-none"
            onMouseEnter={() => setActive(i)}
            onMouseLeave={() => setActive(null)}
            onFocus={() => setActive(i)}
            onBlur={() => setActive(null)}
            onClick={() => setActive(on ? null : i)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                setActive(on ? null : i);
              }
            }}
          >
            <circle cx={pin.x} cy={pin.y} r={unit * 4} fill="transparent" />
            <circle
              cx={pin.x}
              cy={pin.y}
              r={unit * (on ? 2.4 : 1.8)}
              style={{ fill: 'var(--accent)' }}
              stroke="#ffffff"
              strokeWidth={unit * (on ? 0.7 : 0.4)}
            />
            {on ? (
              <g pointerEvents="none">
                <rect
                  x={pin.x + unit * 3}
                  y={pin.y - unit * 7}
                  width={unit * (text.length * 2.05 + 4)}
                  height={unit * 6}
                  rx={unit * 1.2}
                  fill="#0a0a0a"
                  stroke="rgba(255,255,255,0.25)"
                  strokeWidth={unit * 0.3}
                />
                <text
                  x={pin.x + unit * 5}
                  y={pin.y - unit * 2.9}
                  fill="#ffffff"
                  fontSize={unit * 3.4}
                  fontFamily="var(--font-mono), monospace"
                >
                  {text}
                </text>
              </g>
            ) : null}
          </g>
        );
      })}
    </svg>
  );
}
