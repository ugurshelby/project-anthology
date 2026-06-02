import { Suspense } from 'react';
import {
  SeasonTrackerClient,
  type SeasonPreparedData,
} from '@/app/(site)/_components/season-tracker-client';
import { ShimmerGrid } from '@/app/(site)/_components/shimmer';
import { getRaceResult, getSeasonCalendar, getSeasonStandings } from '@/lib/data/f1';
import { getF1Context } from '@/lib/f1Calendar';

type MrRace = {
  round?: string;
  raceName?: string;
  date?: string;
  Circuit?: { circuitName?: string };
};

type MrDriverStanding = {
  position?: string;
  points?: string;
  wins?: string;
  Driver?: { code?: string; givenName?: string; familyName?: string };
  Constructors?: Array<{ name?: string }>;
};

type MrConstructorStanding = {
  position?: string;
  points?: string;
  Constructor?: { name?: string };
};

type MrResult = {
  Driver?: { code?: string };
  FastestLap?: { Time?: { time?: string } };
};

function parseDrivers(payload: unknown): SeasonPreparedData['drivers'] {
  const rows = (
    payload as {
      MRData?: {
        StandingsTable?: { StandingsLists?: Array<{ DriverStandings?: MrDriverStanding[] }> };
      };
    }
  )?.MRData?.StandingsTable?.StandingsLists?.[0]?.DriverStandings;

  if (!Array.isArray(rows)) return [];

  return rows
    .map((row) => ({
      position: Number(row.position ?? 0),
      code: row.Driver?.code ?? 'UNK',
      name: `${row.Driver?.givenName ?? ''} ${row.Driver?.familyName ?? ''}`.trim(),
      constructor: row.Constructors?.[0]?.name ?? 'Unknown',
      points: Number(row.points ?? 0),
      wins: Number(row.wins ?? 0),
    }))
    .filter((row) => row.position > 0);
}

function parseConstructors(payload: unknown): SeasonPreparedData['constructors'] {
  const rows = (
    payload as {
      MRData?: {
        StandingsTable?: {
          StandingsLists?: Array<{ ConstructorStandings?: MrConstructorStanding[] }>;
        };
      };
    }
  )?.MRData?.StandingsTable?.StandingsLists?.[0]?.ConstructorStandings;

  if (!Array.isArray(rows)) return [];

  return rows
    .map((row) => ({
      position: Number(row.position ?? 0),
      name: row.Constructor?.name ?? 'Unknown',
      points: Number(row.points ?? 0),
    }))
    .filter((row) => row.position > 0);
}

function parseCalendar(payload: unknown): MrRace[] {
  const rows = (
    payload as {
      MRData?: {
        RaceTable?: {
          Races?: MrRace[];
        };
      };
    }
  )?.MRData?.RaceTable?.Races;
  return Array.isArray(rows) ? rows : [];
}

function parseResultDetail(payload: unknown): { winner?: string; fastestLap?: string; podium: string[] } {
  const race = (
    payload as {
      MRData?: {
        RaceTable?: { Races?: Array<{ Results?: MrResult[] }> };
      };
    }
  )?.MRData?.RaceTable?.Races?.[0];

  const results = Array.isArray(race?.Results) ? race.Results : [];
  const winner = results[0]?.Driver?.code;
  const fastest = results.find((item) => item.FastestLap?.Time?.time)?.FastestLap?.Time?.time;
  const podium = results.slice(0, 3).map((item) => item.Driver?.code ?? 'TBA');
  return { winner, fastestLap: fastest, podium };
}

async function loadSeason(year: number): Promise<SeasonPreparedData> {
  const [standings, constructorsStandings, calendar] = await Promise.all([
    getSeasonStandings(year),
    getSeasonStandings(year),
    getSeasonCalendar(year),
  ]);

  const races = parseCalendar(calendar?.data ?? {});
  const nowIso = new Date().toISOString().slice(0, 10);

  const raceRows = await Promise.all(
    races.map(async (race) => {
      const round = Number(race.round ?? 0);
      const completed = Boolean(race.date && race.date < nowIso);
      let detail: { winner?: string; fastestLap?: string; podium: string[] } | undefined;

      if (completed && round > 0) {
        const result = await getRaceResult(year, round);
        if (result?.data) {
          detail = parseResultDetail(result.data);
        }
      }

      return {
        round,
        raceName: race.raceName ?? 'Unknown GP',
        circuitName: race.Circuit?.circuitName ?? 'Unknown Circuit',
        date: race.date ?? 'TBA',
        completed,
        detail,
      };
    }),
  );

  return {
    year,
    drivers: parseDrivers(standings?.data ?? {}),
    constructors: parseConstructors(constructorsStandings?.data ?? {}),
    races: raceRows.filter((race) => race.round > 0),
  };
}

async function SeasonSection() {
  const f1 = await getF1Context();
  const currentSeason = f1.currentSeason;
  const years = Array.from(
    { length: Math.max(currentSeason - 2022 + 1, 1) },
    (_, index) => 2022 + index,
  );
  const seasons = await Promise.all(years.map((year) => loadSeason(year)));
  const leader = seasons
    .find((season) => season.year === currentSeason)
    ?.drivers.find((driver) => driver.position === 1);

  return (
    <>
      <section className="hero" style={{ minHeight: 'calc(100vh - 52px)' }}>
        <div className="content-wrap hero-inner">
          <p className="eyebrow">Season Intelligence / Standings + Calendar + Results</p>
          <h1 className="hero-title">Season Tracker</h1>
          <p className="hero-subtitle">
            Current leader: {leader?.name ?? 'Unknown'} ({leader?.constructor ?? 'N/A'}) with{' '}
            {leader?.points ?? 0} points.
          </p>
          <div className="hud-row">
            <div className="hud-item">
              <p className="hud-label">Current Season</p>
              <p className="hud-value">{currentSeason}</p>
            </div>
            <div className="hud-item">
              <p className="hud-label">Data Window</p>
              <p className="hud-value">2022..{currentSeason}</p>
            </div>
            <div className="hud-item">
              <p className="hud-label">Sources</p>
              <p className="hud-value">standings/calendar/results</p>
            </div>
          </div>
        </div>
      </section>

      <div className="content-wrap">
        <SeasonTrackerClient seasons={seasons} initialSeason={currentSeason} />
      </div>
    </>
  );
}

export default function SeasonPage() {
  return (
    <main>
      <Suspense fallback={<ShimmerGrid count={8} />}>
        <SeasonSection />
      </Suspense>
    </main>
  );
}
