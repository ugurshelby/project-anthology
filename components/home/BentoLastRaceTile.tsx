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
      <div className="bento-panel flex min-h-[140px] flex-col justify-center p-3 lg:p-6">
        <p className="font-mono text-xs" style={{ color: 'var(--muted)' }}>
          No recent race results yet.
        </p>
      </div>
    );
  }

  const winner = recap.podium[0];

  return (
    <Link href="/season" className="bento-panel flex min-h-[140px] flex-col justify-between p-3 lg:p-6">
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
              className="font-display text-5xl leading-none"
              style={{ color: 'var(--accent)' }}
            >
              P{winner.position}
            </span>
            <div>
              <p className="font-display text-xl tracking-[0.04em]" style={{ color: 'var(--paper)' }}>
                {winner.driverName.toUpperCase()}
              </p>
            </div>
          </div>
        ) : null}
      </div>

      <div className="mt-2 space-y-2 lg:mt-0 lg:space-y-3">
        {recap.podium.map((row) => (
          <div
            key={row.position + row.driverName}
            className="flex items-center justify-between border-b pb-2 font-mono text-[10px] lg:text-xs"
            style={{ borderColor: 'var(--border)' }}
          >
            <span style={{ color: row.position === '1' ? 'var(--accent)' : 'var(--muted)' }}>
              P{row.position}
            </span>
            <span
              className="font-condensed uppercase tracking-wider lg:font-display lg:text-base lg:tracking-[0.04em]"
              style={{ color: 'var(--paper)' }}
            >
              <span className="lg:hidden">{driverShort(row.driverName)}</span>
              <span className="hidden lg:inline">{row.driverName.toUpperCase()}</span>
            </span>
            <span className="hidden lg:inline" style={{ color: 'var(--muted)' }}>
              {row.constructorName}
            </span>
          </div>
        ))}
      </div>
    </Link>
  );
}
