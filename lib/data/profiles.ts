import { getDriverLore, type DriverLore } from '@/data/drivers';
import { getSeasonData, type SeasonData } from '@/lib/data/f1';
import { CURRENT_SEASON } from '@/lib/f1Calendar';
import {
  driverRowFor,
  driverStints,
  driverTotalsAsOf,
  lastTeamOf,
  numberOf,
  type Totals,
} from '@/lib/history/career';
import {
  buildTeamDna,
  preferNamed,
  lineageTotalsAsOf,
  lineageYears,
  stageForYear,
  type DnaStage,
  type TeamDna,
} from '@/lib/history/dna';
import { lineupFor, type LineupEntry } from '@/lib/history/lineup';
import { paletteForConstructorId, type TeamPalette } from '@/lib/history/palette';
import {
  getConstructorRecord,
  getDriverRecord,
  resolveConstructorId,
  resolveDriverId,
} from '@/lib/history/store';
import type { DriverRecord, DriverSeasonRow } from '@/lib/history/types';

/* ------------------------------------------------------------------ */
/* shared                                                              */
/* ------------------------------------------------------------------ */

/** One selectable season in the rail. */
export interface YearChip {
  year: number;
  /** Team colour that season (UI colour on the dark surface). */
  ui: string;
  /** Team name that season, for the accessible label. */
  label: string;
  champion: boolean;
}

function pickYear(requested: number | undefined, years: number[]): number {
  if (requested !== undefined && years.includes(requested)) return requested;
  if (years.includes(CURRENT_SEASON)) return CURRENT_SEASON;
  return years[years.length - 1];
}

function num(value: string | number | null | undefined): number | null {
  if (value == null) return null;
  const n = typeof value === 'number' ? value : Number(value);
  return Number.isFinite(n) ? n : null;
}

/** Editorial lore is keyed by Ergast ids; match it to an F1DB driver by id variants and birth year. */
function loreFor(id: string, rec: DriverRecord): DriverLore | null {
  const parts = id.split('-');
  const candidates = [id, id.replace(/-/g, '_'), parts[parts.length - 1], `${parts[0]}_${parts[parts.length - 1]}`];
  const born = rec.b ? Number(rec.b.slice(0, 4)) : null;
  for (const c of candidates) {
    const lore = getDriverLore(c);
    if (lore && (born == null || lore.born === born)) return lore;
  }
  return null;
}

function liveStandingFor(data: SeasonData, id: string) {
  return data.standings.find((r) => resolveDriverId(r.driverId, { name: r.driverName, code: r.driverCode }) === id) ?? null;
}

/* ------------------------------------------------------------------ */
/* driver                                                              */
/* ------------------------------------------------------------------ */

export interface DriverSeasonTeam {
  id: string;
  name: string;
  ui: string;
  number: string | null;
}

export interface DriverStintView {
  id: string;
  name: string;
  ui: string;
  from: number;
  to: number;
  years: number[];
}

export interface DriverView {
  id: string;
  name: string;
  code: string | null;
  nationality: string | null;
  born: string | null;
  year: number;
  isCurrentSeason: boolean;
  years: YearChip[];
  teams: DriverSeasonTeam[];
  palette: TeamPalette;
  /** Season numbers; a field is null when the archive does not carry it. */
  season: {
    position: number | null;
    points: number;
    wins: number;
    podiums: number;
    poles: number;
    starts: number;
    fastestLaps: number;
    champion: boolean;
  };
  /** Career through the selected season (inclusive). */
  asOf: Totals;
  stints: DriverStintView[];
  number: string | null;
  lore: DriverLore | null;
}

function overlayDriver(rec: DriverRecord, row: DriverSeasonRow | null, live: ReturnType<typeof liveStandingFor>, data: SeasonData | null): DriverSeasonRow | null {
  if (!live || !data) return row;
  const stats = data.driverStats?.[live.driverName] ?? { wins: 0, podiums: 0 };
  const teamId = resolveConstructorId(live.constructorId || live.constructorName, CURRENT_SEASON);
  const base: DriverSeasonRow = row ?? {
    y: CURRENT_SEASON,
    t: teamId ? [teamId] : [],
    n: [live.permanentNumber],
    p: null,
    pts: 0,
    w: 0,
    pd: 0,
    pl: 0,
    fl: 0,
    st: 0,
    ch: 0,
  };
  return {
    ...base,
    t: teamId ? [teamId] : base.t,
    p: num(live.position) ?? base.p,
    pts: num(live.points) ?? base.pts,
    w: stats.wins ?? base.w,
    pd: stats.podiums ?? base.pd,
    n: live.permanentNumber ? [live.permanentNumber] : base.n,
  };
}

