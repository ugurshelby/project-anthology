import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { BackButton } from '@/components/ui/BackButton';
import { SafeImage } from '@/components/ui/SafeImage';
import { SectionDivider } from '@/components/ui/SectionDivider';
import { fetchRoundSnapshot, fetchSeasonSnapshotTyped } from '@/lib/data/f1';
import {
  getQualifyingRows,
  getRaceResultRows,
  getRacesFromCalendar,
  getRoundRaceInfo,
  getSprintResultRows,
  type QualifyingRow,
  type RaceResultRow,
} from '@/lib/f1/mrdata';
import { circuitIconSrc } from '@/lib/assets/f1-icons';
import { CURRENT_SEASON } from '@/lib/f1Calendar';
import { resolveTeamUiColor } from '@/config/team-colors';

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

function TeamCell({ name }: { name: string }) {
  return (
    <span style={{ color: 'var(--muted)' }}>{name}</span>
  );
}

function ResultsTable({ rows, showGrid }: { rows: RaceResultRow[]; showGrid: boolean }) {
  return (
    <div className="overflow-x-auto border border-border">
      <table className="w-full min-w-[560px] text-left font-mono text-xs tracking-wider">
        <thead className="bg-surface" style={{ color: 'var(--muted)' }}>
          <tr>
            <th className="px-4 py-3">Pos</th>
            <th className="px-4 py-3">Driver</th>
            <th className="px-4 py-3">Team</th>
            {showGrid ? <th className="px-4 py-3 text-right">Grid</th> : null}
            <th className="px-4 py-3 text-right">Laps</th>
            <th className="px-4 py-3 text-right">Time / Status</th>
            <th className="px-4 py-3 text-right">Pts</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {rows.map((row) => {
            const teamColor = resolveTeamUiColor(null, row.constructorName);
            const podium = Number(row.position) >= 1 && Number(row.position) <= 3;
            return (
              <tr
                key={`${row.position}-${row.driverName}`}
                style={podium ? { backgroundColor: `color-mix(in srgb, ${teamColor} 6%, transparent)` } : undefined}
              >
                <td
                  className="px-4 py-3"
                  style={{
                    color: row.position === '1' ? 'var(--accent)' : 'var(--paper)',
                    borderLeft: `3px solid ${teamColor}`,
                  }}
                >
                  {row.position}
                </td>
                <td className="px-4 py-3" style={{ color: 'var(--paper)' }}>
                  {row.driverName}
                  {row.fastestLap ? (
                    <span
                      className="ml-2 text-[9px] uppercase"
                      style={{ color: 'var(--muted)' }}
                      title="Fastest lap"
                    >
                      FL ⬦
                    </span>
                  ) : null}
                </td>
                <td className="px-4 py-3">
                  <TeamCell name={row.constructorName} />
                </td>
                {showGrid ? (
                  <td className="px-4 py-3 text-right" style={{ color: 'var(--muted)' }}>
                    {row.grid ?? '—'}
                  </td>
                ) : null}
                <td className="px-4 py-3 text-right" style={{ color: 'var(--muted)' }}>
                  {row.laps ?? '—'}
                </td>
                <td className="px-4 py-3 text-right" style={{ color: 'var(--paper)' }}>
                  {row.timeOrStatus}
                </td>
                <td className="px-4 py-3 text-right" style={{ color: 'var(--paper)' }}>
                  {row.points}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function QualifyingTable({ rows }: { rows: QualifyingRow[] }) {
  return (
    <div className="overflow-x-auto border border-border">
      <table className="w-full min-w-[560px] text-left font-mono text-xs tracking-wider">
        <thead className="bg-surface" style={{ color: 'var(--muted)' }}>
          <tr>
            <th className="px-4 py-3">Pos</th>
            <th className="px-4 py-3">Driver</th>
            <th className="px-4 py-3">Team</th>
            <th className="px-4 py-3 text-right">Q1</th>
            <th className="px-4 py-3 text-right">Q2</th>
            <th className="px-4 py-3 text-right">Q3</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {rows.map((row) => {
            const teamColor = resolveTeamUiColor(null, row.constructorName);
            return (
              <tr
                key={`${row.position}-${row.driverName}`}
                style={row.position === '1' ? { backgroundColor: `color-mix(in srgb, ${teamColor} 8%, transparent)` } : undefined}
              >
                <td
                  className="px-4 py-3"
                  style={{
                    color: row.position === '1' ? 'var(--accent)' : 'var(--paper)',
                    borderLeft: `3px solid ${teamColor}`,
                  }}
                >
                  {row.position}
                </td>
                <td className="px-4 py-3" style={{ color: 'var(--paper)' }}>
                  {row.driverName}
                </td>
                <td className="px-4 py-3">
                  <TeamCell name={row.constructorName} />
                </td>
                <td className="px-4 py-3 text-right" style={{ color: 'var(--muted)' }}>
                  {row.q1 ?? '—'}
                </td>
                <td className="px-4 py-3 text-right" style={{ color: 'var(--muted)' }}>
                  {row.q2 ?? '—'}
                </td>
                <td className="px-4 py-3 text-right" style={{ color: 'var(--paper)' }}>
                  {row.q3 ?? '—'}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

export default async function RoundDetailPage({ params }: PageProps) {
  const parsed = parseParams(await params);
  if (!parsed) notFound();
  const { year, round } = parsed;

  const [calendar, resultsData, qualiData, sprintData] = await Promise.all([
    fetchSeasonSnapshotTyped(year, 'calendar'),
    fetchRoundSnapshot(year, round, 'results'),
    fetchRoundSnapshot(year, round, 'qualifying'),
    fetchRoundSnapshot(year, round, 'sprint'),
  ]);

  const calendarRace = getRacesFromCalendar(calendar).find(
    (r) => Number(r.round) === round,
  );
  // Header prefers calendar (always present once a season exists); any session
  // snapshot works as a fallback for header fields.
  const info =
    getRoundRaceInfo(resultsData) ??
    getRoundRaceInfo(qualiData) ??
    getRoundRaceInfo(sprintData);
  if (!calendarRace && !info) notFound();

  const raceName = calendarRace?.raceName ?? info?.raceName ?? 'Grand Prix';
  const date = calendarRace?.date ?? info?.date ?? null;
  const circuitId = calendarRace?.Circuit?.circuitId ?? info?.circuitId ?? null;
  const circuitName = calendarRace?.Circuit?.circuitName ?? info?.circuitName ?? null;
  const locality = calendarRace?.Circuit?.Location?.locality ?? info?.locality ?? null;
  const country = calendarRace?.Circuit?.Location?.country ?? info?.country ?? null;
  const circuitSrc = circuitIconSrc(circuitId ?? undefined);

  const raceRows = getRaceResultRows(resultsData);
  const qualiRows = getQualifyingRows(qualiData);
  const sprintRows = getSprintResultRows(sprintData);
  const hasAnySession = raceRows.length > 0 || qualiRows.length > 0 || sprintRows.length > 0;

  return (
    <div className="content-wrap py-section-gap">
      <BackButton fallbackHref={`/season?year=${year}`} label={`${year} Season`} />

      <header className="mt-6 flex flex-wrap items-end justify-between gap-6">
        <div>
          <p
            className="font-mono text-[10px] uppercase tracking-[0.15em]"
            style={{ color: 'var(--accent)' }}
          >
            {year} · Round {round}
            {date ? ` · ${date}` : ''}
          </p>
          <h1
            className="mt-2 font-display text-[clamp(2.5rem,8vw,5rem)] leading-[0.9] tracking-[0.04em]"
            style={{ color: 'var(--paper)' }}
          >
            {raceName}
          </h1>
          {circuitName ? (
            <p
              className="mt-2 font-condensed text-sm uppercase tracking-[0.14em]"
              style={{ color: 'var(--muted)' }}
            >
              {circuitName}
              {locality || country
                ? ` — ${[locality, country].filter(Boolean).join(', ')}`
                : ''}
            </p>
          ) : null}
        </div>
        {circuitSrc ? (
          <SafeImage
            src={circuitSrc}
            alt=""
            width={180}
            height={90}
            className="h-20 w-40 object-contain opacity-80"
          />
        ) : null}
      </header>

      {!hasAnySession ? (
        <p className="mt-10 text-sm" style={{ color: 'var(--muted)' }}>
          No session results for this round yet — check back after the race weekend.
        </p>
      ) : null}

      {raceRows.length > 0 ? (
        <section className="mt-section-gap">
          <SectionDivider title="Race Result" />
          <ResultsTable rows={raceRows} showGrid />
        </section>
      ) : null}

      {qualiRows.length > 0 ? (
        <section className="mt-section-gap">
          <SectionDivider title="Qualifying" />
          <QualifyingTable rows={qualiRows} />
        </section>
      ) : null}

      {sprintRows.length > 0 ? (
        <section className="mt-section-gap">
          <SectionDivider title="Sprint" />
          <ResultsTable rows={sprintRows} showGrid={false} />
        </section>
      ) : null}
    </div>
  );
}
