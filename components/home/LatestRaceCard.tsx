import Link from 'next/link';
import { resolveTeamUiColor } from '@/config/team-colors';
import { driverIconSrc } from '@/lib/assets/f1-icons';
import { DriverAvatar } from '@/components/bento/DriverAvatar';
import type { LastRaceRecap } from '@/lib/f1/mrdata';

const MEDAL: Record<1 | 2 | 3, string> = {
  1: '#d4a441',
  2: '#a8a8a8',
  3: '#a3653f',
};

/**
 * Latest Race panel — podium + fastest lap, mirrors mobile's RaceWeekendBanner
 * "last race" card but as a bento tile with a team-tinted P1 spotlight row.
 */
export function LatestRaceCard({ recap, season }: { recap: LastRaceRecap; season: number }) {
  const winner = recap.podium.find((p) => p.position === '1');
  const winnerColor = winner ? resolveTeamUiColor(undefined, winner.constructorName) : undefined;
  const winnerPortrait = winner ? driverIconSrc(winner.driverCode, winner.driverName, season) : null;

  return (
    <div className="flex h-full flex-col gap-4">
      <div className="flex items-baseline justify-between gap-2">
        <span className="label-caps text-text-mid">Latest Race</span>
        <span className="label-caps text-text-low">Round {recap.round}</span>
      </div>
      <span className="font-condensed text-xl font-600 uppercase leading-tight text-text-hi" style={{ fontFamily: 'var(--font-condensed)' }}>
        {recap.raceName}
      </span>

      {winner ? (
        <div
          className="relative flex items-center gap-3 overflow-hidden rounded-[var(--radius)] p-3"
          style={{ background: `linear-gradient(120deg, color-mix(in srgb, ${winnerColor} 22%, transparent), transparent 75%)` }}
        >
          {winnerPortrait ? (
            <DriverAvatar
              driverName={winner.driverName}
              driverCode={winner.driverCode}
              season={season}
              constructorName={winner.constructorName}
              size={44}
            />
          ) : null}
          <div className="flex min-w-0 flex-col">
            <span className="label-caps" style={{ color: MEDAL[1] }}>Winner</span>
            <span className="font-condensed truncate text-lg font-700 uppercase leading-none text-text-hi" style={{ fontFamily: 'var(--font-condensed)' }}>
              {winner.driverName}
            </span>
            <span className="data-tabular text-text-mid" style={{ color: winnerColor }}>{winner.constructorName}</span>
          </div>
        </div>
      ) : null}

      <div className="flex flex-col gap-1.5">
        {recap.podium
          .filter((p) => p.position !== '1')
          .map((p) => (
            <div key={p.position} className="flex items-center gap-3 border-b border-hairline py-1.5 last:border-b-0">
              <span
                className="data-tabular w-5 shrink-0 text-right font-700"
                style={{ color: MEDAL[Number(p.position) as 2 | 3] ?? undefined }}
              >
                P{p.position}
              </span>
              <span className="font-condensed min-w-0 flex-1 truncate text-sm font-600 uppercase text-text-hi" style={{ fontFamily: 'var(--font-condensed)' }}>
                {p.driverName}
              </span>
              <span className="data-tabular shrink-0 text-xs text-text-low">{p.constructorName}</span>
            </div>
          ))}
      </div>

      {recap.fastestLapDriver ? (
        <span className="label-caps text-text-low">
          Fastest Lap · {recap.fastestLapDriver}
          {recap.fastestLapTime ? ` · ${recap.fastestLapTime}` : ''}
        </span>
      ) : null}

      <Link
        href={`/season/${season}/round/${recap.round}`}
        className="label-caps mt-auto text-accent transition-opacity hover:opacity-80"
      >
        Full results →
      </Link>
    </div>
  );
}
