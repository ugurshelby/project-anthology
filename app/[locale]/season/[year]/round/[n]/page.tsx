import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { fetchRoundSnapshot, fetchSeasonSnapshotTyped } from '@/lib/data/f1';
import {
  getRacesFromCalendar,
  getRaceResultRows,
  getSprintResultRows,
  getQualifyingRows,
  getPitStopRows,
} from '@/lib/f1/mrdata';
import { CURRENT_SEASON, F1_SEASON_MIN, weekendSessionChips } from '@/lib/f1Calendar';
import { getCircuitWeather } from '@/lib/data/circuits';
import { getCircuitFacts } from '@/data/circuits/facts';
import { LocalTime } from '@/components/time/LocalTime';
import { teamThemeVars } from '@/lib/theme';
import { getTeamByName } from '@/config/team-colors';
import { BentoGrid } from '@/components/layout/BentoGrid';
import { BentoCard } from '@/components/bento/BentoCard';
import { RaceResultsTable, QualifyingTable } from '@/components/season/ResultsTable';
import { PitStopsTable } from '@/components/season/PitStopsTable';
import { JsonLd } from '@/components/seo/JsonLd';
import { siteUrl, localizedAlternates } from '@/lib/seo';

// Same dynamic posture as /season: current-season rounds must pass the
// staleness→live read path on every request; historical rounds are DB-stable.
export const revalidate = 0;
export const dynamic = 'force-dynamic';

const MAX_ROUNDS = 35;

interface PageProps {
  params: Promise<{ year: string; n: string; locale: string }>;
}

function parseParams(raw: { year: string; n: string }): { year: number; round: number } | null {
  const year = Number(raw.year);
  const round = Number(raw.n);
  if (!Number.isInteger(year) || year < F1_SEASON_MIN || year > CURRENT_SEASON) return null;
  if (!Number.isInteger(round) || round < 1 || round > MAX_ROUNDS) return null;
  return { year, round };
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const resolvedParams = await params;
  const parsed = parseParams(resolvedParams);
  if (!parsed) return { title: 'Round not found' };
  const { year, round } = parsed;
  const { locale } = resolvedParams;

  const calendar = await fetchSeasonSnapshotTyped(year, 'calendar');
  const race = getRacesFromCalendar(calendar).find((r) => Number(r.round) === round);
  const raceName = race?.raceName ?? `Round ${round}`;
  const title = `${raceName} ${year}`;
  const description = `${raceName} — round ${round} of the ${year} Formula 1 season: race result, qualifying and sprint classification.`;
  const path = `/season/${year}/round/${round}`;

  return {
    title,
    description,
    alternates: localizedAlternates(path, locale),
    openGraph: {
      title: `${title} — Results`,
      description,
      url: path,
      type: 'website',
      images: [{ url: '/opengraph-image', width: 1200, height: 630, alt: raceName }],
    },
    twitter: { card: 'summary_large_image', title: `${title} — Results`, description, images: ['/opengraph-image'] },
  };
}

