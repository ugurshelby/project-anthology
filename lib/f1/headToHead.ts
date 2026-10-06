import type { MrData } from '@/lib/data/f1';

/**
 * Teammate head-to-head, derived purely from the per-round `qualifying` and
 * `results` snapshots already in `f1_snapshots` — no extra upstream call.
 *
 * Rules (documented so the UI can state them):
 *  - Qualifying: the teammate with the better qualifying `position` wins the round.
 *  - Race: the teammate with the better classified `position` wins the round, so a
 *    retirement ranks behind a classified finisher (official classification order).
 *  - Sprint sessions are not counted.
 *  - A round only counts when BOTH drivers have a row for that session in the same team.
 *  - A team can field more than two drivers in a season (injury cover, mid-season swap):
 *    every pair is tallied and the pair that shared the most rounds is the team's headline pair.
 */

export interface H2HDriver {
  driverId: string;
  driverName: string;
  driverCode: string;
}

export interface H2HTally {
  /** Rounds the two drivers could be compared in this session type. */
  compared: number;
  /** Rounds won by `drivers[0]` and `drivers[1]` respectively. */
  wins: [number, number];
}

export interface TeamHeadToHead {
  constructorId: string;
  constructorName: string;
  drivers: [H2HDriver, H2HDriver];
  qualifying: H2HTally;
  race: H2HTally;
}

interface SessionRow {
  position?: string;
  Driver?: { driverId?: string; givenName?: string; familyName?: string; code?: string };
  Constructor?: { constructorId?: string; name?: string };
}

export interface RoundSnapshot {
  round: number;
  data: MrData;
}

interface PairRecord {
  /** Lexicographically ordered ids — `a` is the smaller id so the key is symmetric. */
  a: H2HDriver;
  b: H2HDriver;
  constructorId: string;
  constructorName: string;
  quali: { compared: number; aWins: number; bWins: number };
  race: { compared: number; aWins: number; bWins: number };
}

function sessionRows(snapshot: MrData, key: 'Results' | 'QualifyingResults'): SessionRow[] {
  const races = (snapshot.MRData as { RaceTable?: { Races?: Array<Record<string, unknown>> } } | undefined)
    ?.RaceTable?.Races;
  const rows = races?.[0]?.[key];
  return Array.isArray(rows) ? (rows as SessionRow[]) : [];
}

function toDriver(row: SessionRow): H2HDriver | null {
  const driverId = (row.Driver?.driverId ?? '').toLowerCase();
  if (!driverId) return null;
  const name = `${row.Driver?.givenName ?? ''} ${row.Driver?.familyName ?? ''}`.trim();
  return {
    driverId,
    driverName: name || driverId,
    driverCode: (row.Driver?.code ?? '').toLowerCase(),
  };
}

/** Groups one session's rows by constructor, keeping only rows with a usable numeric position. */
function groupByTeam(rows: SessionRow[]): Map<string, { name: string; entries: Array<{ driver: H2HDriver; position: number }> }> {
  const teams = new Map<string, { name: string; entries: Array<{ driver: H2HDriver; position: number }> }>();
  for (const row of rows) {
    const constructorId = (row.Constructor?.constructorId ?? '').toLowerCase();
    const driver = toDriver(row);
    const position = Number(row.position);
    if (!constructorId || !driver || !Number.isFinite(position) || position <= 0) continue;
    const team = teams.get(constructorId) ?? { name: row.Constructor?.name ?? constructorId, entries: [] };
    // A driver listed twice for the same team in one session (data glitch) is counted once.
    if (!team.entries.some((e) => e.driver.driverId === driver.driverId)) {
      team.entries.push({ driver, position });
    }
    teams.set(constructorId, team);
  }
  return teams;
}

function tally(
  pairs: Map<string, PairRecord>,
  rows: SessionRow[],
  session: 'quali' | 'race',
): void {
  for (const [constructorId, team] of groupByTeam(rows)) {
    const { entries } = team;
    for (let i = 0; i < entries.length; i++) {
      for (let j = i + 1; j < entries.length; j++) {
        const [first, second] =
          entries[i].driver.driverId <= entries[j].driver.driverId
            ? [entries[i], entries[j]]
            : [entries[j], entries[i]];
        const key = `${constructorId}|${first.driver.driverId}|${second.driver.driverId}`;
        let pair = pairs.get(key);
        if (!pair) {
          pair = {
            a: first.driver,
            b: second.driver,
            constructorId,
            constructorName: team.name,
            quali: { compared: 0, aWins: 0, bWins: 0 },
            race: { compared: 0, aWins: 0, bWins: 0 },
          };
          pairs.set(key, pair);
        }
        const rec = pair[session];
        rec.compared++;
        if (first.position < second.position) rec.aWins++;
        else if (second.position < first.position) rec.bWins++;
      }
    }
  }
}

/**
 * Per-constructor teammate H2H for a season, keyed by `constructorId`.
 * Teams with no comparable pair (single-car entries, no shared rounds) are omitted.
 * `drivers[0]` is the headline pair's driver with the lexicographically smaller
 * `driverId`; callers that need championship order should re-order using standings.
 */
export function buildSeasonHeadToHead(
  qualifyingRounds: RoundSnapshot[],
  raceRounds: RoundSnapshot[],
): Record<string, TeamHeadToHead> {
  const pairs = new Map<string, PairRecord>();

  for (const { data } of qualifyingRounds) tally(pairs, sessionRows(data, 'QualifyingResults'), 'quali');
  for (const { data } of raceRounds) tally(pairs, sessionRows(data, 'Results'), 'race');

  // Headline pair per team = the pair that shared the most sessions (quali + race).
  const best = new Map<string, PairRecord>();
  for (const pair of pairs.values()) {
    const shared = pair.quali.compared + pair.race.compared;
    const current = best.get(pair.constructorId);
    const currentShared = current ? current.quali.compared + current.race.compared : -1;
    if (shared > currentShared) best.set(pair.constructorId, pair);
  }

  const out: Record<string, TeamHeadToHead> = {};
  for (const [constructorId, pair] of best) {
    out[constructorId] = {
      constructorId,
      constructorName: pair.constructorName,
      drivers: [pair.a, pair.b],
      qualifying: { compared: pair.quali.compared, wins: [pair.quali.aWins, pair.quali.bWins] },
      race: { compared: pair.race.compared, wins: [pair.race.aWins, pair.race.bWins] },
    };
  }
  return out;
}
