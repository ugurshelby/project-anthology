import type { Metadata } from 'next';
import { Suspense } from 'react';
import { Link } from '@/i18n/routing';
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
  F1_SEASON_MIN,
  isRaceDone,
  getLastFinishedRace,
  getLiveOrNextRace,
  getRaceCountdownPhase,
  raceStartMs,
  weekendSessionChips,
} from '@/lib/f1Calendar';
import { getCircuitFacts } from '@/data/circuits/facts';
import { getCircuitWeather, getCircuitLocation } from '@/lib/data/circuits';
import { circuitCoverSrc } from '@/lib/assets/f1-icons';
import { getMedia } from '@/lib/media/read';
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

import { getTranslations, setRequestLocale } from 'next-intl/server';
import { formatDate, raceName, circuitName } from '@/lib/i18n/format';
import { localizedAlternates } from '@/lib/seo';

export const revalidate = 0;
/** Vercel @vercel/next + Next 16 segment SSG packaging bug — force server render. */
export const dynamic = 'force-dynamic';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const isTr = locale === 'tr';
  const title = isTr ? `${SITE_NAME} — F1 Arşivi` : `${SITE_NAME} — F1 Archive`;
  const description = isTr
    ? 'Apex — F1 arşivi: veriler, haberler, pistler, sezon sıralamaları ve takım telsizleri.'
    : SITE_TAGLINE;
  const urlPath = isTr ? '/tr' : '/';

  return {
    title: { absolute: title },
    description,
    alternates: localizedAlternates('/', locale),
    openGraph: {
      title,
      description,
      url: urlPath,
      type: 'website',
      images: [{ url: '/opengraph-image', width: 1200, height: 630, alt: title }],
    },
    twitter: { card: 'summary_large_image', title, description, images: ['/opengraph-image'] },
  };
}

const paddockCardClass = 'min-h-[320px] min-w-[min(85vw,22rem)] shrink-0 snap-start md:min-w-0';

