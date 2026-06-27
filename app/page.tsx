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
import { CURRENT_SEASON, getLastFinishedRace, getLiveOrNextRace, raceStartMs } from '@/lib/f1Calendar';
import { getPublishedStories } from '@/lib/data/stories';
import { PageShell, BentoGrid } from '@/components/layout/BentoGrid';
import { BentoCard } from '@/components/bento/BentoCard';
import { StandingsCard } from '@/components/standings/StandingsCard';
import { NewsList } from '@/components/news/NewsList';
import { PodiumViz } from '@/components/season/PodiumViz';
import { Countdown } from '@/components/home/Countdown';
import { DriverAvatar } from '@/components/bento/DriverAvatar';
import { StoryCard } from '@/components/anthology/StoryCard';
import { circuitCoverSrc, carSrc } from '@/lib/assets/f1-icons';
import { resolveTeamUiColor } from '@/config/team-colors';
import Image from 'next/image';
import Link from 'next/link';

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
  const [calendarData, standingsData, constructorData, news, onThisDay, stories] = await Promise.all([
    fetchSeasonSnapshotTyped(CURRENT_SEASON, 'calendar'),
    fetchSeasonSnapshotTyped(CURRENT_SEASON, 'standings_drivers'),
    fetchSeasonSnapshotTyped(CURRENT_SEASON, 'standings_constructors'),
    aggregate({ maxItems: 6 }),
    getOnThisDay(),
    getPublishedStories(),
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

  void onThisDay;

  const nextRaceName = nextRace?.Circuit?.Location?.country ?? nextRace?.raceName ?? 'Season';
  const nextRaceCircuit = nextRace?.Circuit?.circuitName ?? '';
  const nextRaceStart = nextRace ? raceStartMs(nextRace) : null;
  const circuitCover = circuitCoverSrc(nextRace?.Circuit?.circuitId);
  const championshipLeader = standings[0];
  const leaderColor = resolveTeamUiColor(undefined, championshipLeader?.constructorName);
  const leaderCar = carSrc(championshipLeader?.constructorId, championshipLeader?.constructorName);
  const featuredStory = stories[0];
  const gap = championshipLeader && standings[1]
    ? Number(championshipLeader.points) - Number(standings[1].points)
    : null;

  return (
    <PageShell>
      <BentoGrid>
        {/* Hero — next race. Live circuit photo from asset-package. */}
        <BentoCard span={8} className="relative flex min-h-80 flex-col justify-between overflow-hidden">
          {circuitCover ? (
            <Image
              src={circuitCover}
              alt=""
              fill
              priority
              sizes="(max-width: 1024px) 100vw, 66vw"
              className="pointer-events-none object-cover object-center"
            />
          ) : null}
          <span
            aria-hidden
            className="pointer-events-none absolute inset-0 bg-gradient-to-r from-bg via-bg/85 to-bg/30"
          />
          <span
            aria-hidden
            className="pointer-events-none absolute inset-0 bg-gradient-to-t from-bg/90 via-transparent to-bg/40"
          />
          <div className="relative z-10 flex flex-col gap-1">
            <span className="label-caps text-accent">
              Next Race{nextRace?.round ? ` · Round ${nextRace.round}` : ''}
            </span>
            <h1 className="display-hero uppercase text-text-hi">{nextRaceName}</h1>
            {nextRaceCircuit ? <p className="data-tabular text-text-mid">{nextRaceCircuit}</p> : null}
          </div>
          <div className="relative z-10 mt-6">
            {nextRaceStart ? (
              <Countdown targetMs={nextRaceStart} />
            ) : (
              <span className="label-caps text-text-low">Schedule to be confirmed</span>
            )}
          </div>
        </BentoCard>

        {/* Standings — single card with Drivers/Teams toggle */}
        <StandingsCard drivers={standings} teams={constructors} season={CURRENT_SEASON} span={4} />

        {/* Championship lead — leader portrait + car silhouette, no empty space */}
        <BentoCard span={4} as="div" className="relative flex min-h-56 flex-col justify-between">
          <span aria-hidden className="absolute inset-y-0 left-0 w-1" style={{ backgroundColor: leaderColor }} />
          {leaderCar ? (
            <Image
              src={leaderCar}
              alt=""
              width={360}
              height={120}
              className="pointer-events-none absolute -bottom-2 right-0 w-3/4 object-contain opacity-25"
            />
          ) : null}
          <div className="relative z-10 flex items-start justify-between">
            <span className="label-caps text-text-mid">Championship Leader</span>
            {championshipLeader ? (
              <DriverAvatar
                driverName={championshipLeader.driverName}
                driverCode={championshipLeader.driverCode}
                driverId={championshipLeader.driverId}
                constructorName={championshipLeader.constructorName}
                season={CURRENT_SEASON}
                size={56}
              />
            ) : null}
          </div>
          {championshipLeader ? (
            <Link href={`/drivers/${championshipLeader.driverId}`} className="relative z-10 flex flex-col gap-1">
              <span className="hero-number text-[clamp(48px,7vw,80px)] text-text-hi">{championshipLeader.points}</span>
              <span className="font-condensed text-2xl font-700 uppercase leading-none text-text-hi" style={{ fontFamily: 'var(--font-condensed)' }}>
                {championshipLeader.driverName}
              </span>
              <span className="data-tabular text-text-mid">
                {championshipLeader.constructorName}
                {gap != null && gap > 0 ? ` · +${gap} ahead` : ''}
              </span>
            </Link>
          ) : (
            <span className="hero-number text-6xl text-text-low">—</span>
          )}
        </BentoCard>

        {/* Last race podium */}
        <BentoCard span={4} className="flex flex-col justify-center">
          {lastRaceRecap ? (
            <PodiumViz
              raceLabel={`Last Race · ${lastRaceRecap.raceName}`}
              entries={lastRaceRecap.podium.map((p) => ({
                position: Number(p.position) as 1 | 2 | 3,
                driverCode: p.driverCode || p.driverName.split(' ').pop() || '',
                constructorName: p.constructorName,
              }))}
            />
          ) : (
            <span className="label-caps text-text-low">No recent race</span>
          )}
        </BentoCard>

        {/* Featured story — cinematic imagery from the anthology */}
        {featuredStory ? (
          <div className="col-span-4 md:col-span-8 lg:col-span-4">
            <StoryCard story={featuredStory} wide />
          </div>
        ) : null}

        {/* The Wire — news */}
        <BentoCard span={featuredStory ? 8 : 12}>
          <NewsList items={news} />
        </BentoCard>
      </BentoGrid>
    </PageShell>
  );
}
