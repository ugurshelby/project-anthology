import Link from 'next/link';
import { resolveTeamUiColor } from '@/config/team-colors';
import { DriverAvatar } from '@/components/bento/DriverAvatar';
import { DriverLeaderCard } from '@/components/standings/StandingsLeaderCard';
import type { DriverStandingRow } from '@/lib/f1/mrdata';

/**
 * Poster Dense flat standings — no card shell, hairline rows, min 44px touch targets.
 * P1 is broken out into a leader spotlight card above the flat list.
 */
export function FlatStandingsList({
  rows,
  season,
  limit = 8,
  avatarSize = 32,
}: {
  rows: DriverStandingRow[];
  season: number;
  limit?: number;
  avatarSize?: number;
}) {
  const [leader, ...rest] = rows;
  const visible = rest.slice(0, Math.max(0, limit - 1));
  const rowMinHeight = avatarSize >= 44 ? 'min-h-16' : 'min-h-11';

  return (
    <div className="flex flex-col gap-3">
      {leader ? <DriverLeaderCard row={leader} season={season} /> : null}
      <div className="flex flex-col">
      {visible.map((row) => {
        const teamColor = resolveTeamUiColor(undefined, row.constructorName);
        return (
          <Link
            key={row.driverId}
            href={`/drivers/${row.driverId}`}
            className={[rowMinHeight, 'flex items-center gap-3 border-b border-hairline py-2.5 transition-opacity duration-150 will-change-[opacity] last:border-b-0 hover:opacity-80'].join(' ')}
          >
            <span className="data-tabular w-5 shrink-0 text-right text-text-mid">{row.position}</span>
            <DriverAvatar
              driverName={row.driverName}
              driverCode={row.driverCode}
              driverId={row.driverId}
              constructorName={row.constructorName}
              season={season}
              size={avatarSize}
            />
            <span
              className="font-condensed min-w-0 flex-1 truncate text-lg font-600 uppercase tracking-tight text-text-hi"
              style={{ fontFamily: 'var(--font-condensed)' }}
            >
              {row.driverName}
            </span>
            <span aria-hidden className="h-4 w-0.5 shrink-0 rounded-full" style={{ backgroundColor: teamColor }} />
            <span className="data-tabular w-10 shrink-0 text-right text-text">{row.points}</span>
          </Link>
        );
      })}
      </div>
    </div>
  );
}
