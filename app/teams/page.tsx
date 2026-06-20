import type { Metadata } from 'next';
import Link from 'next/link';
import { AtmosphericHero } from '@/components/ui/AtmosphericHero';
import { SafeImage } from '@/components/ui/SafeImage';
import { SectionDivider } from '@/components/ui/SectionDivider';
import { getCurrentTeams } from '@/lib/data/entities';
import { teamIconSrc } from '@/lib/assets/f1-icons';
import { resolveTeamUiColor } from '@/config/team-colors';

export const dynamic = 'force-dynamic';

const DESCRIPTION = 'Current Formula 1 constructors — championship standings, points, and driver lineups.';

export const metadata: Metadata = {
  title: 'Constructors',
  description: DESCRIPTION,
  alternates: { canonical: '/teams' },
  openGraph: { title: 'Constructors — Apex', description: DESCRIPTION, url: '/teams', type: 'website' },
  twitter: { card: 'summary_large_image', title: 'Constructors — Apex', description: DESCRIPTION },
};

export default async function TeamsGridPage() {
  const { season, rows, data } = await getCurrentTeams();

  return (
    <>
      <AtmosphericHero>
        <p className="font-condensed text-[11px] uppercase tracking-[0.2em]" style={{ color: 'var(--muted)' }}>
          {season} Grid
        </p>
        <h1
          className="mt-2 font-display text-[clamp(4rem,12vw,9rem)] leading-[0.88] tracking-[0.04em]"
          style={{ color: 'var(--paper)' }}
        >
          CONSTRUCTORS
        </h1>
      </AtmosphericHero>

      <div className="content-wrap">
        <SectionDivider title={`${season} Constructors`} />
        {rows.length === 0 ? (
          <p className="text-sm" style={{ color: 'var(--muted)' }}>
            Standings unavailable — sync will populate the grid.
          </p>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2">
            {rows.map((row) => {
              const src = teamIconSrc(row.constructorName, season);
              const color = resolveTeamUiColor(null, row.constructorName);
              const lineup = data.standings.filter((d) => d.constructorId === row.constructorId);
              return (
                <Link
                  key={row.constructorId || row.constructorName}
                  href={row.constructorId ? `/teams/${row.constructorId}` : '#'}
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
                    <SafeImage src={src} alt="" width={48} height={48} className="h-12 w-12 shrink-0 object-contain" />
                  ) : null}
                  <span className="min-w-0 flex-1">
                    <span
                      className="block truncate font-condensed text-base font-semibold uppercase tracking-[0.06em]"
                      style={{ color: 'var(--paper)' }}
                    >
                      {row.constructorName}
                    </span>
                    <span
                      className="block truncate font-mono text-[9px] uppercase tracking-[0.12em]"
                      style={{ color: 'var(--muted)' }}
                    >
                      {lineup.map((d) => d.driverName).join(' · ') || '—'}
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
