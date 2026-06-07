import Link from 'next/link';
import { resolveTeamUiColor } from '@/config/team-colors';
import { driverIconSrc } from '@/lib/assets/f1-icons';
import { SafeImage } from '@/components/ui/SafeImage';
import type { DriverStandingRow } from '@/lib/f1/mrdata';

interface BentoStandingsTileProps {
  standings: DriverStandingRow[];
  currentRound: number;
  totalRounds: number;
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
}: BentoStandingsTileProps) {
  const top = standings.slice(0, 10);
  const mobileTop = standings.slice(0, 5);
  const leaderPts = Number(standings[0]?.points) || 0;

  if (top.length === 0) {
    return (
      <div className="bento-panel col-span-2 p-4 lg:col-span-1">
        <p className="font-mono text-xs" style={{ color: 'var(--muted)' }}>
          Standings sync pending.
        </p>
      </div>
    );
  }

  const rowList = (rows: DriverStandingRow[], showBars: boolean) =>
    rows.map((row) => {
      const color = resolveTeamUiColor(null, row.constructorName);
      const pct =
        leaderPts > 0 ? Math.max(8, (Number(row.points) / leaderPts) * 100) : 8;
      const iconSrc = driverIconSrc(row.driverCode, row.driverName);

      return (
        <div
          key={row.position + row.driverName}
          className="group flex items-center gap-2 p-2 transition-colors lg:gap-3 lg:p-3"
          style={{
            borderLeft: `4px solid ${color}`,
            backgroundColor: 'rgba(255,255,255,0.02)',
          }}
        >
          <span className="w-4 font-mono text-[10px] lg:w-8 lg:text-xs" style={{ color: 'var(--muted)' }}>
            {row.position.padStart(2, '0')}
          </span>
          {iconSrc ? (
            <SafeImage
              src={iconSrc}
              alt=""
              width={20}
              height={20}
              className="hidden h-5 w-5 object-contain lg:block"
            />
          ) : null}
          <span
            className="w-10 font-condensed text-sm tracking-wider lg:text-lg"
            style={{ color: 'var(--paper)' }}
          >
            {driverCode(row)}
          </span>
          <div className="flex min-w-0 flex-1 flex-col gap-1">
            <div className="flex items-center justify-between gap-2">
              <span
                className="truncate font-condensed text-[10px] uppercase tracking-wider lg:text-sm"
                style={{ color: 'var(--muted)' }}
              >
                {row.constructorName}
              </span>
              <span className="font-mono text-sm font-medium lg:text-base" style={{ color: 'var(--paper)' }}>
                {row.points}
              </span>
            </div>
            {showBars ? (
              <div className="h-1 w-full" style={{ backgroundColor: 'rgba(255,255,255,0.06)' }}>
                <div className="h-full" style={{ width: `${pct}%`, backgroundColor: color }} />
              </div>
            ) : null}
          </div>
        </div>
      );
    });

  return (
    <div className="bento-panel col-span-2 flex flex-col lg:col-span-1 lg:flex-grow">
      <div
        className="flex items-center justify-between border-b p-4 lg:p-6"
        style={{ borderColor: 'var(--border)' }}
      >
        <h3 className="font-display text-lg tracking-[0.04em] lg:text-xl" style={{ color: 'var(--paper)' }}>
          Drivers Standings
        </h3>
        <span className="font-mono text-[10px] lg:text-xs" style={{ color: 'var(--muted)' }}>
          R{currentRound} / {totalRounds}
        </span>
      </div>

      <div className="flex flex-col gap-3 p-3 lg:hidden">{rowList(mobileTop, true)}</div>

      <div className="custom-scrollbar hidden max-h-[600px] overflow-y-auto p-2 lg:block">
        <div className="space-y-1">{rowList(top, false)}</div>
      </div>

      <Link
        href="/season"
        className="mt-auto border-t p-3 text-center font-condensed text-[10px] uppercase tracking-[0.12em] lg:p-4"
        style={{ borderColor: 'var(--border)', color: 'var(--accent)' }}
      >
        Full season →
      </Link>
    </div>
  );
}
