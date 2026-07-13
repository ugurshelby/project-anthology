import Link from 'next/link';
import Image from 'next/image';
import { teamIconSrc, carSrc, driverIconSrc } from '@/lib/assets/f1-icons';
import { resolveTeamUiColor } from '@/config/team-colors';
import type { DriverGridRow, TeamDriverGroup } from '@/lib/data/entities';
import type { ConstructorStandingRow } from '@/lib/f1/mrdata';

/**
 * Driver card for the Grid page's "2 drivers beside their team" row. Large,
 * uncropped portrait (not the circular DriverAvatar) with a dominant team-color
 * wash — 2026-07 redesign superseding the smaller monogram-avatar card.
 */
export function DriverCard({ row, season }: { row: DriverGridRow; season: number }) {
  const color = resolveTeamUiColor(undefined, row.constructorName);
  const portrait = driverIconSrc(row.driverCode, row.driverId, season);
  return (
    <Link
      href={`/drivers/${row.driverId}`}
      className="group relative col-span-4 flex min-h-72 flex-col justify-end overflow-hidden rounded-[var(--radius-lg)] border border-hairline p-5 transition-[transform,opacity] duration-150 will-change-transform hover:-translate-y-0.5 hover:opacity-95 md:col-span-4 lg:col-span-4"
      style={{ background: `linear-gradient(160deg, color-mix(in srgb, ${color} 30%, transparent), var(--surface) 65%)` }}
    >
      <span aria-hidden className="absolute inset-x-0 top-0 h-1" style={{ backgroundColor: color }} />
      {portrait ? (
        <div className="pointer-events-none absolute inset-0 z-0">
          <Image
            src={portrait}
            alt=""
            fill
            sizes="(max-width: 768px) 100vw, 33vw"
            className="object-cover object-top"
            style={{
              maskImage: 'linear-gradient(to bottom, rgba(0,0,0,0.85) 40%, rgba(0,0,0,0.35) 85%, transparent 100%)',
              WebkitMaskImage: 'linear-gradient(to bottom, rgba(0,0,0,0.85) 40%, rgba(0,0,0,0.35) 85%, transparent 100%)',
            }}
          />
        </div>
      ) : null}
      <span
        aria-hidden
        className="pointer-events-none absolute inset-0 z-0"
        style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.75) 0%, transparent 55%)' }}
      />
      <span className="hero-number relative z-10 text-4xl" style={{ color: color + '80' }}>
        {row.carNumber ?? row.position}
      </span>
      <div className="relative z-10 mt-2 flex flex-col">
        <span className="font-condensed text-3xl font-700 uppercase leading-none text-text-hi" style={{ fontFamily: 'var(--font-condensed)' }}>
          {row.driverName}
        </span>
        <div className="data-tabular mt-2 flex justify-between text-text-mid">
          <span>P{row.position}</span>
          <span className="text-text-hi">{row.points} PTS</span>
        </div>
      </div>
    </Link>
  );
}

/** Constructor card for the Grid page's "1 team beside 2 drivers" row. */
export function TeamCard({ row }: { row: ConstructorStandingRow }) {
  const logo = teamIconSrc(row.constructorName);
  const car = carSrc(row.constructorId, row.constructorName);
  const color = resolveTeamUiColor(undefined, row.constructorName);
  return (
    <Link
      href={`/teams/${row.constructorId}`}
      className="group relative col-span-4 flex min-h-72 flex-col gap-4 overflow-hidden rounded-[var(--radius-lg)] border border-hairline bg-surface p-6 transition-[transform,opacity] duration-150 will-change-transform hover:-translate-y-0.5 hover:opacity-95 md:col-span-4 lg:col-span-4"
    >
      <span aria-hidden className="absolute inset-y-0 left-0 w-1" style={{ backgroundColor: color }} />
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="relative h-10 w-10 shrink-0">
            {logo ? <Image src={logo} alt="" fill sizes="40px" className="object-contain" /> : null}
          </span>
          <span className="font-condensed text-3xl font-700 uppercase leading-none text-text-hi" style={{ fontFamily: 'var(--font-condensed)' }}>
            {row.constructorName}
          </span>
        </div>
        <span className="data-tabular text-text-mid">P{row.position}</span>
      </div>
      {car ? (
        <div className="relative mt-auto h-28 w-full">
          <Image src={car} alt="" fill sizes="(max-width: 768px) 100vw, 33vw" className="object-contain object-center opacity-90" />
        </div>
      ) : null}
      <div className="data-tabular flex justify-between text-text-low">
        <span>{row.wins} wins</span>
        <span>{row.points} PTS</span>
      </div>
    </Link>
  );
}

export type { TeamDriverGroup };