export default async function RoundPage({ params }: PageProps) {
  const parsed = parseParams(await params);
  if (!parsed) notFound();
  const { year, round } = parsed;

  const [calendar, resultsData, qualiData, sprintData, pitstopsData] = await Promise.all([
    fetchSeasonSnapshotTyped(year, 'calendar'),
    fetchRoundSnapshot(year, round, 'results'),
    fetchRoundSnapshot(year, round, 'qualifying'),
    fetchRoundSnapshot(year, round, 'sprint'),
    fetchRoundSnapshot(year, round, 'pitstops'),
  ]);

  const race = getRacesFromCalendar(calendar).find((r) => Number(r.round) === round);
  const circuitId = race?.Circuit?.circuitId;
  const weather = circuitId ? await getCircuitWeather(circuitId) : null;
  const circuitFacts = circuitId ? getCircuitFacts(circuitId) : null;
  const sessionChips = weekendSessionChips(race);

  const results = getRaceResultRows(resultsData);
  const sprint = getSprintResultRows(sprintData);
  const quali = getQualifyingRows(qualiData);
  const pitstops = getPitStopRows(pitstopsData);

  const winner = results[0];
  const winnerTeam = winner ? getTeamByName(winner.constructorName) : undefined;
  const theme = teamThemeVars(winnerTeam?.id, year);

  return (
    <main
      id="main-content"
      style={theme as React.CSSProperties}
      className="mx-auto w-full max-w-[var(--container-max)] flex-1 bg-bg px-5 py-8 md:px-8 lg:px-16 lg:py-12"
    >
      <JsonLd
        data={{
          '@context': 'https://schema.org',
          '@type': 'SportsEvent',
          name: race?.raceName ?? `Round ${round}`,
          url: `${siteUrl()}/season/${year}/round/${round}`,
          startDate: race?.date,
          location: race?.Circuit?.Location
            ? {
                '@type': 'Place',
                name: race.Circuit.circuitName,
                address: {
                  '@type': 'PostalAddress',
                  addressLocality: race.Circuit.Location.locality,
                  addressCountry: race.Circuit.Location.country,
                },
              }
            : undefined,
          sport: 'Formula 1',
        }}
      />
      <header className="mb-8 flex flex-col gap-2">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <span className="label-caps text-text-mid">
            Round {round} · {year}
            {race?.Circuit?.Location?.country ? ` · ${race.Circuit.Location.country}` : ''}
          </span>
          {weather ? (
            <div className="flex items-center gap-2 rounded-full border border-white/10 bg-surface px-3 py-1 text-xs text-text-mid">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="font-medium text-text-hi">{weather.temperatureC}°C</span>
              <span>·</span>
              <span>{weather.summary}</span>
              {weather.windKmh ? (
                <>
                  <span>·</span>
                  <span>{weather.windKmh} km/h wind</span>
                </>
              ) : null}
            </div>
          ) : null}
        </div>
        <h1 className="headline-lg uppercase text-text-hi">{race?.raceName ?? `Round ${round}`}</h1>
        {winner ? (
          <p className="data-tabular text-text-mid">
            Winner: <span className="text-text-hi">{winner.driverName}</span> · {winner.constructorName}
          </p>
        ) : null}

        {sessionChips.length > 0 ? (
          <div className="mt-2 flex flex-wrap items-center gap-x-5 gap-y-2 rounded-[var(--radius-lg)] border border-hairline bg-surface/30 p-3.5 font-mono text-xs text-text-mid backdrop-blur-sm">
            <span className="label-caps text-accent shrink-0">Schedule:</span>
            {sessionChips.map((s) => (
              <span key={s.id} className="flex items-center gap-1.5">
                <span className="font-semibold text-text-hi">{s.label}</span>
                <span className="text-text-low">·</span>
                <LocalTime startMs={s.startMs} fallback={s.when} circuitTimeZone={circuitFacts?.timeZone} />
              </span>
            ))}
          </div>
        ) : null}
      </header>

      <BentoGrid>
        {results.length > 0 ? (
          <BentoCard span={sprint.length > 0 || quali.length > 0 || pitstops.length > 0 ? 8 : 12}>
            <span className="label-caps mb-3 block text-text-mid">Race Classification</span>
            <RaceResultsTable rows={results} />
          </BentoCard>
        ) : null}

        {quali.length > 0 ? (
          <BentoCard span={4}>
            <span className="label-caps mb-3 block text-text-mid">Qualifying</span>
            <QualifyingTable rows={quali} />
          </BentoCard>
        ) : null}

        {pitstops.length > 0 ? (
          <BentoCard span={sprint.length > 0 ? 6 : 4}>
            <div className="mb-3 flex items-center justify-between">
              <span className="label-caps text-text-mid">Pit Stops Telemetry</span>
              <span className="data-tabular text-xs text-text-mid">{pitstops.length} STOPS</span>
            </div>
            <PitStopsTable rows={pitstops} results={results} />
          </BentoCard>
        ) : null}

        {sprint.length > 0 ? (
          <BentoCard span={6}>
            <span className="label-caps mb-3 block text-text-mid">Sprint</span>
            <RaceResultsTable rows={sprint} />
          </BentoCard>
        ) : null}

        {results.length === 0 && quali.length === 0 && sprint.length === 0 && pitstops.length === 0 ? (
          <BentoCard span={12}>
            <span className="label-caps text-text-low">Results not yet available for this round.</span>
          </BentoCard>
        ) : null}
      </BentoGrid>
    </main>
  );
}
