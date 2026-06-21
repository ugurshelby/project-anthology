import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { fetchRoundSnapshot, fetchSeasonSnapshotTyped } from '@/lib/data/f1';
import { getRacesFromCalendar } from '@/lib/f1/mrdata';
import { CURRENT_SEASON } from '@/lib/f1Calendar';

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
  void { resultsData, qualiData, sprintData };

  return <main id="main-content">{race?.raceName ?? `Round ${round}`}</main>;
}
