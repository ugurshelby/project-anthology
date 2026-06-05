import type { Metadata } from 'next';
import { AtmosphericHero } from '@/components/ui/AtmosphericHero';
import { SafeImage } from '@/components/ui/SafeImage';
import { SectionDivider } from '@/components/ui/SectionDivider';
import { fetchSeasonSnapshotTyped } from '@/lib/data/f1';
import { getDriverStandings, getRacesFromCalendar } from '@/lib/f1/mrdata';
import { CURRENT_SEASON } from '@/lib/f1Calendar';

const TITLE = 'Season';
const DESCRIPTION = `Live ${CURRENT_SEASON} Formula 1 season: full race calendar and driver standings, powered by snapshot data.`;

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  openGraph: {
    title: `${TITLE} — F1 ${CURRENT_SEASON}`,
    description: DESCRIPTION,
    url: '/season',
    type: 'website',
  },
  twitter: { card: 'summary_large_image', title: `${TITLE} — F1 ${CURRENT_SEASON}`, description: DESCRIPTION },
  alternates: { canonical: '/season' },
};

export default async function SeasonPage() {
  const [calendarData, standingsData] = await Promise.all([
    fetchSeasonSnapshotTyped(CURRENT_SEASON, 'calendar'),
    fetchSeasonSnapshotTyped(CURRENT_SEASON, 'standings_drivers'),
  ]);

  const races = getRacesFromCalendar(calendarData);
  const standings = getDriverStandings(standingsData);

  return (
    <>
      <AtmosphericHero>
        <p
          className="font-condensed text-[11px] uppercase tracking-[0.2em]"
          style={{ color: 'var(--muted)' }}
        >
          {CURRENT_SEASON}
        </p>
        <h1
          className="mt-2 font-display text-[2.5rem] leading-[0.88] tracking-[0.04em]"
          style={{ color: 'var(--paper)' }}
        >
          SEASON
        </h1>
      </AtmosphericHero>

      <div className="content-wrap space-y-section-gap">
        <section>
          <SectionDivider title="Driver Standings" />
          {standings.length === 0 ? (
            <p className="text-sm text-muted" style={{ color: 'var(--muted)' }}>
              No standings in database yet.
            </p>
          ) : (
            <div className="overflow-x-auto border border-border">
              <table className="w-full min-w-[480px] text-left font-mono text-xs tracking-wider">
                <thead className="bg-surface text-muted" style={{ color: 'var(--muted)' }}>
                  <tr>
                    <th className="px-4 py-3">Pos</th>
                    <th className="px-4 py-3">Driver</th>
                    <th className="px-4 py-3">Team</th>
                    <th className="px-4 py-3 text-right">Pts</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {standings.map((row) => (
                    <tr key={row.position + row.driverName}>
                      <td className="px-4 py-3 text-accent" style={{ color: 'var(--accent)' }}>
                        {row.position}
                      </td>
                      <td className="px-4 py-3">
                        <span className="inline-flex items-center gap-2">
                          {row.driverCode ? (
                            <SafeImage
                              src={`/drivers/${row.driverCode}.svg`}
                              alt=""
                              width={28}
                              height={28}
                              className="h-7 w-7 object-contain"
                            />
                          ) : null}
                          <span style={{ color: 'var(--paper)' }}>{row.driverName}</span>
                        </span>
                      </td>
                      <td className="px-4 py-3 text-muted" style={{ color: 'var(--muted)' }}>
                        {row.constructorName}
                      </td>
                      <td className="px-4 py-3 text-right" style={{ color: 'var(--paper)' }}>
                        {row.points}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        <section>
          <SectionDivider title="Race Calendar" />
          {races.length === 0 ? (
            <p className="text-sm text-muted" style={{ color: 'var(--muted)' }}>
              Calendar not available.
            </p>
          ) : (
            <ul className="space-y-2">
              {races.map((race) => (
                <li
                  key={String(race.round ?? race.raceName)}
                  className="anthology-card flex items-center justify-between gap-4 px-4 py-3"
                >
                  <div>
                    <span
                      className="font-mono text-[9px] uppercase text-accent/70"
                      style={{ color: 'rgba(255,24,1,0.7)' }}
                    >
                      R{race.round ?? '—'}
                    </span>
                    <p
                      className="font-display text-[1.3rem] tracking-[0.04em]"
                      style={{ color: 'var(--paper)' }}
                    >
                      {race.raceName ?? 'Grand Prix'}
                    </p>
                  </div>
                  <span className="font-mono text-xs text-muted" style={{ color: 'var(--muted)' }}>
                    {race.date ?? '—'}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </>
  );
}
