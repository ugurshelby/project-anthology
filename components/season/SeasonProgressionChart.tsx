'use client';

import { useState, useId } from 'react';
import { resolveTeamUiColor } from '@/config/team-colors';
import type { DriverCumulativePoints } from '@/lib/f1/mrdata';

interface SeasonProgressionChartProps {
  series: DriverCumulativePoints[];
  season: number;
}

/**
 * Championship Progression Trajectory Chart (Apple-grade SVG line visualizer).
 * Visualizes cumulative points oscillation and title momentum across rounds.
 */
export function SeasonProgressionChart({ series, season }: SeasonProgressionChartProps) {
  const [hoveredDriver, setHoveredDriver] = useState<string | null>(null);
  const [activeRound, setActiveRound] = useState<number | null>(null);
  const chartId = useId();

  if (!series || series.length === 0) return null;

  // 1) Calculate domain bounds
  let maxRound = 1;
  let maxPoints = 10;

  for (const s of series) {
    for (const [r, pts] of s.data) {
      if (r > maxRound) maxRound = r;
      if (pts > maxPoints) maxPoints = pts;
    }
  }

  // Ensure minimum round count for aesthetic spacing
  maxRound = Math.max(maxRound, 2);
  const yCeil = Math.ceil(maxPoints / 50) * 50 || 100;

  // 2) Dimensions and Scales
  const width = 800;
  const height = 300;
  const padding = { top: 25, right: 30, bottom: 40, left: 45 };

  const innerWidth = width - padding.left - padding.right;
  const innerHeight = height - padding.top - padding.bottom;

  const scaleX = (r: number) => padding.left + ((r - 1) / (maxRound - 1)) * innerWidth;
  const scaleY = (pts: number) => padding.top + innerHeight - (pts / yCeil) * innerHeight;

  // Generate Y-axis grid ticks (4 steps)
  const yTicks = [0, Math.round(yCeil * 0.33), Math.round(yCeil * 0.66), yCeil];

  // Generate X-axis round points (at most 10 labels to avoid clutter)
  const roundStep = maxRound > 16 ? 2 : 1;
  const xTicks = Array.from({ length: maxRound }, (_, i) => i + 1).filter(
    (r) => r === 1 || r === maxRound || r % roundStep === 0,
  );

  // Helper for generating smooth cubic bezier path
  function buildCurvedPath(points: [number, number][]): string {
    if (points.length === 0) return '';
    if (points.length === 1) return `M ${scaleX(points[0][0])} ${scaleY(points[0][1])}`;

    const coords = points.map(([r, pts]) => ({ x: scaleX(r), y: scaleY(pts) }));
    let d = `M ${coords[0].x} ${coords[0].y}`;

    for (let i = 0; i < coords.length - 1; i++) {
      const curr = coords[i];
      const next = coords[i + 1];
      const cpX = (curr.x + next.x) / 2;
      d += ` C ${cpX} ${curr.y}, ${cpX} ${next.y}, ${next.x} ${next.y}`;
    }

    return d;
  }

  return (
    <div className="relative overflow-hidden rounded-[16px] border border-hairline bg-surface p-5 md:p-6">
      {/* Ambient background highlight */}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-accent/[0.03] blur-3xl"
      />

      {/* Header */}
      <div className="relative z-10 mb-5 flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <div>
          <div className="flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-accent" />
            <span className="label-caps text-accent tracking-widest text-[11px]">
              CHAMPIONSHIP TRAJECTORY · {season}
            </span>
          </div>
          <h3 className="font-condensed text-xl font-700 uppercase tracking-tight text-text-hi md:text-2xl">
            Puan İlerleme Eğrisi & Liderlik Salınımı
          </h3>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap items-center gap-2.5 sm:justify-end">
          {series.map((s) => {
            const teamColor = s.color || resolveTeamUiColor(undefined, s.constructorName);
            const isHovered = hoveredDriver === s.driverCode;
            const isFaded = hoveredDriver !== null && !isHovered;
            const finalPts = s.data.length > 0 ? s.data[s.data.length - 1][1] : 0;

            return (
              <button
                key={s.driverCode}
                type="button"
                onMouseEnter={() => setHoveredDriver(s.driverCode)}
                onMouseLeave={() => setHoveredDriver(null)}
                className={[
                  'group flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs transition-all duration-150',
                  isHovered
                    ? 'border-white/30 bg-white/10 text-text-hi shadow-sm'
                    : isFaded
                      ? 'border-hairline bg-white/[0.01] text-text-low opacity-40'
                      : 'border-hairline bg-white/[0.02] text-text-mid hover:border-white/20 hover:text-text-hi',
                ].join(' ')}
              >
                <span
                  className="h-2 w-2 rounded-full transition-transform duration-150 group-hover:scale-125"
                  style={{ backgroundColor: teamColor }}
                />
                <span className="font-mono font-600 uppercase tracking-wider">{s.driverCode}</span>
                <span className="data-tabular font-mono text-[11px] text-text-low">{finalPts}p</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Responsive SVG Chart */}
      <div className="relative w-full overflow-x-auto">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="h-auto w-full min-w-[580px] overflow-visible select-none"
          role="img"
          aria-label={`Season ${season} Driver Points Progression Chart`}
        >
          <defs>
            {series.map((s) => {
              const teamColor = s.color || resolveTeamUiColor(undefined, s.constructorName);
              return (
                <linearGradient
                  key={s.driverCode}
                  id={`grad-${chartId}-${s.driverCode}`}
                  x1="0"
                  y1="0"
                  x2="0"
                  y2="1"
                >
                  <stop offset="0%" stopColor={teamColor} stopOpacity="0.22" />
                  <stop offset="100%" stopColor={teamColor} stopOpacity="0.0" />
                </linearGradient>
              );
            })}
          </defs>

          {/* Horizontal Grid Lines & Y-Axis Labels */}
          {yTicks.map((tick) => {
            const y = scaleY(tick);
            return (
              <g key={tick}>
                <line
                  x1={padding.left}
                  y1={y}
                  x2={width - padding.right}
                  y2={y}
                  stroke="rgba(255, 255, 255, 0.06)"
                  strokeDasharray="4 4"
                />
                <text
                  x={padding.left - 8}
                  y={y + 3}
                  textAnchor="end"
                  className="fill-text-low font-mono text-[10px]"
                >
                  {tick}
                </text>
              </g>
            );
          })}

          {/* Vertical Round Markers & X-Axis Labels */}
          {xTicks.map((round) => {
            const x = scaleX(round);
            return (
              <g key={round}>
                <line
                  x1={x}
                  y1={padding.top}
                  x2={x}
                  y2={height - padding.bottom}
                  stroke="rgba(255, 255, 255, 0.04)"
                />
                <text
                  x={x}
                  y={height - padding.bottom + 16}
                  textAnchor="middle"
                  className="fill-text-low font-mono text-[10px]"
                >
                  R{round}
                </text>
              </g>
            );
          })}

          {/* Area Gradients & Curve Paths */}
          {series.map((s, idx) => {
            const isLead = idx === 0;
            const teamColor = s.color || resolveTeamUiColor(undefined, s.constructorName);
            const isHovered = hoveredDriver === s.driverCode;
            const isFaded = hoveredDriver !== null && !isHovered;
            const curve = buildCurvedPath(s.data);

            if (!curve) return null;

            // Area path closing to bottom axis
            const firstPt = s.data[0];
            const lastPt = s.data[s.data.length - 1];
            const areaPath = `${curve} L ${scaleX(lastPt[0])} ${scaleY(0)} L ${scaleX(firstPt[0])} ${scaleY(0)} Z`;

            return (
              <g key={s.driverCode} className="transition-opacity duration-200" opacity={isFaded ? 0.2 : 1}>
                {/* Subtle Area glow for leader or hovered */}
                {(isLead || isHovered) && (
                  <path
                    d={areaPath}
                    fill={`url(#grad-${chartId}-${s.driverCode})`}
                    className="pointer-events-none transition-opacity duration-200"
                    opacity={isHovered ? 1 : 0.6}
                  />
                )}

                {/* Main Trajectory Stroke */}
                <path
                  d={curve}
                  fill="none"
                  stroke={teamColor}
                  strokeWidth={isHovered ? 3.5 : isLead ? 2.5 : 2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="transition-all duration-150"
                  style={{
                    filter: isHovered ? `drop-shadow(0 0 6px ${teamColor})` : undefined,
                  }}
                />

                {/* Points / Data Knots */}
                {s.data.map(([r, pts]) => {
                  const cx = scaleX(r);
                  const cy = scaleY(pts);
                  const isPtActive = activeRound === r;

                  return (
                    <circle
                      key={`${s.driverCode}-${r}`}
                      cx={cx}
                      cy={cy}
                      r={isHovered || isPtActive ? 4.5 : 2.5}
                      fill={teamColor}
                      stroke="#0a0a0a"
                      strokeWidth={1.5}
                      className="cursor-pointer transition-transform duration-150"
                      onMouseEnter={() => {
                        setHoveredDriver(s.driverCode);
                        setActiveRound(r);
                      }}
                      onMouseLeave={() => {
                        setHoveredDriver(null);
                        setActiveRound(null);
                      }}
                    >
                      <title>{`${s.driverName} (${s.driverCode}): R${r} — ${pts} pts`}</title>
                    </circle>
                  );
                })}
              </g>
            );
          })}
        </svg>
      </div>

      {/* Footer Info */}
      <div className="mt-2 flex items-center justify-between border-t border-hairline pt-3 text-[11px] text-text-low font-mono">
        <span>FIA Points Trajectory (Top 5 Contenders)</span>
        <span>Standard Point Matrix (25-18-15...)</span>
      </div>
    </div>
  );
}
