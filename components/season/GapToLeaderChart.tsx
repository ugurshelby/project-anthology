'use client';

import { useEffect, useRef, useState } from 'react';
import { usePrefersReducedMotion } from '@/components/ui/usePrefersReducedMotion';
import { resolveTeamUiColor } from '@/config/team-colors';
import type { DriverStandingRow } from '@/lib/f1/mrdata';

interface GapToLeaderChartProps {
  standings: DriverStandingRow[];
  maxRows?: number;
}

export function GapToLeaderChart({ standings, maxRows = 10 }: GapToLeaderChartProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);
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
      { threshold: 0.15 },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  const rows = standings.slice(0, maxRows);
  if (rows.length === 0) return null;

  const leaderPts = Number(rows[0]?.points ?? 0);
  if (leaderPts === 0) return null;

  return (
    <div ref={containerRef} className="space-y-2">
      {rows.map((row, i) => {
        const pts = Number(row.points ?? 0);
        const gap = leaderPts - pts;
        const pct = leaderPts > 0 ? (pts / leaderPts) * 100 : 0;
        const color = resolveTeamUiColor(null, row.constructorName);
        const isLeader = i === 0;
        const shouldAnimate = inView && !reducedMotion;

        return (
          <div key={row.driverName} className="flex items-center gap-3">
            <span
              className="w-5 shrink-0 text-right font-mono text-[10px]"
              style={{ color: 'var(--muted)' }}
            >
              {row.position}
            </span>
            <span
              className="w-24 shrink-0 truncate font-condensed text-[11px] uppercase tracking-[0.08em]"
              style={{ color: isLeader ? 'var(--paper)' : 'var(--muted)' }}
            >
              {row.driverCode || row.driverName.split(' ').pop()}
            </span>
            <div className="relative flex-1" style={{ height: 8, backgroundColor: 'var(--surface)' }}>
              <div
                className="absolute inset-y-0 left-0"
                style={{
                  backgroundColor: color,
                  width: shouldAnimate ? `${pct}%` : reducedMotion ? `${pct}%` : '0%',
                  transition: shouldAnimate
                    ? `width 600ms cubic-bezier(0.4,0,0.2,1) ${i * 60}ms`
                    : 'none',
                }}
              />
            </div>
            <span
              className="w-12 shrink-0 text-right font-mono text-[10px] tabular-nums"
              style={{ color: isLeader ? color : 'var(--muted)' }}
            >
              {isLeader ? `${pts}` : gap > 0 ? `−${gap}` : `${pts}`}
            </span>
          </div>
        );
      })}
    </div>
  );
}
