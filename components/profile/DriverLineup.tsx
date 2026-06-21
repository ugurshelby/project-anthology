import Link from 'next/link';
import Image from 'next/image';
import { driverIconSrc } from '@/lib/assets/f1-icons';

interface LineupDriver {
  driverId: string;
  driverName: string;
  driverCode: string;
  position: string;
  points: string;
}

/** Driver line-up (design.md §3.3) — two drivers, equal weight, SVG portraits. */
export function DriverLineup({ drivers, season }: { drivers: LineupDriver[]; season: number }) {
  return (
    <div className="grid grid-cols-2 divide-x divide-hairline">
      {drivers.map((d) => {
        const portrait = driverIconSrc(d.driverCode, d.driverId, season);
        return (
          <Link
            key={d.driverId}
            href={`/drivers/${d.driverId}`}
            className="group flex flex-col items-center gap-2 px-3 py-2 text-center transition-colors first:pl-0 last:pr-0 hover:opacity-90"
          >
            <span className="relative h-20 w-20 overflow-hidden rounded-full bg-surface-raised">
              {portrait ? (
                <Image src={portrait} alt={d.driverName} fill sizes="80px" className="object-cover object-top" />
              ) : null}
            </span>
            <span className="font-condensed text-xl font-600 uppercase leading-tight text-text-hi" style={{ fontFamily: 'var(--font-condensed)' }}>
              {d.driverName}
            </span>
            <span className="data-tabular text-text-mid">
              P{d.position} · {d.points} PTS
            </span>
          </Link>
        );
      })}
    </div>
  );
}
