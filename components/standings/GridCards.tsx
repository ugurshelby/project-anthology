import Link from 'next/link';
import Image from 'next/image';
import { teamIconSrc, carSrc } from '@/lib/assets/f1-icons';
import { resolveTeamUiColor } from '@/config/team-colors';
import { DriverAvatar } from '@/components/bento/DriverAvatar';
import type { DriverGridRow, TeamDriverGroup } from '@/lib/data/entities';
import type { ConstructorStandingRow } from '@/lib/f1/mrdata';

/** Driver card for the /drivers grid. */
export function DriverCard({ row, season }: { row: DriverGridRow; season: number }) {
  const color = resolveTeamUiColor(undefined, row.constructorName);
  return (
    <Link
      href={`/drivers/${row.driverId}`}
      className="group relative col-span-2 flex flex-col gap-3 overflow-hidden rounded-[var(--radius-lg)] border border-hairline bg-surface p-5 transition-[transform,background-color] duration-150 hover:-translate-y-0.5 hover:bg-surface-raised md:col-span-2 lg:col-span-3"
    >
      <span aria-hidden className="absolute inset-y-0 left-0 w-1" style={{ backgroundColor: color }} />
      {/* faint team-colour wash bottom-right so the card never reads empty */}
      <span
        aria-hidden
        className="pointer-events-none absolute -bottom-8 -right-8 h-32 w-32 rounded-full opacity-[0.10] blur-2xl transition-opacity duration-150 group-hover:opacity-20"
        style={{ backgroundColor: color }}
      />
      <div className="relative z-10 flex items-start justify-between">
        <span className="hero-number text-5xl text-text-hi/15">{row.carNumber ?? row.position}</span>
        <DriverAvatar
          driverName={row.driverName}
          driverCode={row.driverCode}
          driverId={row.driverId}
          constructorName={row.constructorName}
          season={season}
          size={64}
        />
      </div>
      <div className="relative z-10 flex flex-col">
        <span className="font-condensed text-2xl font-700 uppercase leading-none text-text-hi" style={{ fontFamily: 'var(--font-condensed)' }}>
          {row.driverName}
        </span>
        <span className="data-tabular mt-1 text-text-mid">{row.constructorName}</span>
      </div>
      <div className="relative z-10 data-tabular flex justify-between text-text-low">
        <span>P{row.position}</span>
        <span>{row.points} PTS</span>
      </div>
    </Link>
  );
}

/** Constructor card for the /teams grid. */
export function TeamCard({ row }: { row: ConstructorStandingRow }) {
  const logo = teamIconSrc(row.constructorName);
  const car = carSrc(row.constructorId, row.constructorName);
  const color = resolveTeamUiColor(undefined, row.constructorName);
  return (
    <Link
      href={`/teams/${row.constructorId}`}
      className="group relative col-span-4 flex flex-col gap-4 overflow-hidden rounded-[var(--radius-lg)] border border-hairline bg-surface p-6 transition-[transform,background-color] duration-150 hover:-translate-y-0.5 hover:bg-surface-raised md:col-span-4 lg:col-span-6"
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
        <div className="relative h-20 w-full">
          <Image src={car} alt="" fill sizes="(max-width: 768px) 100vw, 50vw" className="object-contain object-right opacity-90" />
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
