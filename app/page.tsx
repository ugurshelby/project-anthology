import type { Metadata } from 'next';
import { SITE_NAME, SITE_TAGLINE } from '@/lib/seo';
import { fetchSeasonSnapshotTyped, fetchRoundSnapshot } from '@/lib/data/f1';
import { aggregate } from '@/lib/news/aggregate';
import {
  getDriverStandings,
  getLastRaceResult,
  getRacesFromCalendar,
  nowMs,
} from '@/lib/f1/mrdata';
import { CURRENT_SEASON, getLastFinishedRace, getLiveOrNextRace, raceStartMs } from '@/lib/f1Calendar';
import { PosterHero } from '@/components/home/PosterHero';
import { FlatStandingsList } from '@/components/home/FlatStandingsList';
import { LatestRaceCard } from '@/components/home/LatestRaceCard';
import { NewsList } from '@/components/news/NewsList';
import { BentoGrid, PageShell } from '@/components/layout/BentoGrid';
import { BentoCard } from '@/components/bento/BentoCard';
import { circuitCoverSrc } from '@/lib/assets/f1-icons';
import Link from 'next/link';

export const revalidate = 0;
/** Vercel @vercel/next + Next 16 segment SSG packaging bug — force server render. */
export const dynamic = 'force-dynamic';

const HOME_TITLE = `${SITE_NAME} — F1 Archive`;

export const metadata: Metadata = {
  title: { absolute: HOME_TITLE },
  description: SITE_TAGLINE,
  alternates: { canonical: '/' },
  openGraph: { title: HOME_TITLE, description: SITE_TAGLINE, url: '/', type: 'website' },
  twitter: { card: 'summary_large_image', title: HOME_TITLE, description: SITE_TAGLINE },
};

export default async function HomePage() {
  const [calendarData, standingsData, news] = await Promise.all([
    fetchSeasonSnapshotTyped(CURRENT_SEASON, 'calendar'),
    fetchSeasonSnapshotTyped(CURRENT_SEASON, 'standings_drivers'),
    aggregate({ maxItems: 6 }),
  ]);

  const renderNowMs = nowMs();
  const races = getRacesFromCalendar(calendarData);
  const standings = getDriverStandings(standingsData, 6);
  const previousRace = getLastFinishedRace(races);
  const nextRace = getLiveOrNextRace(races, new Date(renderNowMs));

  const previousRound = previousRace?.round != null ? Number(previousRace.round) : null;
  const previousResults =
    previousRound != null && Number.isFinite(previousRound)
      ? await fetchRoundSnapshot(CURRENT_SEASON, previousRound, 'results')
      : null;
  const lastRaceRecap = getLastRaceResult(previousResults);

  const nextRaceTitle = nextRace?.raceName ?? nextRace?.Circuit?.Location?.country ?? 'Season';
  const nextRaceCircuit = nextRace?.Circuit?.circuitName ?? '';
  const nextRaceDate = nextRace?.date ?? '';
  const nextRaceStart = nextRace ? raceStartMs(nextRace) : null;
  const circuitCover = circuitCoverSrc(nextRace?.Circuit?.circuitId);

  const eyebrow = nextRace?.round
    ? `${CURRENT_SEASON} · Round ${nextRace.round}`
    : `Next Race · ${CURRENT_SEASON}`;

  const subtitle = [nextRaceCircuit, nextRaceDate].filter(Boolean).join(' · ');

  return (
    <PageShell>
      <BentoGrid>
        {/* Next Race — asymmetric hero tile, no longer the whole viewport */}
        <BentoCard span={7} className="!p-0 overflow-hidden">
          <PosterHero
            eyebrow={eyebrow}
            title={nextRaceTitle}
            subtitle={subtitle || undefined}
            countdownTargetMs={nextRaceStart}
            circuitCoverSrc={circuitCover}
            showMobileLogo={false}
            contained
          />
        </BentoCard>

        {/* Latest Race — new panel, podium + fastest lap */}
        <BentoCard span={5}>
          {lastRaceRecap ? (
            <LatestRaceCard recap={lastRaceRecap} season={CURRENT_SEASON} />
          ) : (
            <div className="flex h-full flex-col items-center justify-center gap-2 text-center">
              <span className="label-caps text-text-mid">Latest Race</span>
              <span className="data-tabular text-text-low">No results yet this season</span>
            </div>
          )}
        </BentoCard>

        {/* Standings — 5 drivers, larger portraits, leader spotlight */}
        <BentoCard span={7}>
          <div className="mb-3 flex items-baseline justify-between gap-2">
            <h2 className="label-caps text-text-mid">Driver Standings</h2>
            <Link href="/season" className="label-caps text-accent">
              Full →
            </Link>
          </div>
          <FlatStandingsList rows={standings} season={CURRENT_SEASON} limit={5} avatarSize={48} />
        </BentoCard>

        {/* News */}
        <BentoCard span={5}>
          <NewsList items={news} heading="The Wire" />
        </BentoCard>
      </BentoGrid>
    </PageShell>
  );
}
