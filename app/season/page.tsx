import type { Metadata } from 'next';
import { getSeasonData } from '@/lib/data/f1';
import { CURRENT_SEASON, F1_SEASON_MIN, getNextRace, isRaceDone } from '@/lib/f1Calendar';
import { PageShell, BentoGrid } from '@/components/layout/BentoGrid';
import { BentoCard } from '@/components/bento/BentoCard';
import { StatBlock } from '@/components/bento/StatBlock';
import { StandingsCard } from '@/components/standings/StandingsCard';
import { CalendarList } from '@/components/season/CalendarList';
import { PodiumViz } from '@/components/season/PodiumViz';
import { YearScrubber } from '@/components/season/YearScrubber';

export const revalidate = 0;
export const dynamic = 'force-dynamic';

const TITLE = 'Season';
const DESCRIPTION = `Formula 1 ${CURRENT_SEASON} season: driver and constructor standings, race calendar, and race recaps.`;

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  openGraph: {
    title: `${TITLE} — F1 ${CURRENT_SEASON}`,
    description: DESCRIPTION,
    url: '/season',
    type: 'website',
  },
  twitter: { card: 'summary_large_image', title: `${TITLE} — F1 ${CURRENT_SEASON}`, description: DESCRIPTION },
  alternates: { canonical: '/season' },
};

export default async function SeasonPage() {
  const seasonData = await getSeasonData(CURRENT_SEASON);
  const { standings, constructors, races, recap } = seasonData;

  const completed = races.filter((r) => isRaceDone(r)).length;
  const nextRace = getNextRace(races);
  const leader = standings[0];
  const mostWins = constructors.reduce(
    (top, c) => (Number(c.wins) > Number(top?.wins ?? '0') ? c : top),
    constructors[0],
  );

  return (
    <PageShell>
      {/* Header strip */}
      <header className="mb-8 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
        <YearScrubber year={CURRENT_SEASON} minSeason={F1_SEASON_MIN} currentSeason={CURRENT_SEASON} />
        <div className="flex gap-8">
          <Summary label="Rounds" value={String(races.length)} />
          <Summary label="Completed" value={String(completed)} />
          <Summary label="Leader" value={leader?.driverName.split(' ').pop()?.toUpperCase() ?? '—'} accent />
        </div>
      </header>

      <BentoGrid>
        <BentoCard span={8} className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <span className="label-caps text-text-mid">Calendar</span>
          </div>
          <CalendarList races={races} nextRound={nextRace?.round != null ? String(nextRace.round) : undefined} />
        </BentoCard>

        <StandingsCard drivers={standings} teams={constructors} season={CURRENT_SEASON} span={4} />

        <BentoCard span={4}>
          <StatBlock
            value={mostWins?.wins ?? '0'}
            label="Most Wins · Constructor"
            sublabel={mostWins?.constructorName}
            size="lg"
          />
        </BentoCard>

        <BentoCard span={8}>
          {recap ? (
            <PodiumViz
              raceLabel={`Last Race · ${recap.raceName}`}
              entries={recap.podium.map((p) => ({
                position: Number(p.position) as 1 | 2 | 3,
                driverCode: p.driverCode || p.driverName.split(' ').pop() || '',
                constructorName: p.constructorName,
              }))}
            />
          ) : (
            <span className="label-caps text-text-low">No completed races yet</span>
          )}
        </BentoCard>
      </BentoGrid>
    </PageShell>
  );
}

function Summary({ label, value, accent = false }: { label: string; value: string; accent?: boolean }) {
  return (
    <div className="flex flex-col">
      <span className="label-caps text-text-low">{label}</span>
      <span className={['font-condensed text-2xl font-700 uppercase', accent ? 'text-accent' : 'text-text-hi'].join(' ')} style={{ fontFamily: 'var(--font-condensed)' }}>
        {value}
      </span>
    </div>
  );
}
