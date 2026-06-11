import type { Metadata } from 'next';
import { CompactBentoDashboard } from '@/components/home/CompactBentoDashboard';
import type { BentoRacePanel } from '@/components/home/types';
import { SITE_NAME, SITE_TAGLINE } from '@/lib/seo';
import { fetchSeasonSnapshotTyped, fetchRoundSnapshot, getOnThisDay } from '@/lib/data/f1';
import { aggregate } from '@/lib/news/aggregate';
import {
  formatRaceCountdown,
  getConstructorStandings,
  getDriverStandings,
  getLastRaceResult,
  getRacesFromCalendar,
  nowMs,
  raceStartMs,
} from '@/lib/f1/mrdata';
import { CURRENT_SEASON, getF1Context, getLastFinishedRace } from '@/lib/f1Calendar';

export const revalidate = 0;

const HOME_TITLE = `${SITE_NAME} — F1 Archive`;

export const metadata: Metadata = {
  title: { absolute: HOME_TITLE },
  description: SITE_TAGLINE,
  alternates: { canonical: '/' },
  openGraph: {
    title: HOME_TITLE,
    description: SITE_TAGLINE,
    url: '/',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: HOME_TITLE,
    description: SITE_TAGLINE,
  },
};

export default async function HomePage() {
  const [calendarData, standingsData, constructorData, news, onThisDay] = await Promise.all([
    fetchSeasonSnapshotTyped(CURRENT_SEASON, 'calendar'),
    fetchSeasonSnapshotTyped(CURRENT_SEASON, 'standings_drivers'),
    fetchSeasonSnapshotTyped(CURRENT_SEASON, 'standings_constructors'),
    aggregate({ maxItems: 6 }),
    getOnThisDay(),
  ]);

  const renderNowMs = nowMs();

  const races = getRacesFromCalendar(calendarData);
  const ctx = getF1Context(races);
  const standings = getDriverStandings(standingsData, 10);
  const constructors = getConstructorStandings(constructorData, 3);
  const leader = standings[0] ?? null;

  const previousRace = getLastFinishedRace(races);
  const nextRace = ctx.nextRace;

  const previousRound =
    previousRace?.round != null ? Number(previousRace.round) : null;
  const previousResults =
    previousRound != null && Number.isFinite(previousRound)
      ? await fetchRoundSnapshot(CURRENT_SEASON, previousRound, 'results')
      : null;
  const lastRaceRecap = getLastRaceResult(previousResults);

  const countdown =
    nextRace != null
      ? formatRaceCountdown(raceStartMs(nextRace), renderNowMs)
      : undefined;
  const countdownTargetMs =
    nextRace != null ? raceStartMs(nextRace) : undefined;

  const nextPanel: BentoRacePanel | null = nextRace
    ? {
        race: nextRace,
        role: 'Next Race',
        countdown,
        countdownTargetMs,
      }
    : null;

  const totalRounds = races.length || 24;
  const currentRound = previousRace?.round != null
    ? Number(previousRace.round)
    : nextRace?.round != null
      ? Math.max(1, Number(nextRace.round) - 1)
      : 1;

  return (
    <CompactBentoDashboard
      season={CURRENT_SEASON}
      leader={leader}
      standings={standings}
      constructors={constructors}
      lastRaceRecap={lastRaceRecap}
      previousPanel={null}
      nextPanel={nextPanel}
      afterNextPanel={null}
      news={news}
      onThisDay={onThisDay}
      renderNowMs={renderNowMs}
      totalRounds={totalRounds}
      currentRound={currentRound}
    />
  );
}
