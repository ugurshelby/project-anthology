/**
 * Builds the committed track telemetry (data/circuits/telemetry/*.json) from
 * OpenF1's free historical API, one measured reference lap per circuit of the
 * current calendar (master-plan 13.2/13.3, DECISIONS 2026-10-21 "13.1 Track
 * telemetry"). Needs NO secrets and reads NO env file.
 *
 *   npx tsx scripts/build-circuit-telemetry.ts             all circuits
 *   npx tsx scripts/build-circuit-telemetry.ts --circuit monza
 *   npx tsx scripts/build-circuit-telemetry.ts --dry-run   matches only, writes nothing
 *
 * The reference lap is the official pole lap of the most recent completed
 * Qualifying at the circuit (2023 or later): Jolpica gives the pole car and
 * time, OpenF1 gives the lap whose duration matches it within 1.5 ms.
 *
 * OpenF1 locks its whole API during live F1 sessions (401): run outside a
 * session window. On a 401 the script keeps what it wrote and exits 2.
 */

import { mkdirSync, readdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { CURRENT_SEASON } from '../lib/f1Calendar';
import { CIRCUIT_FACTS } from '../data/circuits/facts';
import {
  buildSamples,
  lapMetrics,
  parseLapTime,
  safetyCarFlags,
  sectorBoundaries,
  slowPoints,
  type RawCarSample,
  type RawLocation,
} from '../lib/telemetry/derive';
import { matchSessionByStart, pickPoleLap } from '../lib/telemetry/select';
import type { CircuitTelemetry, SafetyCarHistory } from '../lib/telemetry/types';

const JOLPICA = 'https://api.jolpi.ca/ergast/f1';
const OPENF1 = 'https://api.openf1.org/v1';
const FIRST_YEAR = 2023;
const OUT_DIR = join(process.cwd(), 'data', 'circuits', 'telemetry');
const MIN_SAMPLES = 100;
const QUALI_DONE_MS = 2 * 3_600_000;
const RACE_DONE_MS = 3 * 3_600_000;

// ── CLI ──────────────────────────────────────────────────────────────────────

const args = process.argv.slice(2);
const dryRun = args.includes('--dry-run');
const circuitFlag = args.indexOf('--circuit');
const onlyCircuit = circuitFlag >= 0 ? args[circuitFlag + 1] : undefined;
if (circuitFlag >= 0 && !onlyCircuit) {
  console.error('--circuit needs a circuitId');
  process.exit(1);
}

// ── HTTP ─────────────────────────────────────────────────────────────────────

class OpenF1LockedError extends Error {}

class HttpError extends Error {
  constructor(
    readonly url: string,
    readonly status: number,
  ) {
    super(`${url} -> ${status}`);
  }
}

const MIN_GAP_MS: Record<string, number> = { 'api.openf1.org': 2_500, 'api.jolpi.ca': 1_000 };
const lastCall: Record<string, number> = {};
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

async function getJson<T>(url: string): Promise<T> {
  const host = new URL(url).host;
  const delays = [1_000, 2_000, 4_000];
  for (let attempt = 0; ; attempt++) {
    const wait = (lastCall[host] ?? 0) + (MIN_GAP_MS[host] ?? 0) - Date.now();
    if (wait > 0) await sleep(wait);
    lastCall[host] = Date.now();

    const res = await fetch(url, { headers: { Accept: 'application/json', 'User-Agent': 'project-anthology/1.0' } });
    if (res.ok) return (await res.json()) as T;
    if (res.status === 401 && host === 'api.openf1.org') throw new OpenF1LockedError(url);
    if ((res.status === 429 || res.status >= 500) && attempt < delays.length) {
      await sleep(delays[attempt]);
      continue;
    }
    throw new HttpError(url, res.status);
  }
}

// ── Upstream shapes (only the fields used) ───────────────────────────────────

interface JolpicaRace {
  season: string;
  round: string;
  raceName: string;
  date: string;
  time?: string;
  Circuit: { circuitId: string };
  Qualifying?: { date: string; time?: string };
}

interface JolpicaQualiResult {
  number: string;
  Driver: { driverId: string; code?: string };
  Q1?: string;
  Q2?: string;
  Q3?: string;
}

interface OpenF1Session {
  session_key: number;
  meeting_key: number;
  date_start: string;
  is_cancelled?: boolean;
}

interface OpenF1Lap {
  driver_number: number;
  lap_number: number;
  date_start: string | null;
  lap_duration: number | null;
  is_pit_out_lap: boolean;
  duration_sector_1: number | null;
  duration_sector_2: number | null;
  duration_sector_3: number | null;
  i1_speed: number | null;
  i2_speed: number | null;
  st_speed: number | null;
}

interface RaceControlRow {
  category: string | null;
  message: string | null;
}

interface YearData {
  races: JolpicaRace[];
  quali: OpenF1Session[];
  race: OpenF1Session[];
}

function startMs(date: string, time?: string): number {
  return Date.parse(`${date}T${time ?? '00:00:00Z'}`);
}

async function jolpicaSeason(year: number): Promise<JolpicaRace[]> {
  const body = await getJson<{ MRData: { RaceTable: { Races: JolpicaRace[] } } }>(`${JOLPICA}/${year}.json`);
  return body.MRData.RaceTable.Races;
}

async function openF1Sessions(year: number, name: 'Qualifying' | 'Race'): Promise<OpenF1Session[]> {
  return getJson<OpenF1Session[]>(`${OPENF1}/sessions?year=${year}&session_name=${name}`);
}

/** OpenF1 query with its date filter written into the query string as is. */
function openF1Window(endpoint: string, sessionKey: number, driver: number, fromMs: number, toMs: number): string {
  const from = new Date(fromMs).toISOString();
  const to = new Date(toMs).toISOString();
  return `${OPENF1}/${endpoint}?session_key=${sessionKey}&driver_number=${driver}&date>=${from}&date<${to}`;
}

// ── Per circuit ──────────────────────────────────────────────────────────────

interface Match {
  year: number;
  race: JolpicaRace;
  session: OpenF1Session;
}

interface Row {
  circuitId: string;
  year: string;
  driver: string;
  lapTime: string;
  samples: string;
  lengthM: string;
  diffPct: string;
  status: string;
}

class Skip extends Error {}

function findMatch(circuitId: string, years: Map<number, YearData>, now: number): Match | null {
  for (let y = CURRENT_SEASON; y >= FIRST_YEAR; y--) {
    const data = years.get(y);
    const race = data?.races.find((r) => r.Circuit.circuitId === circuitId);
    if (!data || !race?.Qualifying) continue;
    const qStart = startMs(race.Qualifying.date, race.Qualifying.time);
    if (!(qStart + QUALI_DONE_MS < now)) continue;
    const session = matchSessionByStart(data.quali, qStart);
    if (session) return { year: y, race, session };
  }
  return null;
}

async function poleOf(match: Match): Promise<{ result: JolpicaQualiResult; lapTime: string; poleMs: number }> {
  const body = await getJson<{ MRData: { RaceTable: { Races: { QualifyingResults?: JolpicaQualiResult[] }[] } } }>(
    `${JOLPICA}/${match.year}/${match.race.round}/qualifying.json`,
  );
  const result = body.MRData.RaceTable.Races[0]?.QualifyingResults?.[0];
  const lapTime = result ? (result.Q3 ?? result.Q2 ?? result.Q1) : undefined;
  if (!result || !lapTime) throw new Skip('no Jolpica pole result');
  return { result, lapTime, poleMs: parseLapTime(lapTime) };
}

async function safetyCarHistory(circuitId: string, years: Map<number, YearData>, now: number): Promise<SafetyCarHistory | null> {
  const counted: number[] = [];
  let withSafetyCar = 0;
  let withVsc = 0;
  for (let y = FIRST_YEAR; y <= CURRENT_SEASON; y++) {
    const data = years.get(y);
    const race = data?.races.find((r) => r.Circuit.circuitId === circuitId);
    if (!data || !race) continue;
    const rStart = startMs(race.date, race.time);
    if (!(rStart + RACE_DONE_MS < now)) continue;
    const session = matchSessionByStart(data.race, rStart);
    if (!session) continue;
    const rows = await getJson<RaceControlRow[]>(`${OPENF1}/race_control?session_key=${session.session_key}`);
    const flags = safetyCarFlags(rows);
    counted.push(y);
    if (flags.safetyCar) withSafetyCar++;
    if (flags.vsc) withVsc++;
  }
  if (counted.length === 0) return null;
  return { years: counted, races: counted.length, withSafetyCar, withVsc };
}

async function buildCircuit(circuitId: string, match: Match, years: Map<number, YearData>, now: number): Promise<CircuitTelemetry> {
  const { result, lapTime, poleMs } = await poleOf(match);
  const carNumber = Number(result.number);

  const laps = await getJson<OpenF1Lap[]>(
    `${OPENF1}/laps?session_key=${match.session.session_key}&driver_number=${carNumber}`,
  );
  const lap = pickPoleLap(laps, carNumber, poleMs);
  if (!lap || lap.lap_duration === null) throw new Skip('pole lap not found');
  if (!lap.date_start) throw new Skip('pole lap has no date_start');
  if (lap.duration_sector_1 === null || lap.duration_sector_2 === null || lap.duration_sector_3 === null) {
    throw new Skip('pole lap has no sector times');
  }

  const fromMs = Date.parse(lap.date_start);
  const toMs = fromMs + lap.lap_duration * 1000 + 500;
  const car = await getJson<RawCarSample[]>(openF1Window('car_data', match.session.session_key, carNumber, fromMs, toMs));
  const loc = await getJson<RawLocation[]>(openF1Window('location', match.session.session_key, carNumber, fromMs, toMs));
  if (car.length < MIN_SAMPLES || loc.length < MIN_SAMPLES) {
    throw new Skip(`too few samples (car_data ${car.length}, location ${loc.length})`);
  }

  const samples = buildSamples(car, loc, lap.date_start);
  const s1Ms = Math.round(lap.duration_sector_1 * 1000);
  const s2Ms = Math.round(lap.duration_sector_2 * 1000);
  const s3Ms = Math.round(lap.duration_sector_3 * 1000);
  const safetyCar = await safetyCarHistory(circuitId, years, now);

  return {
    version: 1,
    circuitId,
    source: {
      provider: 'OpenF1',
      license: 'CC BY-NC-SA 4.0',
      url: 'https://openf1.org',
      year: match.year,
      round: Number(match.race.round),
      raceName: match.race.raceName,
      session: 'Qualifying',
      sessionKey: match.session.session_key,
      meetingKey: match.session.meeting_key,
      driverNumber: carNumber,
      driverId: result.Driver.driverId,
      driverCode: result.Driver.code ?? '',
      lapNumber: lap.lap_number,
      lapTime,
      lapDurationMs: Math.round(lap.lap_duration * 1000),
      fetchedAt: new Date().toISOString(),
    },
    sectors: { s1Ms, s2Ms, s3Ms, boundariesM: sectorBoundaries(samples, s1Ms, s2Ms) },
    speedTraps: { i1Kmh: lap.i1_speed, i2Kmh: lap.i2_speed, stKmh: lap.st_speed },
    metrics: lapMetrics(samples),
    slowPoints: slowPoints(samples),
    safetyCar,
    samples,
  };
}

// ── Output ───────────────────────────────────────────────────────────────────

function writeIndex(): void {
  const ids = readdirSync(OUT_DIR)
    .filter((f) => f.endsWith('.json'))
    .map((f) => f.slice(0, -'.json'.length))
    .sort();
  const entries = ids.map((id) => {
    const key = /^[A-Za-z_$][\w$]*$/.test(id) ? id : JSON.stringify(id);
    return `  ${key}: () => import('./${id}.json').then((m) => m.default),\n`;
  });
  const map = entries.length > 0 ? `{\n${entries.join('')}}` : '{}';
  writeFileSync(
    join(OUT_DIR, 'index.ts'),
    `// Generated by scripts/build-circuit-telemetry.ts — do not edit.\n\n` +
      `export const TELEMETRY_LOADERS: Readonly<Record<string, () => Promise<unknown>>> = ${map};\n`,
  );
}

function lengthDiff(circuitId: string, lapLengthM: number): string {
  const km = CIRCUIT_FACTS[circuitId]?.lengthKm;
  if (!km) return 'n/a';
  const pct = ((lapLengthM - km * 1000) / (km * 1000)) * 100;
  return `${pct >= 0 ? '+' : ''}${pct.toFixed(1)}%`;
}

function printTable(rows: Row[]): void {
  const head: Row = {
    circuitId: 'circuit',
    year: 'year',
    driver: 'driver',
    lapTime: 'lap',
    samples: 'samples',
    lengthM: 'length m',
    diffPct: 'vs facts',
    status: 'status',
  };
  const keys = Object.keys(head) as (keyof Row)[];
  const width = (k: keyof Row) => Math.max(...[head, ...rows].map((r) => r[k].length));
  const line = (r: Row) => `| ${keys.map((k) => r[k].padEnd(width(k))).join(' | ')} |`;
  console.log(line(head));
  console.log(`|${keys.map((k) => '-'.repeat(width(k) + 2)).join('|')}|`);
  for (const r of rows) console.log(line(r));
}

function emptyRow(circuitId: string, status: string): Row {
  return { circuitId, year: '', driver: '', lapTime: '', samples: '', lengthM: '', diffPct: '', status };
}

// ── Main ─────────────────────────────────────────────────────────────────────

async function main(): Promise<number> {
  const now = Date.now();
  const years = new Map<number, YearData>();
  for (let y = CURRENT_SEASON; y >= FIRST_YEAR; y--) {
    years.set(y, {
      races: await jolpicaSeason(y),
      quali: await openF1Sessions(y, 'Qualifying'),
      race: await openF1Sessions(y, 'Race'),
    });
  }

  const calendar = years.get(CURRENT_SEASON)?.races ?? [];
  let circuitIds = [...new Set(calendar.map((r) => r.Circuit.circuitId))];
  if (onlyCircuit) {
    if (!circuitIds.includes(onlyCircuit)) {
      console.error(`${onlyCircuit} is not on the ${CURRENT_SEASON} calendar`);
      return 1;
    }
    circuitIds = [onlyCircuit];
  }

  const rows: Row[] = [];
  let written = 0;
  let locked = false;
  if (!dryRun) mkdirSync(OUT_DIR, { recursive: true });

  for (const circuitId of circuitIds) {
    const match = findMatch(circuitId, years, now);
    if (!match) {
      rows.push(emptyRow(circuitId, `skipped: no completed Qualifying with an OpenF1 session since ${FIRST_YEAR}`));
      continue;
    }

    try {
      if (dryRun) {
        const { result, lapTime } = await poleOf(match);
        rows.push({
          ...emptyRow(circuitId, `match: session ${match.session.session_key}, round ${match.race.round}`),
          year: String(match.year),
          driver: `#${result.number} ${result.Driver.code ?? result.Driver.driverId}`,
          lapTime,
        });
        continue;
      }

      const data = await buildCircuit(circuitId, match, years, now);
      writeFileSync(join(OUT_DIR, `${circuitId}.json`), JSON.stringify(data) + '\n');
      written++;
      rows.push({
        circuitId,
        year: String(data.source.year),
        driver: `#${data.source.driverNumber} ${data.source.driverCode}`,
        lapTime: data.source.lapTime,
        samples: String(data.samples.length),
        lengthM: String(data.metrics.lapLengthM),
        diffPct: lengthDiff(circuitId, data.metrics.lapLengthM),
        status: 'written',
      });
    } catch (err) {
      if (err instanceof OpenF1LockedError) {
        locked = true;
        rows.push(emptyRow(circuitId, 'stopped: OpenF1 401'));
        break;
      }
      const reason = err instanceof Skip ? err.message : err instanceof HttpError ? `HTTP ${err.status}` : String(err);
      rows.push({ ...emptyRow(circuitId, `skipped: ${reason}`), year: String(match.year) });
    }
  }

  if (!dryRun) writeIndex();
  printTable(rows);

  if (locked) {
    console.error('OpenF1 canlı seans kilidi: seans penceresi dışında çalıştırın');
    return 2;
  }
  if (dryRun) return 0;
  console.log(`${written} file(s) written to data/circuits/telemetry`);
  return written > 0 ? 0 : 1;
}

main()
  .then((code) => process.exit(code))
  .catch((err) => {
    if (err instanceof OpenF1LockedError) {
      if (!dryRun) writeIndex();
      console.error('OpenF1 canlı seans kilidi: seans penceresi dışında çalıştırın');
      process.exit(2);
    }
    console.error(err);
    process.exit(1);
  });
