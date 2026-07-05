import Link from 'next/link';
import Image from 'next/image';
import { resolveTeamUiColor } from '@/config/team-colors';
import { driverIconSrc } from '@/lib/assets/f1-icons';
import type { DriverStandingRow, ConstructorStandingRow } from '@/lib/f1/mrdata';

/**
 * Leader spotlight — the P1 row rendered as a compact hero (team-colour glow +
 * portrait + hero-scale points) instead of a flat list row. Sits above the
 * regular standings list on both the homepage and /season (BoxBox-inspired,
 * kept within the Apex cinematic palette: single team-colour glow, no extra
 * accent colours).
 */
export function DriverLeaderCard({ row, season }: { row: DriverStandingRow; season: number }) {
  const teamColor = resolveTeamUiColor(undefined, row.constructorName);
  const portrait = driverIconSrc(row.driverCode, row.driverId, season);

  return (
    <Link
      href={`/drivers/${row.driverId}`}
      className="group relative flex min-h-28 items-center gap-4 overflow-hidden rounded-[var(--radius-lg)] px-5 py-4"
      style={{ background: `linear-gradient(120deg, color-mix(in srgb, ${teamColor} 22%, transparent), transparent 70%)` }}
    >
      <span
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{ background: `radial-gradient(120% 140% at 85% 30%, color-mix(in srgb, ${teamColor} 30%, transparent), transparent 60%)` }}
      />
      <span className="hero-number relative z-10 shrink-0 text-2xl text-text-hi/25">01</span>
      <div className="relative z-10 flex min-w-0 flex-1 flex-col gap-0.5">
        <span className="label-caps text-text-mid">Leader</span>
        <span
          className="font-condensed truncate text-2xl font-700 uppercase leading-none text-text-hi"
          style={{ fontFamily: 'var(--font-condensed)' }}
        >
          {row.driverName}
        </span>
        <span className="data-tabular text-text-mid" style={{ color: teamColor }}>
          {row.constructorName}
        </span>
      </div>
      <div className="relative z-10 flex shrink-0 flex-col items-end">
        <span className="hero-number text-[clamp(36px,5vw,64px)] text-text-hi">{row.points}</span>
        <span className="label-caps text-text-low">PTS</span>
      </div>
      {portrait ? (
        <div className="pointer-events-none absolute inset-y-0 right-0 z-0 hidden w-28 sm:block">
          <Image
            src={portrait}
            alt=""
            fill
            sizes="112px"
            className="object-contain object-bottom opacity-40"
            style={{
              maskImage: 'linear-gradient(to left, rgba(0,0,0,1) 0%, rgba(0,0,0,0) 90%)',
              WebkitMaskImage: 'linear-gradient(to left, rgba(0,0,0,1) 0%, rgba(0,0,0,0) 90%)',
            }}
          />
        </div>
      ) : null}
    </Link>
  );
}

/** Same treatment for the constructor standings leader — no portrait, team colour only. */
export function TeamLeaderCard({ row }: { row: ConstructorStandingRow }) {
  const teamColor = resolveTeamUiColor(undefined, row.constructorName);

  return (
    <Link
      href={`/teams/${row.constructorId}`}
      className="group relative flex min-h-24 items-center gap-4 overflow-hidden rounded-[var(--radius-lg)] px-5 py-4"
      style={{ background: `linear-gradient(120deg, color-mix(in srgb, ${teamColor} 22%, transparent), transparent 70%)` }}
    >
      <span
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{ background: `radial-gradient(120% 140% at 85% 30%, color-mix(in srgb, ${teamColor} 30%, transparent), transparent 60%)` }}
      />
      <span className="hero-number relative z-10 shrink-0 text-2xl text-text-hi/25">01</span>
      <div className="relative z-10 flex min-w-0 flex-1 flex-col gap-0.5">
        <span className="label-caps text-text-mid">Leader</span>
        <span
          className="font-condensed truncate text-2xl font-700 uppercase leading-none text-text-hi"
          style={{ fontFamily: 'var(--font-condensed)' }}
        >
          {row.constructorName}
        </span>
      </div>
      <div className="relative z-10 flex shrink-0 flex-col items-end">
        <span className="hero-number text-[clamp(36px,5vw,64px)] text-text-hi">{row.points}</span>
        <span className="label-caps text-text-low">PTS</span>
      </div>
    </Link>
  );
}
