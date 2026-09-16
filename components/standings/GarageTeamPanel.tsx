import Link from 'next/link';
import { ApexFallback } from '@/components/media/ApexFallback';
import { ApexImage } from '@/components/media/ApexImage';
import { teamIconSrc, carSrc, driverIconSrc } from '@/lib/assets/f1-icons';
import { resolveTeamUiColor } from '@/config/team-colors';
import { teamPatternStyle } from '@/lib/assets/team-pattern';
import type { DriverGridRow } from '@/lib/data/entities';

export interface GarageUnit {
  constructorId: string;
  constructorName: string;
  constructorPosition: string;
  points: string;
  wins: string;
  powerUnit: string | null;
  drivers: DriverGridRow[];
}

function DriverBay({
  row,
  season,
  color,
  divided,
}: {
  row: DriverGridRow;
  season: number;
  color: string;
  divided?: boolean;
}) {
  const portrait = driverIconSrc(row.driverCode, row.driverId, season);
  const number = row.carNumber ?? row.position;

  return (
    <Link
      href={`/drivers/${row.driverId}`}
      className={[
        'group relative flex min-h-36 flex-1 flex-col justify-end overflow-hidden p-3 md:min-h-52 md:p-4',
        divided ? 'border-l border-hairline' : '',
      ].join(' ')}
    >
      <span
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background: `radial-gradient(circle at 50% 28%, color-mix(in srgb, ${color} 28%, transparent), transparent 62%)`,
        }}
      />
      {portrait ? (
        <>
          <span
            aria-hidden
            className="hero-number pointer-events-none absolute inset-0 z-0 flex select-none items-center justify-center text-[clamp(4.5rem,18vw,7.5rem)] leading-none text-white/[0.08]"
          >
            {number}
          </span>
          <div className="pointer-events-none absolute inset-0 z-[1]">
            <ApexImage
              src={portrait}
              alt=""
              fill
              kind="driver"
              fallbackLabel={row.driverName}
              sizes="(max-width: 768px) 50vw, 28vw"
              className="object-contain object-top scale-110 md:object-bottom md:scale-125"
              style={{
                maskImage: 'linear-gradient(to bottom, rgba(0,0,0,1) 55%, rgba(0,0,0,0) 100%)',
                WebkitMaskImage: 'linear-gradient(to bottom, rgba(0,0,0,1) 55%, rgba(0,0,0,0) 100%)',
              }}
            />
          </div>
        </>
      ) : (
        <div className="pointer-events-none absolute inset-0 z-[1]">
          <ApexFallback kind="driver" label={row.driverName} />
        </div>
      )}
      <span
        aria-hidden
        className="pointer-events-none absolute inset-x-0 bottom-0 z-[2] h-2/3 bg-gradient-to-t from-[#050505] via-[#050505]/85 to-transparent"
      />
      <div className="relative z-10 flex flex-col gap-0.5">
        <span
          className="font-condensed line-clamp-2 text-base font-700 uppercase leading-tight text-text-hi md:text-xl"
          style={{ fontFamily: 'var(--font-condensed)' }}
        >
          {row.driverName}
        </span>
        <div className="data-tabular flex justify-between text-xs text-text-mid md:text-sm">
          <span>P{row.position}</span>
          <span className="text-text-hi">{row.points} PTS</span>
        </div>
      </div>
    </Link>
  );
}

function EmptySeat({ divided }: { divided?: boolean }) {
  return (
    <div
      className={[
        'relative flex min-h-36 flex-1 flex-col items-center justify-center overflow-hidden p-4 md:min-h-52',
        divided ? 'border-l border-hairline' : '',
      ].join(' ')}
    >
      <span
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-40"
        style={{
          backgroundImage:
            'repeating-linear-gradient(90deg, transparent, transparent 11px, rgba(255,255,255,0.04) 11px, rgba(255,255,255,0.04) 12px), repeating-linear-gradient(0deg, transparent, transparent 11px, rgba(255,255,255,0.04) 11px, rgba(255,255,255,0.04) 12px)',
        }}
      />
      <span className="relative z-10 font-mono text-xs font-700 uppercase tracking-wider text-text-low">
        TBA // Seat unconfirmed
      </span>
    </div>
  );
}

/**
 * One constructor = one paddock garage panel (team identity + both seats).
 */
export function GarageTeamPanel({ unit, season }: { unit: GarageUnit; season: number }) {
  const color = resolveTeamUiColor(undefined, unit.constructorName);
  const logo = teamIconSrc(unit.constructorName);
  const car = carSrc(unit.constructorId, unit.constructorName);
  const [d1, d2] = unit.drivers;

  return (
    <article
      className="relative overflow-hidden rounded-[var(--radius-lg)] border border-hairline bg-[#050505]"
      style={{ borderLeftWidth: 2, borderLeftColor: color }}
    >
      <span
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.07]"
        style={teamPatternStyle(unit.constructorId, color)}
      />

      <div className="relative z-10 flex flex-col lg:flex-row">
        <Link
          href={`/teams/${unit.constructorId}`}
          className="relative flex flex-col gap-3 border-b border-hairline p-4 lg:w-[38%] lg:border-b-0 lg:p-5"
        >
          <div className="flex items-start justify-between gap-3">
            <div className="flex min-w-0 items-center gap-3">
              <span className="relative h-9 w-9 shrink-0 sm:h-10 sm:w-10">
                <ApexImage src={logo} alt="" fill kind="media" sizes="40px" className="object-contain" fallbackLabel="TEAM" />
              </span>
              <span
                className="font-condensed truncate text-xl font-700 uppercase leading-none text-text-hi sm:text-2xl"
                style={{ fontFamily: 'var(--font-condensed)' }}
              >
                {unit.constructorName}
              </span>
            </div>
            <span className="data-tabular shrink-0 text-accent">P{unit.constructorPosition}</span>
          </div>

          <div className="relative h-16 w-full sm:h-20 lg:mt-auto lg:h-28">
            {car ? (
              <ApexImage
                src={car}
                alt=""
                fill
                kind="car"
                fallbackLabel={unit.constructorName}
                sizes="(max-width: 1024px) 100vw, 38vw"
                className="object-contain object-bottom"
              />
            ) : (
              <ApexFallback kind="car" label={unit.constructorName} />
            )}
          </div>

          <div className="flex flex-wrap items-baseline justify-between gap-2">
            {unit.powerUnit ? (
              <span className="data-tabular text-xs uppercase tracking-wider text-text-low">
                {unit.powerUnit}
              </span>
            ) : (
              <span />
            )}
            <span className="data-tabular text-xs text-text-mid">
              {unit.wins} W · {unit.points} PTS
            </span>
          </div>
        </Link>

        <div className="grid grid-cols-2 lg:min-h-0 lg:flex-1">
          {d1 ? <DriverBay row={d1} season={season} color={color} /> : <EmptySeat />}
          {d2 ? <DriverBay row={d2} season={season} color={color} divided /> : <EmptySeat divided />}
        </div>
      </div>
    </article>
  );
}
