/**
 * F1 temporal context — single source of truth for season, race timing, and grid metadata.
 *
 * Calendar loading (async via `getF1Context()`):
 * 1. Supabase `f1_snapshots` (type: calendar, round null) — server only
 * 2. `/api/f1-season?path={year}` (Ergast proxy) — browser; direct Ergast on server/build
 * 3. Public static `/data/f1/{year}/calendar.json`
 * 4. Embedded minimal fallbacks
 *
 * Sync exports (`CURRENT_SEASON`, etc.) use embedded fallbacks only; prefer `getF1Context()`.
 */

export const CURRENT_DATE = new Date();

export interface RaceSummary {
  round: number;
  name: string;
  circuit: string;
  date: string;
}

export interface NextRaceSummary extends RaceSummary {
  daysUntil: number;
}

export interface F1DriverEntry {
  code: string;
  name: string;
  team: string;
}

export interface F1Context {
  currentDate: Date;
  currentSeason: number;
  lastRace: RaceSummary | null;
  nextRace: NextRaceSummary | null;
  isRaceWeekend: boolean;
  currentTeams2025: string[];
  currentDrivers2025: F1DriverEntry[];
}

interface ErgastRace {
  round: string;
  raceName: string;
  date: string;
  Circuit?: {
    circuitName?: string;
    circuitId?: string;
  };
}

interface ErgastCalendarFile {
  MRData?: {
    RaceTable?: {
      Races?: ErgastRace[];
    };
  };
}

const ERGAST_BASE = 'https://api.jolpi.ca/ergast/f1';

/** Minimal 2025 calendar used when remote sources are unavailable (Ergast format). */
const FALLBACK_2025_CALENDAR: ErgastCalendarFile = {
  MRData: {
    RaceTable: {
      Races: [
        {
          round: '1',
          raceName: 'Australian Grand Prix',
          date: '2025-03-16',
          Circuit: { circuitId: 'albert_park', circuitName: 'Albert Park Grand Prix Circuit' },
        },
        {
          round: '8',
          raceName: 'Monaco Grand Prix',
          date: '2025-05-25',
          Circuit: { circuitId: 'monaco', circuitName: 'Circuit de Monaco' },
        },
        {
          round: '9',
          raceName: 'Spanish Grand Prix',
          date: '2025-06-01',
          Circuit: { circuitId: 'catalunya', circuitName: 'Circuit de Barcelona-Catalunya' },
        },
        {
          round: '24',
          raceName: 'Abu Dhabi Grand Prix',
          date: '2025-12-07',
          Circuit: { circuitId: 'yas_marina', circuitName: 'Yas Marina Circuit' },
        },
      ],
    },
  },
};

/** Minimal 2026 calendar fallback (Ergast format). */
const FALLBACK_2026_CALENDAR: ErgastCalendarFile = {
  MRData: {
    RaceTable: {
      Races: [
        {
          round: '1',
          raceName: 'Australian Grand Prix',
          date: '2026-03-08',
          Circuit: { circuitId: 'albert_park', circuitName: 'Albert Park Grand Prix Circuit' },
        },
        {
          round: '22',
          raceName: 'Abu Dhabi Grand Prix',
          date: '2026-12-06',
          Circuit: { circuitId: 'yas_marina', circuitName: 'Yas Marina Circuit' },
        },
      ],
    },
  },
};

export const CURRENT_TEAMS_2025: string[] = [
  'red_bull',
  'ferrari',
  'mclaren',
  'mercedes',
  'aston_martin',
  'alpine',
  'williams',
  'haas',
  'rb',
  'kick_sauber',
];

