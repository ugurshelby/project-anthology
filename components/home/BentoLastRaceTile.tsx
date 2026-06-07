import Link from 'next/link';
import type { LastRaceRecap } from '@/lib/f1/mrdata';

interface BentoLastRaceTileProps {
  recap: LastRaceRecap | null;
}

function driverShort(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 0) return '—';
  const code = parts.map((p) => p[0]).join('').toUpperCase();
  if (parts.length === 1) return parts[0].slice(0, 3).toUpperCase();
  return `${parts[0][0]}${parts[parts.length - 1].slice(0, 2)}`.toUpperCase();
}

export function BentoLastRaceTile({ recap }: BentoLastRaceTileProps) {
  if (!recap) {
    return (
      <div className="bento-panel bento-tile-fill justify-center p-3 lg:p-6">
        <p className="font-mono text-xs" style={{ color: 'var(--muted)' }}>
          No recent race results yet.
        </p>
      </div>
    );
  }

  const winner = recap.podium[0];

  return (
    <Link href="/season" className="bento-panel bento-tile-fill justify-between p-3 lg:p-5">
      <div>
        <p
          className="mb-1 font-condensed text-[9px] uppercase tracking-[0.2em] lg:mb-4 lg:text-[11px]"
          style={{ color: 'var(--muted)' }}
        >
          Last Race · {recap.raceName}
        </p>
        {winner ? (
          <div className="hidden items-end gap-3 lg:flex">
            <span
              className="shrink-0 font-display text-5xl leading-none"
              style={{ color: 'var(--accent)' }}
            >
              P{winner.position}
            </span>
            <div className="min-w-0">
              <p
                className="font-display text-lg leading-tight tracking-[0.04em] xl:text-xl"
                style={{ color: 'var(--paper)' }}
              >
                {winner.driverName.toUpperCase()}
              </p>
              <p
                className="mt-1 font-condensed text-[10px] uppercase tracking-[0.12em]"
                style={{ color: 'var(--muted)' }}
              >
                {winner.constructorName}
              </p>
            </div>
          </div>
        ) : null}
      </div>

      <div className="mt-2 space-y-2 lg:mt-4 lg:space-y-3">
        {recap.podium.map((row) => {
          const isWinner = row.position === '1';
          return (
            <div
              key={row.position + row.driverName}
              className={`flex items-center justify-between border-b pb-2 font-mono text-[10px] lg:text-xs ${
                isWinner ? 'lg:hidden' : ''
              }`}
              style={{ borderColor: 'var(--border)' }}
            >
              <span style={{ color: isWinner ? 'var(--accent)' : 'var(--muted)' }}>
                P{row.position}
              </span>
              <span
                className="min-w-0 flex-1 truncate px-2 font-condensed uppercase tracking-wider lg:font-display lg:text-base lg:tracking-[0.04em]"
                style={{ color: 'var(--paper)' }}
              >
                <span className="lg:hidden">{driverShort(row.driverName)}</span>
                <span className="hidden lg:inline">{row.driverName.toUpperCase()}</span>
              </span>
              <span className="hidden shrink-0 lg:inline" style={{ color: 'var(--muted)' }}>
                {row.constructorName}
              </span>
            </div>
          );
        })}
      </div>
    </Link>
  );
}
