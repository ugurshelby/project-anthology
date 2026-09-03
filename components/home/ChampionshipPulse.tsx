import Link from 'next/link';
import { resolveTeamUiColor } from '@/config/team-colors';
import { DriverLeaderCard } from '@/components/standings/StandingsLeaderCard';
import type { DriverStandingRow, ConstructorStandingRow } from '@/lib/f1/mrdata';

export function ChampionshipPulse({
  drivers,
  constructors,
  season,
}: {
  drivers: DriverStandingRow[];
  constructors: ConstructorStandingRow[];
  season: number;
}) {
  const [leader, ...rest] = drivers;
  const leaderPts = Number(leader?.points) || 0;
  const chasing = rest.slice(0, 4);
  const topConstructors = constructors.slice(0, 3);
  const constructorLead = Number(topConstructors[0]?.points) || 1;

  return (
    <div className="flex h-full flex-col gap-4">
      <div className="flex items-baseline justify-between gap-2">
        <h2 className="label-caps text-text-mid">Championship Pulse</h2>
        <Link href="/season" className="label-caps text-accent">
          Full →
        </Link>
      </div>

      {leader ? <DriverLeaderCard row={leader} season={season} /> : (
        <p className="body-md text-text-mid">Standings unavailable.</p>
      )}

      <div className="flex flex-col">
        {chasing.map((row) => {
          const pts = Number(row.points) || 0;
          const delta = leaderPts - pts;
          const color = resolveTeamUiColor(undefined, row.constructorName);
          const width = leaderPts > 0 ? Math.max(8, (pts / leaderPts) * 100) : 8;
          return (
            <Link
              key={row.driverId}
              href={`/drivers/${row.driverId}`}
              className="flex flex-col gap-1 border-b border-hairline py-2 last:border-b-0"
            >
              <div className="flex items-baseline justify-between gap-2">
                <span
                  className="min-w-0 truncate font-condensed text-sm font-700 uppercase text-text-hi"
                  style={{ fontFamily: 'var(--font-condensed)' }}
                >
                  P{row.position} {row.driverName}
                </span>
                <span className="font-mono shrink-0 text-xs text-zinc-500">+{delta} PTS</span>
              </div>
              <div className="h-1 overflow-hidden rounded-full bg-white/[0.06]">
                <span className="block h-full" style={{ width: `${width}%`, backgroundColor: color }} />
              </div>
            </Link>
          );
        })}
      </div>

      {topConstructors.length > 0 ? (
        <div className="mt-auto flex flex-col gap-2">
          <span className="label-caps text-zinc-500">Constructors</span>
          {topConstructors.map((row) => {
            const pts = Number(row.points) || 0;
            const width = Math.max(8, (pts / constructorLead) * 100);
            const color = resolveTeamUiColor(undefined, row.constructorName);
            return (
              <Link
                key={row.constructorId}
                href={`/teams/${row.constructorId}`}
                className="flex flex-col gap-1"
              >
                <div className="flex justify-between gap-2">
                  <span className="truncate font-mono text-[11px] uppercase text-zinc-300">{row.constructorName}</span>
                  <span className="font-mono text-[11px] text-zinc-500">{row.points}</span>
                </div>
                <div className="h-1 overflow-hidden rounded-full bg-white/[0.06]">
                  <span className="block h-full" style={{ width: `${width}%`, backgroundColor: color }} />
                </div>
              </Link>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}