/** 3-letter Ergast/OpenF1 code → hyphenated portrait basename (without extension). */
export const DRIVER_CODE_TO_SLUG: Record<string, string> = {
  ALB: 'alexander-albon',
  ALO: 'fernando-alonso',
  BOR: 'gabriel-bortoleto',
  BOT: 'valtteri-bottas',
  BUT: 'jenson-button',
  COL: 'franco-colapinto',
  DEV: 'nyck-de-vries',
  GAS: 'pierre-gasly',
  GIO: 'antonio-giovinazzi',
  HAD: 'isack-hadjar',
  HAM: 'lewis-hamilton',
  HUL: 'nico-hulkenberg',
  LAT: 'nicholas-latifi',
  LAW: 'liam-lawson',
  LEC: 'charles-leclerc',
  MAG: 'kevin-magnussen',
  MAS: 'felipe-massa',
  NOR: 'lando-norris',
  OCO: 'esteban-ocon',
  PER: 'sergio-perez',
  PIA: 'oscar-piastri',
  RAI: 'kimi-raikkonen',
  RIC: 'daniel-ricciardo',
  ROS: 'nico-rosberg',
  RUS: 'george-russell',
  SAI: 'carlos-sainz',
  SAR: 'logan-sargeant',
  STR: 'lance-stroll',
  TSU: 'yuki-tsunoda',
  VER: 'max-verstappen',
  VET: 'sebastian-vettel',
  ZHO: 'zhou-guanyu',
};

/** Public URL for a driver portrait (`name` = lowercase hyphenated slug). */
export function driverImagePath(name: string): string {
  return `/images/drivers/${name}.webp`;
}

/** Portrait path from Ergast 3-letter code; falls back to lowercased code if unmapped. */
export function driverImagePathFromCode(code: string): string {
  const slug = DRIVER_CODE_TO_SLUG[code.toUpperCase()];
  return driverImagePath(slug ?? code.toLowerCase());
}

export const CURRENT_DRIVERS_2025: F1DriverEntry[] = [
  { code: 'VER', name: 'Max Verstappen', team: 'red_bull' },
  { code: 'TSU', name: 'Yuki Tsunoda', team: 'red_bull' },
  { code: 'LEC', name: 'Charles Leclerc', team: 'ferrari' },
  { code: 'HAM', name: 'Lewis Hamilton', team: 'ferrari' },
  { code: 'NOR', name: 'Lando Norris', team: 'mclaren' },
  { code: 'PIA', name: 'Oscar Piastri', team: 'mclaren' },
  { code: 'RUS', name: 'George Russell', team: 'mercedes' },
  { code: 'ANT', name: 'Andrea Kimi Antonelli', team: 'mercedes' },
  { code: 'ALO', name: 'Fernando Alonso', team: 'aston_martin' },
  { code: 'STR', name: 'Lance Stroll', team: 'aston_martin' },
  { code: 'GAS', name: 'Pierre Gasly', team: 'alpine' },
  { code: 'DOO', name: 'Jack Doohan', team: 'alpine' },
  { code: 'SAI', name: 'Carlos Sainz', team: 'williams' },
  { code: 'ALB', name: 'Alexander Albon', team: 'williams' },
  { code: 'OCO', name: 'Esteban Ocon', team: 'haas' },
  { code: 'BEA', name: 'Oliver Bearman', team: 'haas' },
  { code: 'LAW', name: 'Liam Lawson', team: 'rb' },
  { code: 'HAD', name: 'Isack Hadjar', team: 'rb' },
  { code: 'HUL', name: 'Nico Hülkenberg', team: 'kick_sauber' },
  { code: 'BOR', name: 'Gabriel Bortoleto', team: 'kick_sauber' },
];

const CALENDAR_YEARS = [2025, 2026] as const;

