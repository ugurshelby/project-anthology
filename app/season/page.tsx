import type { Metadata } from 'next';
import { AtmosphericHero } from '@/components/ui/AtmosphericHero';
import { SafeImage } from '@/components/ui/SafeImage';
import { SeasonExplorer } from '@/components/season/SeasonExplorer';
import { getSeasonData } from '@/lib/data/f1';
import { driverIconSrc, teamIconSrc } from '@/lib/assets/f1-icons';
import { CURRENT_SEASON, F1_SEASON_MIN } from '@/lib/f1Calendar';

// Fully dynamic: re-run the staleness→live path on every request so /season
// matches the homepage (both bypass a stale DB snapshot to live Jolpica).
export const revalidate = 0;
export const dynamic = 'force-dynamic';

const ARCHIVE_MIN = Math.max(F1_SEASON_MIN, 2018);

const TITLE = 'Season';
const DESCRIPTION = `Formula 1 season archive: driver and constructor standings, race calendar, and race recaps from ${ARCHIVE_MIN} to ${CURRENT_SEASON}.`;

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

function parseYearParam(raw: string | undefined): number {
  const parsed = raw ? Number(raw) : NaN;
  if (Number.isFinite(parsed) && parsed >= ARCHIVE_MIN && parsed <= CURRENT_SEASON) {
    return parsed;
  }
  return CURRENT_SEASON;
}

const SEASONS = Array.from(
  { length: CURRENT_SEASON - ARCHIVE_MIN + 1 },
  (_, i) => ARCHIVE_MIN + i,
);

type PageProps = {
  searchParams: Promise<{ year?: string }>;
};

export default async function SeasonPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const initialYear = parseYearParam(params.year);
  const seasonData = await getSeasonData(initialYear);

  const leader = seasonData.standings[0] ?? null;
  const leaderDriverSrc = leader
    ? driverIconSrc(leader.driverCode, leader.driverName, initialYear)
    : null;
  const leaderTeamSrc = leader ? teamIconSrc(leader.constructorName, initialYear) : null;

  return (
    <>
      <AtmosphericHero>
        <p
          className="font-condensed text-[11px] uppercase tracking-[0.2em]"
          style={{ color: 'var(--muted)' }}
        >
          {initialYear} World Championship
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
