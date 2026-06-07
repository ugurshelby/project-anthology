import Link from 'next/link';
import { resolveTeamUiColor } from '@/config/team-colors';
import type { ConstructorStandingRow } from '@/lib/f1/mrdata';

interface BentoConstructorsTileProps {
  constructors: ConstructorStandingRow[];
}

function teamAbbr(name: string): string {
  const words = name.split(/\s+/).filter(Boolean);
  if (words.length === 0) return '—';
  if (words.length === 1) return words[0].slice(0, 3).toUpperCase();
  return words
    .slice(0, 2)
    .map((w) => w[0])
    .join('')
    .toUpperCase();
}

export function BentoConstructorsTile({ constructors }: BentoConstructorsTileProps) {
  const top = constructors.slice(0, 3);
  const maxPts = top.reduce((m, c) => Math.max(m, Number(c.points) || 0), 0);

  if (top.length === 0) {
    return (
      <div className="bento-panel flex min-h-[140px] flex-col justify-center p-3 lg:p-6">
        <p className="font-mono text-xs" style={{ color: 'var(--muted)' }}>
          Constructor standings pending.
        </p>
      </div>
    );
  }

  return (
    <Link href="/season" className="bento-panel flex min-h-[140px] flex-col p-3 lg:min-h-[220px] lg:p-6">
      <span
        className="mb-3 block shrink-0 font-condensed text-[9px] uppercase tracking-[0.2em] lg:mb-4 lg:text-[11px]"
        style={{ color: 'var(--muted)' }}
      >
        Constructors Ranking
      </span>

      {/* Mobile / tablet: horizontal bars */}
      <div className="flex flex-col gap-3 lg:hidden">
        {top.map((row) => {
          const color = resolveTeamUiColor(null, row.constructorName);
          const pct = maxPts > 0 ? (Number(row.points) / maxPts) * 100 : 0;
          return (
            <div key={row.constructorName} className="flex items-center gap-2">
              <span className="w-3 font-mono text-[10px]" style={{ color: 'var(--muted)' }}>
                {row.position}
              </span>
              <div
                className="flex h-6 w-6 items-center justify-center text-[8px] font-bold"
                style={{ backgroundColor: color, color: '#000' }}
              >
                {teamAbbr(row.constructorName)}
              </div>
              <div className="flex flex-1 flex-col gap-1">
                <div className="flex items-center justify-between">
                  <span className="font-display text-xs tracking-[0.04em]" style={{ color: 'var(--paper)' }}>
                    {row.constructorName.split(' ')[0]?.toUpperCase() ?? row.constructorName}
                  </span>
                  <span className="font-mono text-[10px]" style={{ color: 'var(--paper)' }}>
                    {row.points}
                  </span>
                </div>
                <div className="h-1.5 w-full" style={{ backgroundColor: 'rgba(255,255,255,0.06)' }}>
                  <div className="h-full" style={{ width: `${pct}%`, backgroundColor: color }} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Desktop: vertical bar chart — bars grow upward from bottom, title stays clear */}
      <div className="hidden min-h-[100px] flex-1 items-end justify-between gap-3 lg:flex">
        {top.map((row) => {
          const color = resolveTeamUiColor(null, row.constructorName);
          const pts = Number(row.points) || 0;
          const barPx =
            maxPts > 0 ? Math.max(16, Math.round((pts / maxPts) * 72)) : 16;
          return (
            <div
              key={row.constructorName}
              className="flex h-full min-w-0 flex-1 flex-col items-center justify-end gap-1.5"
            >
              <span className="font-mono text-xs leading-none" style={{ color: 'var(--paper)' }}>
                {row.points}
              </span>
              <div
                className="w-full"
                style={{
                  height: `${barPx}px`,
                  backgroundColor: color,
                }}
              />
              <span
                className="font-condensed text-[10px] uppercase tracking-[0.12em]"
                style={{ color: 'var(--muted)' }}
              >
                {teamAbbr(row.constructorName)}
              </span>
            </div>
          );
        })}
      </div>
    </Link>
  );
}
