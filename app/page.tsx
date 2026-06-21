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
import { PageShell, BentoGrid } from '@/components/layout/BentoGrid';
import { BentoCard } from '@/components/bento/BentoCard';
import { StatBlock } from '@/components/bento/StatBlock';
import { StandingsCard } from '@/components/standings/StandingsCard';
import { NewsList } from '@/components/news/NewsList';
import { PodiumViz } from '@/components/season/PodiumViz';
import { Countdown } from '@/components/home/Countdown';
import { circuitIconSrc } from '@/lib/assets/f1-icons';
import Image from 'next/image';

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

  void onThisDay;

  const nextRaceName = nextRace?.Circuit?.Location?.country ?? nextRace?.raceName ?? 'Season';
  const nextRaceCircuit = nextRace?.Circuit?.circuitName ?? '';
  const nextRaceStart = nextRace ? raceStartMs(nextRace) : null;
  const circuitOutline = circuitIconSrc(nextRace?.Circuit?.circuitId);
  const championshipLeader = standings[0];

  return (
    <PageShell>
      <BentoGrid>
        {/* Hero — next race */}
        <BentoCard span={8} className="flex min-h-72 flex-col justify-between">
          {circuitOutline ? (
            <Image
              src={circuitOutline}
              alt=""
              fill
              sizes="(max-width: 1024px) 100vw, 66vw"
              className="pointer-events-none object-contain object-right opacity-[0.06]"
            />
          ) : null}
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

        {/* Championship lead */}
        <BentoCard span={4}>
          {championshipLeader ? (
            <StatBlock
              value={championshipLeader.points}
              label="Championship Lead · PTS"
              sublabel={championshipLeader.driverName}
              size="lg"
            />
          ) : (
            <StatBlock value="—" label="Championship Lead" size="lg" />
          )}
        </BentoCard>

        {/* Last race podium */}
        <BentoCard span={4}>
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

        {/* The Wire — news */}
        <BentoCard span={4}>
          <NewsList items={news} />
        </BentoCard>
      </BentoGrid>
    </PageShell>
  );
}
