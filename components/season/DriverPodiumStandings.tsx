import Link from 'next/link';
import Image from 'next/image';
import { BentoCard } from '@/components/bento/BentoCard';
import { resolveTeamUiColor } from '@/config/team-colors';
import { driverIconSrc } from '@/lib/assets/f1-icons';
import { getDriverLore } from '@/data/drivers';
import type { DriverStandingRow } from '@/lib/f1/mrdata';

/**
 * Drivers standings — podium trio blocks + compact scrollable table for P4+.
 */
export function DriverPodiumStandings({
  drivers,
  season,
}: {
  drivers: DriverStandingRow[];
  season: number;
}) {
  const podium = drivers.slice(0, 3);
  const rest = drivers.slice(3);

  return (
    <BentoCard span={7} className="relative flex flex-col gap-4 overflow-hidden">
      <span
        aria-hidden
        className="absolute inset-x-0 top-0 h-0.5"
        style={{ backgroundColor: resolveTeamUiColor(podium[0]?.constructorId, podium[0]?.constructorName) }}
      />
      <span className="label-caps text-text-mid">Drivers · Championship</span>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        {podium.map((row) => (
          <PodiumBlock key={row.driverId} row={row} season={season} />
        ))}
      </div>

      {rest.length > 0 ? (
        <div className="pit-wall-scroll max-h-56 overflow-y-auto border-t border-hairline pt-2">
          <table className="w-full border-collapse">
            <tbody>
              {rest.map((row) => {
                const color = resolveTeamUiColor(row.constructorId, row.constructorName);
                return (
                  <tr key={row.driverId} className="border-b border-hairline/60 last:border-b-0">
                    <td className="data-tabular w-8 py-1.5 pr-2 text-right text-text-low">{row.position}</td>
                    <td className="py-1.5 pr-2">
                      <Link href={`/drivers/${row.driverId}`} className="font-condensed text-sm font-600 uppercase text-text-hi hover:text-accent" style={{ fontFamily: 'var(--font-condensed)' }}>
                        {row.driverName.split(' ').pop()}
                      </Link>
                    </td>
                    <td className="hidden py-1.5 pr-2 sm:table-cell">
                      <span className="data-tabular truncate text-xs text-text-mid">{row.constructorName}</span>
                    </td>
                    <td className="py-1.5 pl-2 text-right">
                      <span className="data-tabular text-text-hi">{row.points}</span>
                      <span aria-hidden className="ml-2 inline-block h-2 w-2 rounded-full" style={{ backgroundColor: color }} />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : null}
    </BentoCard>
  );
}

function PodiumBlock({ row, season }: { row: DriverStandingRow; season: number }) {
  const color = resolveTeamUiColor(row.constructorId, row.constructorName);
  const portrait = driverIconSrc(row.driverCode, row.driverId, season);
  const number = getDriverLore(row.driverId)?.number;

  return (
    <Link
      href={`/drivers/${row.driverId}`}
      className="group relative flex flex-col gap-2 overflow-hidden rounded-[var(--radius)] border border-white/[0.08] bg-surface-raised/60 p-4 transition-colors hover:border-white/[0.14]"
      style={{ borderTopWidth: 2, borderTopColor: color }}
    >
      <span className="data-tabular text-text-low">P{row.position}</span>
      {portrait ? (
        <div className="relative h-20 w-full">
          <Image src={portrait} alt="" fill sizes="120px" className="object-contain object-bottom opacity-90" />
        </div>
      ) : null}
      <span className="font-condensed text-lg font-700 uppercase leading-none text-text-hi" style={{ fontFamily: 'var(--font-condensed)' }}>
        {row.driverName.split(' ').pop()}
      </span>
      <span className="data-tabular text-xs" style={{ color }}>{row.constructorName}</span>
      <div className="flex items-end justify-between">
        <span className="hero-number text-3xl text-text-hi">{row.points}</span>
        {number != null ? <span className="data-tabular text-text-low">#{number}</span> : null}
      </div>
    </Link>
  );
}
