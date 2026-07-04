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
import { SplitHomeLayout } from '@/components/home/SplitHomeLayout';
import { HomeDataColumn } from '@/components/home/HomeDataColumn';
import { PodiumViz } from '@/components/season/PodiumViz';
import { circuitCoverSrc } from '@/lib/assets/f1-icons';

export const revalidate = 0;

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
  const standings = getDriverStandings(standingsData, 10);
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

  const podiumExtra =
    lastRaceRecap ? (
      <div className="hidden md:block lg:hidden">
        <PodiumViz
          raceLabel={`Last Race · ${lastRaceRecap.raceName}`}
          entries={lastRaceRecap.podium.map((p) => ({
            position: Number(p.position) as 1 | 2 | 3,
            driverCode: p.driverCode || p.driverName.split(' ').pop() || '',
            constructorName: p.constructorName,
          }))}
        />
      </div>
    ) : null;

  return (
    <SplitHomeLayout
      hero={{
        eyebrow,
        title: nextRaceTitle,
        subtitle: subtitle || undefined,
        countdownTargetMs: nextRaceStart,
        circuitCoverSrc: circuitCover,
      }}
      dataColumn={
        <HomeDataColumn
          standings={standings}
          season={CURRENT_SEASON}
          news={news}
          extra={podiumExtra}
        />
      }
    />
  );
}
