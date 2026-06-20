import Link from 'next/link';
import { resolveTeamUiColor } from '@/config/team-colors';
import { driverIconSrc, teamIconSrc } from '@/lib/assets/f1-icons';
import { SafeImage } from '@/components/ui/SafeImage';
import type { DriverStandingRow } from '@/lib/f1/mrdata';

interface BentoStandingsTileProps {
  standings: DriverStandingRow[];
  currentRound: number;
  totalRounds: number;
  season: number;
}

function driverCode(row: DriverStandingRow): string {
  if (row.driverCode) return row.driverCode.toUpperCase();
  const parts = row.driverName.trim().split(/\s+/);
  if (parts.length < 2) return parts[0]?.slice(0, 3).toUpperCase() ?? '—';
  return `${parts[0][0]}${parts[parts.length - 1].slice(0, 2)}`.toUpperCase();
}

export function BentoStandingsTile({
  standings,
  currentRound,
  totalRounds,
  season,
}: BentoStandingsTileProps) {
  const top = standings.slice(0, 10);
  const leaderPts = Number(standings[0]?.points) || 0;

  if (top.length === 0) {
    return (
      <div className="bento-panel bento-tile-fill justify-center p-4">
        <p className="font-mono text-xs" style={{ color: 'var(--muted)' }}>
          Standings sync pending.
        </p>
      </div>
    );
  }

  return (
    <div className="bento-panel bento-tile-fill">
      <div
        className="flex shrink-0 items-center justify-between border-b px-3 py-2.5 lg:px-4 lg:py-3"
        style={{ borderColor: 'var(--border)' }}
      >
        <h3
          className="font-display text-sm tracking-[0.04em] lg:text-base"
          style={{ color: 'var(--paper)' }}
        >
          Drivers Standings
        </h3>
        <span className="font-mono text-[9px] lg:text-[10px]" style={{ color: 'var(--muted)' }}>
          R{currentRound}/{totalRounds}
        </span>
      </div>

      <div className="custom-scrollbar bento-standings-scroll min-h-0 flex-1 px-2 py-2 lg:px-3">
        <div className="space-y-1">
          {top.map((row) => {
            const color = resolveTeamUiColor(null, row.constructorName);
            const pct =
              leaderPts > 0 ? Math.max(8, (Number(row.points) / leaderPts) * 100) : 8;
            const driverSrc = driverIconSrc(row.driverCode, row.driverName, season);
            const teamSrc = teamIconSrc(row.constructorName, season);

            const rowClass =
              'flex h-10 items-center gap-1.5 px-1.5 transition-colors lg:h-11 lg:gap-2 lg:px-2';
            const rowStyle = {
              borderLeft: `3px solid ${color}`,
              backgroundColor: `color-mix(in srgb, ${color} 8%, #0e0e0e)`,
            };
            const rowInner = (
              <>
                <span
                  className="w-5 font-mono text-[9px] lg:w-6 lg:text-[10px]"
                  style={{ color: 'var(--muted)' }}
                >
                  {row.position.padStart(2, '0')}
                </span>
                {driverSrc ? (
                  <SafeImage
                    src={driverSrc}
                    alt=""
                    width={18}
                    height={18}
                    className="h-4 w-4 shrink-0 object-contain lg:h-5 lg:w-5"
                  />
                ) : null}
                <span
                  className="w-8 font-condensed text-[11px] tracking-wider lg:w-9 lg:text-xs"
                  style={{ color: 'var(--paper)' }}
                >
                  {driverCode(row)}
                </span>
                <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                  <div className="flex items-center justify-between gap-1">
                    <span className="flex min-w-0 items-center gap-1">
                      {teamSrc ? (
                        <SafeImage
                          src={teamSrc}
                          alt=""
                          width={12}
                          height={12}
                          className="h-3 w-3 shrink-0 object-contain opacity-80"
                        />
                      ) : null}
                      <span
                        className="truncate font-condensed text-[8px] uppercase tracking-wider lg:text-[9px]"
                        style={{ color: 'var(--muted)' }}
                      >
                        {row.constructorName}
                      </span>
                    </span>
                    <span
                      className="shrink-0 font-mono text-[10px] font-medium lg:text-xs"
                      style={{ color: 'var(--paper)' }}
                    >
                      {row.points}
                    </span>
                  </div>
                  <div className="h-0.5 w-full" style={{ backgroundColor: 'rgba(255,255,255,0.06)' }}>
                    <div className="h-full" style={{ width: `${pct}%`, backgroundColor: color }} />
                  </div>
                </div>
              </>
            );

            if (row.driverId) {
              return (
                <Link
                  key={row.position + row.driverName}
                  href={`/drivers/${row.driverId}?season=${season}`}
                  className={rowClass}
                  style={rowStyle}
                  aria-label={`${row.driverName}, ${row.constructorName}, ${row.points} points — view profile`}
                >
                  {rowInner}
                </Link>
              );
            }

            return (
              <div key={row.position + row.driverName} className={rowClass} style={rowStyle}>
                {rowInner}
              </div>
            );
          })}
        </div>
      </div>

      <Link
        href="/season"
        className="shrink-0 border-t px-3 py-2 text-center font-condensed text-[9px] uppercase tracking-[0.12em] lg:py-2.5 lg:text-[10px]"
        style={{ borderColor: 'var(--border)', color: 'var(--muted)' }}
      >
        Full season →
      </Link>
    </div>
  );
}
