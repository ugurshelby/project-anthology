import type { Metadata } from 'next';
import { SITE_NAME, SITE_TAGLINE } from '@/lib/seo';
import { fetchSeasonSnapshotTyped, fetchRoundSnapshot, getOnThisDay } from '@/lib/data/f1';
import { aggregate } from '@/lib/news/aggregate';
import {
  getConstructorStandings,
  getDriverStandings,
  getLastRaceResult,
  getRacesFromCalendar,
  nowMs,
} from '@/lib/f1/mrdata';
import { CURRENT_SEASON, getLastFinishedRace, getLiveOrNextRace } from '@/lib/f1Calendar';

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
  // Data layer preserved — the frontend was reset and will be rebuilt on top of
  // these server-side reads.
  const [calendarData, standingsData, constructorData, news, onThisDay] = await Promise.all([
    fetchSeasonSnapshotTyped(CURRENT_SEASON, 'calendar'),
    fetchSeasonSnapshotTyped(CURRENT_SEASON, 'standings_drivers'),
    fetchSeasonSnapshotTyped(CURRENT_SEASON, 'standings_constructors'),
    aggregate({ maxItems: 6 }),
    getOnThisDay(),
  ]);

  const renderNowMs = nowMs();
  const races = getRacesFromCalendar(calendarData);
  const standings = getDriverStandings(standingsData, 10);
  const constructors = getConstructorStandings(constructorData, 3);
  const previousRace = getLastFinishedRace(races);
  const nextRace = getLiveOrNextRace(races, new Date(renderNowMs));

  const previousRound = previousRace?.round != null ? Number(previousRace.round) : null;
  const previousResults =
    previousRound != null && Number.isFinite(previousRound)
      ? await fetchRoundSnapshot(CURRENT_SEASON, previousRound, 'results')
      : null;
  const lastRaceRecap = getLastRaceResult(previousResults);

  void { standings, constructors, news, onThisDay, nextRace, lastRaceRecap };

  return <main id="main-content">Home</main>;
}
