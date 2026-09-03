import Link from 'next/link';
import { DriverAvatar } from '@/components/bento/DriverAvatar';
import { BentoCard } from '@/components/bento/BentoCard';

interface LineupDriver {
  driverId: string;
  driverName: string;
  driverCode: string;
  position: string;
  points: string;
}

function codeOf(d: LineupDriver): string {
  return d.driverCode.toUpperCase() || d.driverName.split(' ').pop()!.toUpperCase();
}

function DriverPole({
  driver,
  season,
  constructorName,
  align,
}: {
  driver: LineupDriver;
  season: number;
  constructorName?: string;
  align: 'left' | 'right';
}) {
  return (
    <Link
      href={`/drivers/${driver.driverId}`}
      className={[
        'flex min-w-0 flex-1 items-center gap-3',
        align === 'right' ? 'flex-row-reverse text-right' : '',
      ].join(' ')}
    >
      <DriverAvatar
        driverName={driver.driverName}
        driverCode={driver.driverCode}
        driverId={driver.driverId}
        constructorName={constructorName}
        season={season}
        size={72}
      />
      <div className="min-w-0">
        <span
          className="block truncate font-condensed text-lg font-700 uppercase italic leading-tight text-text-hi md:text-xl"
          style={{ fontFamily: 'var(--font-condensed)' }}
        >
          {driver.driverName}
        </span>
        <span className="font-mono text-xs text-zinc-500">
          {codeOf(driver)} · P{driver.position}
        </span>
      </div>
    </Link>
  );
}

/**
 * Combined lineup + H2H — helmets at the poles, points as a telemetry split.
 */
export function TeamLineupDuel({
  drivers,
  season,
  constructorName,
}: {
  drivers: LineupDriver[];
  season: number;
  constructorName?: string;
}) {
  const [d1, d2] = drivers;
  const leftPts = Number(d1?.points) || 0;
  const rightPts = Number(d2?.points) || 0;
  const total = leftPts + rightPts || 1;
  const leftPct = (leftPts / total) * 100;

  return (
    <BentoCard span={12} className="relative overflow-hidden">
      <span
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-px"
        style={{ backgroundColor: 'var(--team-secondary)', opacity: 0.7 }}
      />
      <span className="label-caps mb-5 block text-text-mid">Line-up · Head to Head</span>

      {!d1 ? (
        <p className="body-md text-text-mid">Line-up not confirmed.</p>
      ) : (
        <div className="flex flex-col gap-5">
          <div className="flex items-center gap-3 md:gap-6">
            <DriverPole driver={d1} season={season} constructorName={constructorName} align="left" />
            {d2 ? (
              <DriverPole driver={d2} season={season} constructorName={constructorName} align="right" />
            ) : (
              <div className="flex flex-1 items-center justify-end">
                <span className="font-mono text-xs uppercase tracking-wider text-zinc-500">
                  TBA // Seat unconfirmed
                </span>
              </div>
            )}
          </div>

          {d2 ? (
            <div className="flex flex-col gap-2">
              <div className="flex items-baseline justify-between font-mono text-sm text-zinc-200 md:text-base">
                <span>{leftPts} PTS</span>
                <span className="label-caps text-zinc-500">Telemetry split</span>
                <span>{rightPts} PTS</span>
              </div>
              <div className="relative h-2 overflow-hidden rounded-full bg-white/[0.06]">
                <span
                  className="absolute inset-y-0 left-0 bg-zinc-400"
                  style={{ width: `${leftPct}%` }}
                />
                <span
                  className="absolute inset-y-0 right-0"
                  style={{
                    width: `${100 - leftPct}%`,
                    backgroundColor: 'var(--team-secondary)',
                  }}
                />
                <span
                  aria-hidden
                  className="absolute inset-y-[-3px] w-px bg-white/70"
                  style={{ left: `${leftPct}%` }}
                />
              </div>
            </div>
          ) : null}
        </div>
      )}
    </BentoCard>
  );
}
