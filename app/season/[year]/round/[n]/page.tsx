import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { fetchRoundSnapshot, fetchSeasonSnapshotTyped } from '@/lib/data/f1';
import {
  getRacesFromCalendar,
  getRaceResultRows,
  getSprintResultRows,
  getQualifyingRows,
} from '@/lib/f1/mrdata';
import { CURRENT_SEASON } from '@/lib/f1Calendar';
import { teamThemeVars } from '@/lib/theme';
import { getTeamByName } from '@/config/team-colors';
import { BentoGrid } from '@/components/layout/BentoGrid';
import { BentoCard } from '@/components/bento/BentoCard';
import { RaceResultsTable, QualifyingTable } from '@/components/season/ResultsTable';

// Same dynamic posture as /season: current-season rounds must pass the
// staleness→live read path on every request; historical rounds are DB-stable.
export const revalidate = 0;
export const dynamic = 'force-dynamic';

const MAX_ROUNDS = 30;

interface PageProps {
  params: Promise<{ year: string; n: string }>;
}

function parseParams(raw: { year: string; n: string }): { year: number; round: number } | null {
  const year = Number(raw.year);
  const round = Number(raw.n);
  if (!Number.isInteger(year) || year !== CURRENT_SEASON) return null;
  if (!Number.isInteger(round) || round < 1 || round > MAX_ROUNDS) return null;
  return { year, round };
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const parsed = parseParams(await params);
  if (!parsed) return { title: 'Round not found' };
  const { year, round } = parsed;

  const calendar = await fetchSeasonSnapshotTyped(year, 'calendar');
  const race = getRacesFromCalendar(calendar).find((r) => Number(r.round) === round);
  const raceName = race?.raceName ?? `Round ${round}`;
  const title = `${raceName} ${year}`;
  const description = `${raceName} — round ${round} of the ${year} Formula 1 season: race result, qualifying and sprint classification.`;
  const path = `/season/${year}/round/${round}`;

  return {
    title,
    description,
    alternates: { canonical: path },
    openGraph: { title: `${title} — Results`, description, url: path, type: 'website' },
    twitter: { card: 'summary_large_image', title: `${title} — Results`, description },
  };
}

export default async function RoundPage({ params }: PageProps) {
  const parsed = parseParams(await params);
  if (!parsed) notFound();
  const { year, round } = parsed;

  const [calendar, resultsData, qualiData, sprintData] = await Promise.all([
    fetchSeasonSnapshotTyped(year, 'calendar'),
    fetchRoundSnapshot(year, round, 'results'),
    fetchRoundSnapshot(year, round, 'qualifying'),
    fetchRoundSnapshot(year, round, 'sprint'),
  ]);

  const race = getRacesFromCalendar(calendar).find((r) => Number(r.round) === round);
  const results = getRaceResultRows(resultsData);
  const sprint = getSprintResultRows(sprintData);
  const quali = getQualifyingRows(qualiData);

  const winner = results[0];
  const winnerTeam = winner ? getTeamByName(winner.constructorName) : undefined;
  const theme = teamThemeVars(winnerTeam?.id, year);

  return (
    <main
      id="main-content"
      style={theme as React.CSSProperties}
      className="mx-auto w-full max-w-[var(--container-max)] flex-1 bg-bg px-5 py-8 md:px-8 lg:px-16 lg:py-12"
    >
      <header className="mb-8 flex flex-col gap-1">
        <span className="label-caps text-text-mid">
          Round {round} · {year}
          {race?.Circuit?.Location?.country ? ` · ${race.Circuit.Location.country}` : ''}
        </span>
        <h1 className="headline-lg uppercase text-text-hi">{race?.raceName ?? `Round ${round}`}</h1>
        {winner ? (
          <p className="data-tabular text-text-mid">
            Winner: <span className="text-text-hi">{winner.driverName}</span> · {winner.constructorName}
          </p>
        ) : null}
      </header>

      <BentoGrid>
        {results.length > 0 ? (
          <BentoCard span={sprint.length > 0 || quali.length > 0 ? 8 : 12}>
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

        {sprint.length > 0 ? (
          <BentoCard span={6}>
            <span className="label-caps mb-3 block text-text-mid">Sprint</span>
            <RaceResultsTable rows={sprint} />
          </BentoCard>
        ) : null}

        {results.length === 0 && quali.length === 0 && sprint.length === 0 ? (
          <BentoCard span={12}>
            <span className="label-caps text-text-low">Results not yet available for this round.</span>
          </BentoCard>
        ) : null}
      </BentoGrid>
    </main>
  );
}
