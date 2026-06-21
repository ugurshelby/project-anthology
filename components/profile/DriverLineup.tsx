import Link from 'next/link';
import { DriverAvatar } from '@/components/bento/DriverAvatar';

interface LineupDriver {
  driverId: string;
  driverName: string;
  driverCode: string;
  position: string;
  points: string;
}

/** Driver line-up (design.md §3.3) — two drivers, equal weight, SVG portraits. */
export function DriverLineup({
  drivers,
  season,
  constructorName,
}: {
  drivers: LineupDriver[];
  season: number;
  constructorName?: string;
}) {
  return (
    <div className="grid grid-cols-2 divide-x divide-hairline">
      {drivers.map((d) => (
        <Link
          key={d.driverId}
          href={`/drivers/${d.driverId}`}
          className="group flex flex-col items-center gap-2 px-3 py-2 text-center transition-colors first:pl-0 last:pr-0 hover:opacity-90"
        >
          <DriverAvatar
            driverName={d.driverName}
            driverCode={d.driverCode}
            driverId={d.driverId}
            constructorName={constructorName}
            season={season}
            size={80}
          />
          <span className="font-condensed text-xl font-600 uppercase leading-tight text-text-hi" style={{ fontFamily: 'var(--font-condensed)' }}>
            {d.driverName}
          </span>
          <span className="data-tabular text-text-mid">
            P{d.position} · {d.points} PTS
          </span>
        </Link>
      ))}
    </div>
  );
}