function toDateKey(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function parseDateKey(dateKey: string): Date {
  const [year, month, day] = dateKey.split('-').map(Number);
  return new Date(year, month - 1, day);
}

function daysBetween(from: Date, toDateKey: string): number {
  const fromMidnight = new Date(from.getFullYear(), from.getMonth(), from.getDate());
  const toMidnight = parseDateKey(toDateKey);
  return Math.round((toMidnight.getTime() - fromMidnight.getTime()) / 86_400_000);
}

function parseErgastCalendar(raw: ErgastCalendarFile): RaceSummary[] {
  const races = raw.MRData?.RaceTable?.Races ?? [];
  return races
    .map((race) => ({
      round: Number.parseInt(race.round, 10),
      name: race.raceName,
      circuit: race.Circuit?.circuitName ?? race.Circuit?.circuitId ?? 'Unknown',
      date: race.date,
    }))
    .filter((race) => Number.isFinite(race.round) && race.date.length > 0)
    .sort((a, b) => a.date.localeCompare(b.date) || a.round - b.round);
}

function getFallbackCalendarFile(year: number): ErgastCalendarFile {
  if (year === 2026) {
    return FALLBACK_2026_CALENDAR;
  }
  return FALLBACK_2025_CALENDAR;
}

function parsePayloadField(raw: unknown): unknown {
  if (typeof raw !== 'string') return raw;
  try {
    return JSON.parse(raw) as unknown;
  } catch {
    return raw;
  }
}

function hasUsableMrData(json: unknown): json is ErgastCalendarFile {
  return Boolean(json && typeof json === 'object' && (json as ErgastCalendarFile).MRData);
}

async function fetchCalendarFromSupabase(year: number): Promise<ErgastCalendarFile | null> {
  if (typeof window !== 'undefined') return null;

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return null;

  try {
    const { createClient } = await import('@supabase/supabase-js');
    const supabase = createClient(url, key, {
      auth: { persistSession: false, autoRefreshToken: false },
    });

    const { data, error } = await supabase
      .from('f1_snapshots')
      .select('data')
      .eq('season', year)
      .is('round', null)
      .eq('type', 'calendar')
      .maybeSingle();

    if (error || !data?.data) return null;

    const payload = parsePayloadField(data.data);
    return hasUsableMrData(payload) ? payload : null;
  } catch {
    return null;
  }
}

async function fetchCalendarFromSeasonProxy(year: number): Promise<ErgastCalendarFile | null> {
  try {
    const path = String(year);
    const url =
      typeof window !== 'undefined'
        ? `/api/f1-season?path=${encodeURIComponent(path)}`
        : `${ERGAST_BASE}/${path}.json`;

    const response = await fetch(url, { headers: { Accept: 'application/json' } });
    if (!response.ok) return null;

    const json = (await response.json()) as unknown;
    return hasUsableMrData(json) ? json : null;
  } catch {
    return null;
  }
}

async function fetchCalendarFromPublicStatic(year: number): Promise<ErgastCalendarFile | null> {
  try {
    const response = await fetch(`/data/f1/${year}/calendar.json`, {
      headers: { Accept: 'application/json' },
    });
    if (!response.ok) return null;

    const json = (await response.json()) as unknown;
    return hasUsableMrData(json) ? json : null;
  } catch {
    return null;
  }
}

async function loadSeasonCalendarRaw(year: number): Promise<ErgastCalendarFile> {
  const fromSupabase = await fetchCalendarFromSupabase(year);
  if (fromSupabase) return fromSupabase;

  const fromProxy = await fetchCalendarFromSeasonProxy(year);
  if (fromProxy) return fromProxy;

  const fromStatic = await fetchCalendarFromPublicStatic(year);
  if (fromStatic) return fromStatic;

  return getFallbackCalendarFile(year);
}

async function loadSeasonRaces(year: number): Promise<RaceSummary[]> {
  const raw = await loadSeasonCalendarRaw(year);
  return parseErgastCalendar(raw);
}

function buildFallbackCalendarMap(): Map<number, RaceSummary[]> {
  const map = new Map<number, RaceSummary[]>();
  for (const year of CALENDAR_YEARS) {
    map.set(year, parseErgastCalendar(getFallbackCalendarFile(year)));
  }
  return map;
}

async function buildCalendarMap(): Promise<Map<number, RaceSummary[]>> {
  const entries = await Promise.all(
    CALENDAR_YEARS.map(async (year) => [year, await loadSeasonRaces(year)] as const),
  );
  return new Map(entries);
}

function resolveCurrentSeason(today: Date, calendars: Map<number, RaceSummary[]>): number {
  const todayKey = toDateKey(today);
  const years = [...calendars.keys()].sort((a, b) => a - b);

  for (const year of years) {
    const races = calendars.get(year) ?? [];
    if (races.length === 0) {
      continue;
    }

    const firstRace = races[0].date;
    const lastRace = races[races.length - 1].date;

    if (todayKey < firstRace) {
      return year - 1;
    }

    if (todayKey > lastRace) {
      const nextYear = year + 1;
      const nextCalendar = calendars.get(nextYear);
      if (nextCalendar && nextCalendar.length > 0) {
        return nextYear;
      }
      return year;
    }

    return year;
  }

  return today.getFullYear();
}

function findLastRace(today: Date, calendars: Map<number, RaceSummary[]>): RaceSummary | null {
  const todayKey = toDateKey(today);
  const allRaces = [...calendars.values()].flat().sort((a, b) => a.date.localeCompare(b.date));

  let last: RaceSummary | null = null;
  for (const race of allRaces) {
    if (race.date < todayKey) {
      last = race;
    } else {
      break;
    }
  }

  return last;
}

function findNextRace(today: Date, calendars: Map<number, RaceSummary[]>): NextRaceSummary | null {
  const todayKey = toDateKey(today);
  const allRaces = [...calendars.values()].flat().sort((a, b) => a.date.localeCompare(b.date));

  for (const race of allRaces) {
    if (race.date >= todayKey) {
      return {
        ...race,
        daysUntil: daysBetween(today, race.date),
      };
    }
  }

  return null;
}

function isRaceWeekend(today: Date, calendars: Map<number, RaceSummary[]>): boolean {
  const todayMidnight = new Date(today.getFullYear(), today.getMonth(), today.getDate());

  for (const races of calendars.values()) {
    for (const race of races) {
      const raceDay = parseDateKey(race.date);
      const weekendStart = new Date(raceDay);
      weekendStart.setDate(weekendStart.getDate() - 3);

      if (todayMidnight >= weekendStart && todayMidnight <= raceDay) {
        const weekday = todayMidnight.getDay();
        if (weekday >= 4 || weekday === 0) {
          return true;
        }
      }
    }
  }

  return false;
}

const FALLBACK_CALENDARS = buildFallbackCalendarMap();

let calendarsPromise: Promise<Map<number, RaceSummary[]>> | null = null;

function getCalendars(): Promise<Map<number, RaceSummary[]>> {
  if (!calendarsPromise) {
    calendarsPromise = buildCalendarMap();
  }
  return calendarsPromise;
}

/** Sync fallback values — use `getF1Context()` for live calendar data. */
export const CURRENT_SEASON = resolveCurrentSeason(CURRENT_DATE, FALLBACK_CALENDARS);
export const LAST_RACE = findLastRace(CURRENT_DATE, FALLBACK_CALENDARS);
export const NEXT_RACE = findNextRace(CURRENT_DATE, FALLBACK_CALENDARS);
export const IS_RACE_WEEKEND = isRaceWeekend(CURRENT_DATE, FALLBACK_CALENDARS);

export async function getF1Context(): Promise<F1Context> {
  const calendars = await getCalendars();
  const today = new Date();

  const context: F1Context = {
    currentDate: today,
    currentSeason: resolveCurrentSeason(today, calendars),
    lastRace: findLastRace(today, calendars),
    nextRace: findNextRace(today, calendars),
    isRaceWeekend: isRaceWeekend(today, calendars),
    currentTeams2025: CURRENT_TEAMS_2025,
    currentDrivers2025: CURRENT_DRIVERS_2025,
  };

  if (typeof window === 'undefined') {
    const lastLabel = context.lastRace?.name ?? 'none';
    const nextLabel = context.nextRace?.name ?? 'none';
    const nextDays = context.nextRace?.daysUntil ?? '-';
    console.log(
      `[F1Calendar] Season: ${context.currentSeason} | Last: ${lastLabel} | Next: ${nextLabel} in ${nextDays} days`,
    );
  }

  return context;
}
