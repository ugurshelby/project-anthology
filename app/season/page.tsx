import type { Metadata } from 'next';
import { AtmosphericHero } from '@/components/ui/AtmosphericHero';
import { SafeImage } from '@/components/ui/SafeImage';
import { SeasonExplorer } from '@/components/season/SeasonExplorer';
import { getSeasonData } from '@/lib/data/f1';
import { driverIconSrc, teamIconSrc } from '@/lib/assets/f1-icons';
import { CURRENT_SEASON } from '@/lib/f1Calendar';

export const revalidate = 0;
export const dynamic = 'force-dynamic';

const TITLE = 'Season';
const DESCRIPTION = `Formula 1 ${CURRENT_SEASON} season: driver and constructor standings, race calendar, and race recaps.`;

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

const SEASONS = [CURRENT_SEASON];

export default async function SeasonPage() {
  const seasonData = await getSeasonData(CURRENT_SEASON);

  const leader = seasonData.standings[0] ?? null;
  const leaderDriverSrc = leader
    ? driverIconSrc(leader.driverCode, leader.driverName, CURRENT_SEASON)
    : null;
  const leaderTeamSrc = leader ? teamIconSrc(leader.constructorName, CURRENT_SEASON) : null;

  return (
    <>
      <AtmosphericHero>
        <p
          className="font-condensed text-[11px] uppercase tracking-[0.2em]"
          style={{ color: 'var(--muted)' }}
        >
          {CURRENT_SEASON} World Championship
        </p>
        <h1
          className="mt-2 font-display text-[clamp(5rem,16vw,12rem)] leading-[0.88] tracking-[0.04em]"
          style={{ color: 'var(--paper)' }}
        >
          SEASON
        </h1>
        {leader ? (
          <p
            className="mt-4 flex flex-wrap items-center justify-center gap-3 font-condensed text-sm uppercase tracking-[0.18em]"
            style={{ color: 'var(--muted)' }}
          >
            Championship leader
            {leaderDriverSrc ? (
              <SafeImage
                src={leaderDriverSrc}
                alt=""
                width={36}
                height={36}
                className="h-9 w-9 object-contain"
              />
            ) : null}
            <span className="font-display text-2xl tracking-[0.04em]" style={{ color: 'var(--paper)' }}>
              {leader.driverName}
            </span>
            {leaderTeamSrc ? (
              <SafeImage
                src={leaderTeamSrc}
                alt=""
                width={28}
                height={28}
                className="h-7 w-7 object-contain opacity-90"
              />
            ) : null}
            <span className="font-mono text-xs" style={{ color: 'var(--accent)' }}>
              {leader.points} PTS
            </span>
          </p>
        ) : null}
      </AtmosphericHero>

      <SeasonExplorer initialData={seasonData} seasons={SEASONS} />
    </>
  );
}
