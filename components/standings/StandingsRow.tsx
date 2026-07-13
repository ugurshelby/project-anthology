import Link from 'next/link';
import Image from 'next/image';
import { resolveTeamUiColor } from '@/config/team-colors';
import { DriverAvatar } from '@/components/bento/DriverAvatar';
import { teamIconSrc } from '@/lib/assets/f1-icons';
import type { DriverStandingRow, ConstructorStandingRow } from '@/lib/f1/mrdata';

/** Driver standings row — position · portrait · name · team · color bar · points. */
export function DriverRow({ row, season }: { row: DriverStandingRow; season: number }) {
  const teamColor = resolveTeamUiColor(undefined, row.constructorName);

  return (
    <Link
      href={`/drivers/${row.driverId}`}
      className="group flex items-center gap-3 rounded-[var(--radius-chip)] px-2 py-2 transition-colors hover:bg-surface-raised"
    >
      <span className="data-tabular w-6 text-right text-text-mid">{row.position}</span>
      <DriverAvatar
        driverName={row.driverName}
        driverCode={row.driverCode}
        driverId={row.driverId}
        constructorName={row.constructorName}
        season={season}
        size={32}
      />
      <span className="font-condensed flex-1 truncate text-lg font-600 uppercase tracking-tight text-text-hi" style={{ fontFamily: 'var(--font-condensed)' }}>
        {row.driverName}
      </span>
      <span aria-hidden className="hidden h-4 w-1 rounded-full sm:block" style={{ backgroundColor: teamColor }} />
      <span className="data-tabular hidden w-24 truncate text-text-mid sm:block">{row.constructorName}</span>
      <span className="data-tabular w-12 text-right text-text">{row.points}</span>
    </Link>
  );
}

/** Constructor standings row — position · logo · name · color bar · points. */
export function TeamRow({ row }: { row: ConstructorStandingRow }) {
  const teamColor = resolveTeamUiColor(undefined, row.constructorName);
  const logo = teamIconSrc(row.constructorName);
  return (
    <Link
      href={`/teams/${row.constructorId}`}
      className="group flex items-center gap-3 rounded-[var(--radius-chip)] px-2 py-2 transition-colors hover:bg-surface-raised"
    >
      <span className="data-tabular w-6 text-right text-text-mid">{row.position}</span>
      {logo ? (
        <span className="relative h-6 w-6 shrink-0">
          <Image src={logo} alt="" fill sizes="24px" className="object-contain" />
        </span>
      ) : null}
      <span aria-hidden className="h-4 w-1 rounded-full" style={{ backgroundColor: teamColor }} />
      <span className="font-condensed flex-1 truncate text-lg font-600 uppercase tracking-tight text-text-hi" style={{ fontFamily: 'var(--font-condensed)' }}>
        {row.constructorName}
      </span>
      <span className="data-tabular w-12 text-right text-text">{row.points}</span>
    </Link>
  );
}