async function HomeHeroBlock({ locale }: { locale: string }) {
  const t = await getTranslations({ locale, namespace: 'ui.home' });
  const calendarData = await fetchSeasonSnapshotTyped(CURRENT_SEASON, 'calendar');
  const renderNowMs = nowMs();
  const now = new Date(renderNowMs);
  const races = getRacesFromCalendar(calendarData);
  const previousRace = getLastFinishedRace(races);
  const nextRace = getLiveOrNextRace(races, now);

  const previousRound = previousRace?.round != null ? Number(previousRace.round) : null;
  const circuitId = nextRace?.Circuit?.circuitId;

  const [previousResults, circuitWeather, nextRaceLocation, circuitMedia] = await Promise.all([
    previousRound != null && Number.isFinite(previousRound)
      ? fetchRoundSnapshot(CURRENT_SEASON, previousRound, 'results')
      : Promise.resolve(null),
    circuitId ? getCircuitWeather(circuitId) : Promise.resolve(null),
    circuitId ? getCircuitLocation(circuitId) : Promise.resolve(null),
    circuitId ? getMedia('circuit', circuitId) : Promise.resolve(null),
  ]);
  const lastRaceRecap = getLastRaceResult(previousResults);

  const nextRaceTitle = raceName(nextRace?.raceName ?? nextRace?.Circuit?.Location?.country ?? t('seasonFallback'), locale);
  const nextRaceCircuit = circuitName(nextRace?.Circuit?.circuitName, locale);
  const nextRaceDate = nextRace?.date ? formatDate(`${nextRace.date}T12:00:00Z`, locale, { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' }) : '';
  const nextRaceStart = nextRace ? raceStartMs(nextRace) : null;
  const isLive = nextRaceStart !== null && getRaceCountdownPhase(nextRaceStart, renderNowMs) === 'live';
  const coverImage = circuitMedia && circuitMedia.status === 'image' ? circuitMedia : null;
  const circuitCover = coverImage?.image.src ?? circuitCoverSrc(nextRace?.Circuit?.circuitId);
  const nextRaceFacts = getCircuitFacts(nextRace?.Circuit?.circuitId);

  const eyebrow = nextRace?.round
    ? t('eyebrowRound', { season: CURRENT_SEASON, round: nextRace.round })
    : t('eyebrowNext', { season: CURRENT_SEASON });
  const subtitle = [nextRaceCircuit, nextRaceDate].filter(Boolean).join(' · ');

  const doneCount = races.filter((r) => isRaceDone(r, now)).length;
  const ticker: string[] = [];
  if (races.length > 0) {
    ticker.push(t('tickerSeason', { season: CURRENT_SEASON, done: doneCount, total: races.length }));
  }
  if (nextRace) {
    const nextLabel = (
      nextRace.Circuit?.Location?.locality ??
      nextRace.Circuit?.circuitName ??
      nextRace.raceName ??
      t('nextRound')
    ).toLocaleUpperCase(locale === 'tr' ? 'tr-TR' : 'en-GB');
    const km = nextRaceFacts?.lengthKm != null ? t('tickerKm', { km: nextRaceFacts.lengthKm }) : '';
    ticker.push(t('tickerNext', { label: nextLabel, km }));
  }

  return (
    <>
      <WeekendHero
        eyebrow={eyebrow}
        title={nextRaceTitle}
        subtitle={subtitle || undefined}
        countdownTargetMs={nextRaceStart}
        circuitCoverSrc={circuitCover}
        circuitCoverVariants={coverImage?.image.variants}
        circuitCoverCredit={coverImage?.attribution}
        sessions={weekendSessionChips(nextRace, locale)}
        circuitTimeZone={nextRaceLocation?.timeZone ?? nextRaceFacts?.timeZone}
        lastWinnerName={lastRaceRecap?.podium[0]?.driverName}
        lastRaceName={raceName(lastRaceRecap?.raceName, locale)}
        weather={circuitWeather}
        isLive={isLive}
      />
      <div className="mt-6 md:mt-8">
        <SeasonTicker items={ticker} />
      </div>
    </>
  );
}

async function HomeStandingsColumn({ season }: { season: number }) {
  const [standingsData, constructorData] = await Promise.all([
    fetchSeasonSnapshotTyped(season, 'standings_drivers'),
    fetchSeasonSnapshotTyped(season, 'standings_constructors'),
  ]);
  const standings = getDriverStandings(standingsData, 6);
  const constructors = getConstructorStandings(constructorData, 3);
  return (
    <BentoCard span={4} className={paddockCardClass}>
      <ChampionshipPulse drivers={standings} constructors={constructors} season={season} />
    </BentoCard>
  );
}

async function HomeWireColumn({ season }: { season: number }) {
  const news = await getLatestNews(8);
  return (
    <BentoCard span={4} className={paddockCardClass}>
      <HomeWireFeed items={news} season={season} />
    </BentoCard>
  );
}

async function HomeAnthologyColumn({ locale }: { locale: string }) {
  const t = await getTranslations({ locale, namespace: 'ui.home' });
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
          <span className="label-caps text-accent">{t('anthologyKicker')}</span>
          <span
            className="mt-2 font-condensed text-2xl font-700 uppercase italic text-text-hi"
            style={{ fontFamily: 'var(--font-condensed)' }}
          >
            {t('longReads')}
          </span>
          <span className="mt-2 body-md text-text-mid">{t('openArchive')}</span>
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

export default async function HomePage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams?: Promise<{ season?: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const resolvedSearchParams = searchParams ? await searchParams : undefined;
  const raw = Number(resolvedSearchParams?.season);
  const season = Number.isInteger(raw) && raw >= F1_SEASON_MIN && raw <= CURRENT_SEASON ? raw : CURRENT_SEASON;

  return (
    <PageShell className="!pt-0 lg:!pt-0">
      <Suspense fallback={<HomeHeroFallback />}>
        <HomeHeroBlock locale={locale} />
      </Suspense>

      <div className="mt-6 flex flex-col gap-6 md:mt-8 md:gap-8">
        <HomePaddockRail>
          <Suspense fallback={<HomePaddockCardFallback />}>
            <HomeStandingsColumn season={season} />
          </Suspense>
          <Suspense fallback={<HomePaddockCardFallback />}>
            <HomeWireColumn season={season} />
          </Suspense>
          <Suspense fallback={<HomePaddockCardFallback />}>
            <HomeAnthologyColumn locale={locale} />
          </Suspense>
        </HomePaddockRail>

        <Suspense fallback={<HomeArchiveFallback />}>
          <HomeArchiveBlock />
        </Suspense>
      </div>
    </PageShell>
  );
}
