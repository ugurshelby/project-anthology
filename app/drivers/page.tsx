import type { Metadata } from 'next';
import Link from 'next/link';
import { AtmosphericHero } from '@/components/ui/AtmosphericHero';
import { SafeImage } from '@/components/ui/SafeImage';
import { SectionDivider } from '@/components/ui/SectionDivider';
import { getCurrentDrivers } from '@/lib/data/entities';
import { driverIconSrc } from '@/lib/assets/f1-icons';
import { resolveTeamUiColor } from '@/config/team-colors';

export const dynamic = 'force-dynamic';

const DESCRIPTION = 'Current Formula 1 drivers — championship standings, teams, and points.';

export const metadata: Metadata = {
  title: 'Drivers',
  description: DESCRIPTION,
  alternates: { canonical: '/drivers' },
  openGraph: { title: 'Drivers — Apex', description: DESCRIPTION, url: '/drivers', type: 'website' },
  twitter: { card: 'summary_large_image', title: 'Drivers — Apex', description: DESCRIPTION },
};

export default async function DriversGridPage() {
  const { season, rows } = await getCurrentDrivers();

  return (
    <>
      <AtmosphericHero>
        <p className="font-condensed text-[11px] uppercase tracking-[0.2em]" style={{ color: 'var(--muted)' }}>
          {season} Grid
        </p>
        <h1
          className="mt-2 font-display text-[clamp(4rem,14vw,10rem)] leading-[0.88] tracking-[0.04em]"
          style={{ color: 'var(--paper)' }}
        >
          DRIVERS
        </h1>
      </AtmosphericHero>

      <div className="content-wrap">
        <SectionDivider title={`${season} Drivers`} />
        {rows.length === 0 ? (
          <p className="text-sm" style={{ color: 'var(--muted)' }}>
            Standings unavailable — sync will populate the grid.
          </p>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {rows.map((row) => {
              const src = driverIconSrc(row.driverCode, row.driverId || row.driverName, season);
              const color = resolveTeamUiColor(null, row.constructorName);
              return (
                <Link
                  key={row.driverId || row.driverName}
                  href={row.driverId ? `/drivers/${row.driverId}` : '#'}
                  className="entity-grid-card"
                  style={{
                    borderLeftColor: color,
                    backgroundColor: `color-mix(in srgb, ${color} 10%, var(--card))`,
                  }}
                >
                  <span
                    className="w-6 shrink-0 font-mono text-[11px] tabular-nums"
                    style={{ color: 'var(--muted)' }}
                  >
                    {row.position.padStart(2, '0')}
                  </span>
                  {src ? (
                    <SafeImage src={src} alt="" width={44} height={44} className="h-11 w-11 shrink-0 object-contain" />
                  ) : null}
                  <span className="min-w-0 flex-1">
                    <span
                      className="block truncate font-condensed text-base font-semibold uppercase tracking-[0.06em]"
                      style={{ color: 'var(--paper)' }}
                    >
                      {row.driverName}
                    </span>
                    <span
                      className="block truncate font-mono text-[9px] uppercase tracking-[0.12em]"
                      style={{ color: 'var(--muted)' }}
                    >
                      {row.constructorName}
                    </span>
                  </span>
                  <span className="shrink-0 font-mono text-sm tabular-nums" style={{ color }}>
                    {row.points}
                  </span>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </>
  );
}
