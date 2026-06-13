import Link from 'next/link';
import { AnimatedBar, AnimatedBarGroup } from '@/components/ui/AnimatedBar';
import { resolveTeamUiColor } from '@/config/team-colors';
import { teamIconSrc } from '@/lib/assets/f1-icons';
import { SafeImage } from '@/components/ui/SafeImage';
import type { ConstructorStandingRow } from '@/lib/f1/mrdata';

interface BentoConstructorsTileProps {
  constructors: ConstructorStandingRow[];
  season: number;
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

export function BentoConstructorsTile({ constructors, season }: BentoConstructorsTileProps) {
  const top = constructors.slice(0, 3);
  const maxPts = top.reduce((m, c) => Math.max(m, Number(c.points) || 0), 0);

  if (top.length === 0) {
    return (
      <div className="bento-panel bento-tile-fill justify-center p-3 lg:p-6">
        <p className="font-mono text-xs" style={{ color: 'var(--muted)' }}>
          Constructor standings pending.
        </p>
      </div>
    );
  }

  return (
    <div className="bento-panel bento-tile-fill flex flex-col">
      <span
        className="mb-3 block shrink-0 px-3 pt-3 font-condensed text-[9px] uppercase tracking-[0.2em] lg:mb-4 lg:px-5 lg:pt-5 lg:text-[11px]"
        style={{ color: 'var(--muted)' }}
      >
        Constructors Ranking
      </span>

      <AnimatedBarGroup className="flex min-h-0 flex-1 flex-col px-3 lg:px-5">
      {/* Mobile / tablet: horizontal bars with team logos */}
      <div className="flex flex-1 flex-col justify-center gap-3 lg:hidden">
        {top.map((row, index) => {
          const color = resolveTeamUiColor(null, row.constructorName);
          const pct = maxPts > 0 ? (Number(row.points) / maxPts) * 100 : 0;
          const logoSrc = teamIconSrc(row.constructorName, season);
          const rowClass = 'flex items-center gap-2 transition-opacity hover:opacity-90';
          const rowInner = (
            <>
              <span className="w-3 font-mono text-[10px]" style={{ color: 'var(--muted)' }}>
                {row.position}
              </span>
              {logoSrc ? (
                <SafeImage
                  src={logoSrc}
                  alt=""
                  width={24}
                  height={24}
                  className="h-6 w-6 shrink-0 object-contain opacity-90"
                />
              ) : (
                <div
                  className="flex h-6 w-6 items-center justify-center text-[8px] font-bold"
                  style={{ backgroundColor: color, color: '#000' }}
                >
                  {teamAbbr(row.constructorName)}
                </div>
              )}
              <div className="flex min-w-0 flex-1 flex-col gap-1">
                <div className="flex items-center justify-between gap-2">
                  <span
                    className="truncate font-display text-xs tracking-[0.04em]"
                    style={{ color: 'var(--paper)' }}
                  >
                    {row.constructorName.split(' ')[0]?.toUpperCase() ?? row.constructorName}
                  </span>
                  <span className="font-mono text-[10px]" style={{ color: 'var(--paper)' }}>
                    {row.points}
                  </span>
                </div>
                <AnimatedBar
                  barSize={`${pct}%`}
                  color={color}
                  index={index}
                  axis="horizontal"
                />
              </div>
            </>
          );

          if (row.constructorId) {
            return (
              <Link
                key={row.constructorName}
                href={`/teams/${row.constructorId}?season=${season}`}
                className={rowClass}
                aria-label={`${row.constructorName}, ${row.points} points — view profile`}
              >
                {rowInner}
              </Link>
            );
          }

          return (
            <div key={row.constructorName} className={rowClass}>
              {rowInner}
            </div>
          );
        })}
      </div>

      {/* Desktop: vertical bar chart with team logos */}
      <div className="hidden min-h-0 flex-1 items-end justify-between gap-2 lg:flex">
        {top.map((row, index) => {
          const color = resolveTeamUiColor(null, row.constructorName);
          const pts = Number(row.points) || 0;
          const barPx =
            maxPts > 0 ? Math.max(16, Math.round((pts / maxPts) * 72)) : 16;
          const logoSrc = teamIconSrc(row.constructorName, season);
          const colClass =
            'relative flex h-full min-w-0 flex-1 flex-col items-center justify-end gap-1.5 transition-opacity hover:opacity-90';
          const colInner = (
            <>
              {logoSrc ? (
                <SafeImage
                  src={logoSrc}
                  alt=""
                  width={40}
                  height={40}
                  className="pointer-events-none absolute bottom-10 h-10 w-10 object-contain opacity-[0.12]"
                />
              ) : null}
              <span className="font-mono text-xs leading-none" style={{ color: 'var(--paper)' }}>
                {row.points}
              </span>
              <AnimatedBar
                barSize={`${barPx}px`}
                color={color}
                index={index}
                axis="vertical"
              />
              {logoSrc ? (
                <SafeImage
                  src={logoSrc}
                  alt=""
                  width={28}
                  height={28}
                  className="h-7 w-7 object-contain opacity-90"
                />
              ) : (
                <span
                  className="font-condensed text-[10px] uppercase tracking-[0.12em]"
                  style={{ color: 'var(--muted)' }}
                >
                  {teamAbbr(row.constructorName)}
                </span>
              )}
            </>
          );

          if (row.constructorId) {
            return (
              <Link
                key={row.constructorName}
                href={`/teams/${row.constructorId}?season=${season}`}
                className={colClass}
                aria-label={`${row.constructorName}, ${row.points} points — view profile`}
              >
                {colInner}
              </Link>
            );
          }

          return (
            <div key={row.constructorName} className={colClass}>
              {colInner}
            </div>
          );
        })}
      </div>
      </AnimatedBarGroup>

      <Link
        href="/season"
        className="shrink-0 border-t px-3 py-2 text-center font-condensed text-[9px] uppercase tracking-[0.12em] lg:px-5 lg:py-2.5 lg:text-[10px]"
        style={{ borderColor: 'var(--border)', color: 'var(--muted)' }}
      >
        Full season →
      </Link>
    </div>
  );
}
