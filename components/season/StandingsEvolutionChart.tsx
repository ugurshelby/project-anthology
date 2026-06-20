'use client';

/**
 * SVG-based cumulative points evolution chart.
 * Renders top-N drivers across race rounds — no external charting dependency.
 * Data shape: { driverName, constructorName, rounds: [{round, pts}][] }
 * If roundData is empty or has <2 rounds, renders nothing (graceful).
 */

import { useEffect, useRef, useState } from 'react';
import { usePrefersReducedMotion } from '@/components/ui/usePrefersReducedMotion';
import { resolveTeamUiColor } from '@/config/team-colors';

export interface EvolutionSeries {
  driverName: string;
  driverCode: string;
  constructorName: string;
  /** [round, cumulative points] — must be sorted by round asc */
  data: [number, number][];
}

interface StandingsEvolutionChartProps {
  series: EvolutionSeries[];
}

const W = 600;
const H = 200;
const PAD = { top: 16, right: 48, bottom: 24, left: 32 };

function polyline(points: [number, number][]): string {
  return points.map(([x, y]) => `${x.toFixed(1)},${y.toFixed(1)}`).join(' ');
}

export function StandingsEvolutionChart({ series }: StandingsEvolutionChartProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);
  const [revealed, setRevealed] = useState(false);
  const reducedMotion = usePrefersReducedMotion();

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          setInView(true);
          obs.disconnect();
        }
      },
      { threshold: 0.2 },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  useEffect(() => {
    if (!inView) return;
    if (reducedMotion) {
      setRevealed(true);
      return;
    }
    const id = setTimeout(() => setRevealed(true), 80);
    return () => clearTimeout(id);
  }, [inView, reducedMotion]);

  if (series.length === 0) return null;

  const allRounds = Array.from(new Set(series.flatMap((s) => s.data.map(([r]) => r)))).sort(
    (a, b) => a - b,
  );
  if (allRounds.length < 2) return null;

  const maxPts = Math.max(...series.flatMap((s) => s.data.map(([, p]) => p)), 1);
  const minRound = allRounds[0]!;
  const maxRound = allRounds[allRounds.length - 1]!;
  const chartW = W - PAD.left - PAD.right;
  const chartH = H - PAD.top - PAD.bottom;

  function toX(round: number) {
    return PAD.left + ((round - minRound) / (maxRound - minRound)) * chartW;
  }
  function toY(pts: number) {
    return PAD.top + chartH - (pts / maxPts) * chartH;
  }

  return (
    <div ref={containerRef}>
      <svg
        ref={svgRef}
        viewBox={`0 0 ${W} ${H}`}
        className="w-full"
        style={{ maxHeight: 220 }}
        role="img"
        aria-label="Championship points evolution"
      >
        {/* Grid lines */}
        {[0.25, 0.5, 0.75, 1].map((f) => (
          <line
            key={f}
            x1={PAD.left}
            x2={W - PAD.right}
            y1={PAD.top + chartH * (1 - f)}
            y2={PAD.top + chartH * (1 - f)}
            stroke="rgba(255,255,255,0.06)"
            strokeWidth={1}
          />
        ))}

        {/* Series lines */}
        {series.map((s) => {
          const color = resolveTeamUiColor(null, s.constructorName);
          const pts = s.data.map(([r, p]) => [toX(r), toY(p)] as [number, number]);
          if (pts.length === 0) return null;
          const lastPt = pts[pts.length - 1]!;

          return (
            <g key={s.driverName}>
              <polyline
                points={polyline(pts)}
                fill="none"
                stroke={color}
                strokeWidth={1.5}
                strokeLinejoin="round"
                strokeLinecap="round"
                opacity={revealed ? 0.85 : 0}
                style={{
                  transition: reducedMotion ? 'none' : 'opacity 400ms ease',
                }}
              />
              {/* End label */}
              {revealed ? (
                <text
                  x={lastPt[0] + 4}
                  y={lastPt[1] + 4}
                  fill={color}
                  fontSize={9}
                  fontFamily="'IBM Plex Mono', monospace"
                  opacity={0.9}
                >
                  {s.driverCode.toUpperCase()}
                </text>
              ) : null}
            </g>
          );
        })}

        {/* Round axis labels */}
        {allRounds
          .filter((_, i) => i % Math.max(1, Math.floor(allRounds.length / 6)) === 0)
          .map((r) => (
            <text
              key={r}
              x={toX(r)}
              y={H - 4}
              textAnchor="middle"
              fill="rgba(244,241,234,0.3)"
              fontSize={8}
              fontFamily="'IBM Plex Mono', monospace"
            >
              R{r}
            </text>
          ))}
      </svg>
    </div>
  );
}
