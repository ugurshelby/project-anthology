import Link from 'next/link';
import Image from 'next/image';
import { driverIconSrc } from '@/lib/assets/f1-icons';
import { resolveTeamUiColor } from '@/config/team-colors';
import type { DriverGridRow } from '@/lib/data/entities';

export function GridDriverStandings({
  rows,
  season,
}: {
  rows: DriverGridRow[];
  season: number;
}) {
  return (
    <ol className="flex flex-col overflow-hidden rounded-[var(--radius-lg)] border border-hairline">
      {rows.map((row) => {
        const color = resolveTeamUiColor(undefined, row.constructorName);
        const portrait = driverIconSrc(row.driverCode, row.driverId, season);
        const number = row.carNumber ?? row.position;
        return (
          <li key={row.driverId} className="border-b border-hairline last:border-b-0">
            <Link
              href={`/drivers/${row.driverId}`}
              className="group relative flex items-center gap-3 overflow-hidden px-3 py-2.5 md:gap-4 md:px-4 md:py-3"
            >
              <span
                aria-hidden
                className="pointer-events-none absolute inset-y-0 left-0 w-0.5"
                style={{ backgroundColor: color }}
              />
              <span className="data-tabular w-8 shrink-0 text-sm text-zinc-500 md:w-10 md:text-base">
                P{row.position}
              </span>
              <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-[var(--radius-chip)] bg-surface md:h-14 md:w-14">
                <span
                  aria-hidden
                  className="hero-number pointer-events-none absolute inset-0 z-0 flex items-center justify-center text-2xl text-white/10"
                >
                  {number}
                </span>
                {portrait ? (
                  <Image
                    src={portrait}
                    alt=""
                    fill
                    sizes="56px"
                    className="relative z-[1] object-contain object-top"
                  />
                ) : null}
              </div>
              <div className="min-w-0 flex-1">
                <span
                  className="block truncate font-condensed text-lg font-700 uppercase leading-tight text-text-hi"
                  style={{ fontFamily: 'var(--font-condensed)' }}
                >
                  {row.driverName}
                </span>
                <span className="data-tabular text-xs text-zinc-500">{row.constructorName}</span>
              </div>
              <span className="data-tabular shrink-0 text-text-hi">{row.points} PTS</span>
            </Link>
          </li>
        );
      })}
    </ol>
  );
}