export async function getDriverView(param: string, requestedYear?: number): Promise<DriverView | null> {
  let live: ReturnType<typeof liveStandingFor> = null;
  let data: SeasonData | null = null;
  let id = resolveDriverId(param);
  const mayUseLive = requestedYear === undefined || requestedYear === CURRENT_SEASON;
  if (!id && mayUseLive) {
    try {
      data = await getSeasonData(CURRENT_SEASON);
    } catch {
      data = null;
    }
    const row = data?.standings.find((r) => r.driverId === param.toLowerCase()) ?? null;
    if (row) id = resolveDriverId(param, { name: row.driverName, code: row.driverCode });
  }
  if (!id) return null;
  const rec = getDriverRecord(id);
  if (!rec) return null;

  if (mayUseLive && !data) {
    try {
      data = await getSeasonData(CURRENT_SEASON);
    } catch {
      data = null;
    }
  }
  live = data ? liveStandingFor(data, id) : null;

  const rows = rec.s.slice();
  const currentIdx = rows.findIndex((r) => r.y === CURRENT_SEASON);
  const overlaid = overlayDriver(rec, currentIdx >= 0 ? rows[currentIdx] : null, live, data);
  if (overlaid) {
    if (currentIdx >= 0) rows[currentIdx] = overlaid;
    else rows.push(overlaid);
  }
  const effective: DriverRecord = { ...rec, s: rows };

  const years = rows.map((r) => r.y);
  if (years.length === 0) return null;
  const year = pickYear(requestedYear, years);
  const row = driverRowFor(effective, year)!;
  if (row.t.length === 0) return null;

  const chips: YearChip[] = rows.map((r) => {
    const team = lastTeamOf(r);
    return {
      year: r.y,
      ui: paletteForConstructorId(team, r.y).ui,
      label: getConstructorRecord(team)?.n ?? '',
      champion: r.ch === 1,
    };
  });

  const teams: DriverSeasonTeam[] = row.t.map((teamId, i) => ({
    id: teamId,
    name: getConstructorRecord(teamId)?.n ?? '',
    ui: paletteForConstructorId(teamId, year).ui,
    number: row.n[i] ?? null,
  })).filter((t) => t.name);

  const lastTeam = lastTeamOf(row);
  const stints: DriverStintView[] = driverStints(effective).map((s) => ({
    id: s.constructorId,
    name: getConstructorRecord(s.constructorId)?.n ?? '',
    ui: paletteForConstructorId(s.constructorId, Math.round((s.from + s.to) / 2)).ui,
    from: s.from,
    to: s.to,
    years: s.years,
  })).filter((s) => s.name);

  return {
    id,
    name: rec.n,
    code: rec.code,
    nationality: rec.nat,
    born: rec.b,
    year,
    isCurrentSeason: year === CURRENT_SEASON,
    years: chips,
    teams,
    palette: paletteForConstructorId(lastTeam, year),
    season: {
      position: row.p,
      points: row.pts,
      wins: row.w,
      podiums: row.pd,
      poles: row.pl,
      starts: row.st,
      fastestLaps: row.fl,
      champion: row.ch === 1,
    },
    asOf: driverTotalsAsOf(effective, year),
    stints,
    number: numberOf(row),
    lore: loreFor(id, rec),
  };
}

/* ------------------------------------------------------------------ */
/* team                                                                */
/* ------------------------------------------------------------------ */

export interface TeamLineupView {
  driverId: string;
  name: string;
  code: string | null;
  number: string | null;
  position: number | null;
  points: number;
  wins: number;
  champion: boolean;
}

export interface TeamView {
  /** F1DB id of the name the team raced under in the selected season. */
  id: string;
  /** Id of the lineage head (what the URL should use). */
  headId: string;
  name: string;
  fullName: string;
  country: string;
  year: number;
  isCurrentSeason: boolean;
  years: YearChip[];
  palette: TeamPalette;
  entrants: string[];
  engines: string[];
  season: { position: number | null; points: number; wins: number; podiums: number; poles: number; champion: boolean };
  lineup: TeamLineupView[];
  stage: DnaStage | null;
  dna: TeamDna;
  asOf: { seasons: number; wins: number; podiums: number; poles: number; titles: number[] };
}

function lineupView(entries: LineupEntry[]): TeamLineupView[] {
  return entries.slice(0, 6).map((e) => ({
    driverId: e.driverId,
    name: e.name,
    code: e.code,
    number: e.number,
    position: e.row.p,
    points: e.row.pts,
    wins: e.row.w,
    champion: e.row.ch === 1,
  }));
}

export async function getTeamView(param: string, requestedYear?: number): Promise<TeamView | null> {
  const id = resolveConstructorId(param, requestedYear ?? CURRENT_SEASON) ?? resolveConstructorId(param);
  if (!id) return null;
  const dna = buildTeamDna(id);
  if (!dna) return null;

  const years = lineageYears(dna);
  if (years.length === 0) return null;
  const year = pickYear(requestedYear, years);
  const stage = stageForYear(dna, year);
  if (!stage) return null;
  const rec = getConstructorRecord(stage.constructorId);
  const row = rec?.s.find((r) => r.y === year);
  if (!rec || !row) return null;

  const chips: YearChip[] = years.map((y) => {
    const st = stageForYear(dna, y);
    const r = st ? getConstructorRecord(st.constructorId)?.s.find((x) => x.y === y) : undefined;
    return {
      year: y,
      ui: st ? paletteForConstructorId(st.constructorId, y).ui : '#8B93A1',
      label: st?.name ?? '',
      champion: r?.ch === 1,
    };
  });

  return {
    id: stage.constructorId,
    headId: dna.headId,
    name: rec.n,
    fullName: rec.fn,
    country: rec.cn,
    year,
    isCurrentSeason: year === CURRENT_SEASON,
    years: chips,
    palette: paletteForConstructorId(stage.constructorId, year),
    entrants: preferNamed(row.e, rec.n),
    engines: row.en,
    season: { position: row.p, points: row.pts, wins: row.w, podiums: row.pd, poles: row.pl, champion: row.ch === 1 },
    lineup: lineupView(lineupFor(stage.constructorId, year)),
    stage,
    dna,
    asOf: lineageTotalsAsOf(dna, year),
  };
}
