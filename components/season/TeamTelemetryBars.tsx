import Link from 'next/link';
import Image from 'next/image';
import { BentoCard } from '@/components/bento/BentoCard';
import { resolveTeamUiColor } from '@/config/team-colors';
import { teamIconSrc } from '@/lib/assets/f1-icons';
import type { ConstructorStandingRow } from '@/lib/f1/mrdata';

/**
 * Constructors standings as telemetry-style horizontal progress bars.
 */
export function TeamTelemetryBars({ teams }: { teams: ConstructorStandingRow[] }) {
  const maxPoints = Math.max(...teams.map((t) => Number(t.points) || 0), 1);
  const leader = teams[0];

  return (
    <BentoCard span={5} className="relative flex flex-col gap-4 overflow-hidden">
      <span
        aria-hidden
        className="absolute inset-x-0 top-0 h-0.5"
        style={{ backgroundColor: resolveTeamUiColor(leader?.constructorId, leader?.constructorName) }}
      />
      <span className="label-caps text-text-mid">Constructors · Telemetry</span>
      <div className="flex flex-col gap-3">
        {teams.map((row) => {
          const color = resolveTeamUiColor(row.constructorId, row.constructorName);
          const pct = Math.round((Number(row.points) / maxPoints) * 100);
          const logo = teamIconSrc(row.constructorName);
          return (
            <Link
              key={row.constructorId}
              href={`/teams/${row.constructorId}`}
              className="group flex flex-col gap-1.5 rounded-[var(--radius-chip)] p-2 transition-colors hover:bg-surface-raised/50"
            >
              <div className="flex items-center justify-between gap-2">
                <div className="flex min-w-0 items-center gap-2">
                  <span className="data-tabular w-5 text-right text-text-low">{row.position}</span>
                  {logo ? (
                    <span className="relative h-5 w-5 shrink-0">
                      <Image src={logo} alt="" fill sizes="20px" className="object-contain" />
                    </span>
                  ) : null}
                  <span className="font-condensed truncate text-sm font-600 uppercase text-text-hi" style={{ fontFamily: 'var(--font-condensed)' }}>
                    {row.constructorName}
                  </span>
                </div>
                <span className="data-tabular shrink-0 text-text-hi">{row.points}</span>
              </div>
              <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/[0.06]">
                <div
                  className="h-full rounded-full transition-[width] duration-500"
                  style={{
                    width: `${pct}%`,
                    background: `linear-gradient(90deg, ${color}, color-mix(in srgb, ${color} 60%, transparent))`,
                    boxShadow: `0 0 10px color-mix(in srgb, ${color} 40%, transparent)`,
                  }}
                />
              </div>
            </Link>
          );
        })}
      </div>
    </BentoCard>
  );
}
