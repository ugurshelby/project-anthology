import type { Metadata } from 'next';
import { Suspense } from 'react';
import Link from 'next/link';
import { SITE_NAME, SITE_TAGLINE } from '@/lib/seo';
import { fetchSeasonSnapshotTyped, fetchRoundSnapshot, getOnThisDay } from '@/lib/data/f1';
import { getPublishedStories } from '@/lib/data/stories';
import { getLatestNews } from '@/lib/data/news';
import {
  getConstructorStandings,
  getDriverStandings,
  getLastRaceResult,
  getRacesFromCalendar,
  nowMs,
} from '@/lib/f1/mrdata';
import {
  CURRENT_SEASON,
  isRaceDone,
  getLastFinishedRace,
  getLiveOrNextRace,
  raceStartMs,
  weekendSessionChips,
} from '@/lib/f1Calendar';
import { getCircuitFacts } from '@/data/circuits/facts';
import { circuitCoverSrc } from '@/lib/assets/f1-icons';
import { pickWeekendStory } from '@/lib/home/pickWeekendStory';
import { WeekendHero } from '@/components/home/WeekendHero';
import { ChampionshipPulse } from '@/components/home/ChampionshipPulse';
import { HomeWireFeed } from '@/components/home/HomeWireFeed';
import { HomeAnthologyCard } from '@/components/home/HomeAnthologyCard';
import { OnThisDayCard } from '@/components/home/OnThisDayCard';
import { SeasonTicker } from '@/components/home/SeasonTicker';
import { HomePaddockRail } from '@/components/home/HomePaddockRail';
import {
  HomeHeroFallback,
  HomePaddockCardFallback,
  HomeArchiveFallback,
} from '@/components/home/HomeFallbacks';
import { PageShell } from '@/components/layout/BentoGrid';
import { BentoCard } from '@/components/bento/BentoCard';

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

const paddockCardClass = 'min-h-[320px] min-w-[85vw] shrink-0 snap-start md:min-w-0';

async function HomeHeroBlock() {
  const calendarData = await fetchSeasonSnapshotTyped(CURRENT_SEASON, 'calendar');
  const renderNowMs = nowMs();
  const now = new Date(renderNowMs);
  const races = getRacesFromCalendar(calendarData);
  const previousRace = getLastFinishedRace(races);
  const nextRace = getLiveOrNextRace(races, now);

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

  const doneCount = races.filter((r) => isRaceDone(r, now)).length;
  const ticker: string[] = [];
  if (races.length > 0) {
    ticker.push(`${CURRENT_SEASON} SEASON: ${doneCount}/${races.length} RACES COMPLETED`);
  }
  if (nextRace) {
    const facts = getCircuitFacts(nextRace.Circuit?.circuitId);
    const nextLabel = (
      nextRace.Circuit?.Location?.locality ??
      nextRace.Circuit?.circuitName ??
      nextRace.raceName ??
      'Next round'
    ).toUpperCase();
    const km = facts?.lengthKm != null ? ` (${facts.lengthKm} KM)` : '';
    ticker.push(`NEXT: ${nextLabel}${km}`);
  }

  return (
    <>
      <WeekendHero
        eyebrow={eyebrow}
        title={nextRaceTitle}
        subtitle={subtitle || undefined}
        countdownTargetMs={nextRaceStart}
        circuitCoverSrc={circuitCover}
        sessions={weekendSessionChips(nextRace)}
        lastWinnerName={lastRaceRecap?.podium[0]?.driverName}
        lastRaceName={lastRaceRecap?.raceName}
      />
      <div className="mt-6 md:mt-8">
        <SeasonTicker items={ticker} />
      </div>
    </>
  );
}

async function HomeStandingsColumn() {
  const [standingsData, constructorData] = await Promise.all([
    fetchSeasonSnapshotTyped(CURRENT_SEASON, 'standings_drivers'),
    fetchSeasonSnapshotTyped(CURRENT_SEASON, 'standings_constructors'),
  ]);
  const standings = getDriverStandings(standingsData, 6);
  const constructors = getConstructorStandings(constructorData, 3);
  return (
    <BentoCard span={4} className={paddockCardClass}>
      <ChampionshipPulse drivers={standings} constructors={constructors} season={CURRENT_SEASON} />
    </BentoCard>
  );
}

async function HomeWireColumn() {
  const news = await getLatestNews(8);
  return (
    <BentoCard span={4} className={paddockCardClass}>
      <HomeWireFeed items={news} />
    </BentoCard>
  );
}

async function HomeAnthologyColumn() {
  const [calendarData, stories] = await Promise.all([
    fetchSeasonSnapshotTyped(CURRENT_SEASON, 'calendar'),
    getPublishedStories(),
  ]);
  const nextRace = getLiveOrNextRace(getRacesFromCalendar(calendarData), new Date(nowMs()));
  const featuredStory = pickWeekendStory(stories, [
    nextRace?.raceName,
    nextRace?.Circuit?.circuitName,
    nextRace?.Circuit?.Location?.locality,
    nextRace?.Circuit?.Location?.country,
  ]);

  return (
    <BentoCard span={4} className={`${paddockCardClass} !p-0`}>
      {featuredStory ? (
        <HomeAnthologyCard story={featuredStory} />
      ) : (
        <Link href="/anthology" className="flex h-full min-h-[280px] flex-col justify-end p-6">
          <span className="label-caps text-accent">Anthology</span>
          <span
            className="mt-2 font-condensed text-2xl font-700 uppercase italic text-text-hi"
            style={{ fontFamily: 'var(--font-condensed)' }}
          >
            Long reads
          </span>
          <span className="mt-2 body-md text-text-mid">Open the archive →</span>
        </Link>
      )}
    </BentoCard>
  );
}

async function HomeArchiveBlock() {
  const onThisDay = await getOnThisDay();
  if (onThisDay.length === 0) return null;
  return <OnThisDayCard entries={onThisDay} />;
}

export default function HomePage() {
  return (
    <PageShell className="!pt-0 lg:!pt-0">
      <Suspense fallback={<HomeHeroFallback />}>
        <HomeHeroBlock />
      </Suspense>

      <div className="mt-6 flex flex-col gap-6 md:mt-8 md:gap-8">
        <HomePaddockRail>
          <Suspense fallback={<HomePaddockCardFallback />}>
            <HomeStandingsColumn />
          </Suspense>
          <Suspense fallback={<HomePaddockCardFallback />}>
            <HomeWireColumn />
          </Suspense>
          <Suspense fallback={<HomePaddockCardFallback />}>
            <HomeAnthologyColumn />
          </Suspense>
        </HomePaddockRail>

        <Suspense fallback={<HomeArchiveFallback />}>
          <HomeArchiveBlock />
        </Suspense>
      </div>
    </PageShell>
  );
}
