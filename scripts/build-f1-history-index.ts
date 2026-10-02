/**
 * Builds the committed F1 history index (data/history/*.json) from the F1DB
 * GitHub release. Needs NO secrets and NO database: it only downloads the
 * public release zip (checksum-verified) and writes JSON files.
 *
 *   npx tsx scripts/build-f1-history-index.ts
 *
 * Output:
 *   data/history/meta.json          release tag, build time, newest season, checksum
 *   data/history/constructors.json  teams, lineage (chronology), per-season rows
 *   data/history/drivers.json       drivers with per-season rows (teams, numbers, results)
 *   data/history/seasons.json       per-season champions and race counts
 *
 * Seasons older than the newest season in the release are final. The newest
 * season is flagged partial: pages read it from the live snapshots instead.
 */

import { createHash } from 'node:crypto';
import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { unzipSync } from 'fflate';

const TAG = process.env.F1DB_TAG ?? '';
const RELEASE_API = TAG
  ? `https://api.github.com/repos/f1db/f1db/releases/tags/${TAG}`
  : 'https://api.github.com/repos/f1db/f1db/releases/latest';
const OUT_DIR = join(process.cwd(), 'data', 'history');

interface Asset {
  name: string;
  browser_download_url: string;
}

async function getJson<T>(url: string): Promise<T> {
  const res = await fetch(url, { headers: { Accept: 'application/vnd.github+json', 'User-Agent': 'apex-history-index' } });
  if (!res.ok) throw new Error(`${url} -> ${res.status}`);
  return (await res.json()) as T;
}

async function getBytes(url: string): Promise<Uint8Array> {
  const res = await fetch(url, { headers: { 'User-Agent': 'apex-history-index' }, redirect: 'follow' });
  if (!res.ok) throw new Error(`${url} -> ${res.status}`);
  return new Uint8Array(await res.arrayBuffer());
}

/* eslint-disable @typescript-eslint/no-explicit-any */
type Any = any;

/** One entity per line keeps diffs reviewable. */
function writeEntities(file: string, obj: Record<string, unknown>): void {
  const keys = Object.keys(obj).sort();
  const body = keys.map((k) => `${JSON.stringify(k)}:${JSON.stringify(obj[k])}`).join(',\n');
  writeFileSync(join(OUT_DIR, file), `{\n${body}\n}\n`, 'utf8');
}

async function main(): Promise<void> {
  const release = await getJson<{ tag_name: string; assets: Asset[] }>(RELEASE_API);
  const zipAsset = release.assets.find((a) => a.name === 'f1db-json-single.zip');
  const sumAsset = release.assets.find((a) => a.name === 'checksums_sha256.txt');
  if (!zipAsset || !sumAsset) throw new Error('release assets missing');

  const zipBytes = await getBytes(zipAsset.browser_download_url);
  const sums = new TextDecoder().decode(await getBytes(sumAsset.browser_download_url));
  const expected = sums
    .split('\n')
    .map((l) => l.trim().split(/\s+/))
    .find((p) => (p[1] ?? '').replace('*', '') === 'f1db-json-single.zip')?.[0];
  const actual = createHash('sha256').update(zipBytes).digest('hex');
  if (!expected || expected !== actual) throw new Error(`checksum mismatch: expected ${expected}, got ${actual}`);

  const files = unzipSync(zipBytes);
  const db = JSON.parse(new TextDecoder().decode(files['f1db.json'])) as Any;

  const countries = new Map<string, string>(db.countries.map((c: Any) => [c.id, c.name]));
  const engineNames = new Map<string, string>(db.engineManufacturers.map((e: Any) => [e.id, e.name]));
  const entrantNames = new Map<string, string>(db.entrants.map((e: Any) => [e.id, e.name]));
  const maxYear = Math.max(...db.seasons.map((s: Any) => s.year));

  // (driverId|year|constructorId) -> numbers seen on track
  const numbers = new Map<string, Set<string>>();
  const roundsRaced = new Map<number, number>();
  for (const race of db.races as Any[]) {
    for (const key of ['raceResults', 'qualifyingResults', 'sprintRaceResults', 'startingGridPositions', 'freePractice1Results']) {
      for (const r of (race[key] ?? []) as Any[]) {
        if (!r.driverId || !r.constructorId || r.driverNumber == null) continue;
        const k = `${r.driverId}|${race.year}|${r.constructorId}`;
        if (!numbers.has(k)) numbers.set(k, new Set());
        numbers.get(k)!.add(String(r.driverNumber));
      }
    }
    if ((race.raceResults ?? []).length > 0) roundsRaced.set(race.year, (roundsRaced.get(race.year) ?? 0) + 1);
  }

  /* ---------------- seasons ---------------- */
  const seasonsOut: Record<string, unknown> = {};
  const driverRows = new Map<string, Any[]>();
  const constructorRows = new Map<string, Any[]>();
  const constructorTitles = new Map<string, number[]>();
  const driverTitles = new Map<string, number[]>();

  for (const s of db.seasons as Any[]) {
    const year: number = s.year;
    const calendar = (db.races as Any[]).filter((r) => r.year === year);
    const dChamp = (s.driverStandings ?? []).find((x: Any) => x.championshipWon);
    const cChamp = (s.constructorStandings ?? []).find((x: Any) => x.championshipWon);
    seasonsOut[String(year)] = {
      rounds: calendar.length,
      raced: roundsRaced.get(year) ?? 0,
      final: year < maxYear,
      driverChampion: dChamp ? { id: dChamp.driverId, pts: dChamp.points } : null,
      constructorChampion: cChamp ? { id: cChamp.constructorId, pts: cChamp.points } : null,
    };
    if (dChamp) driverTitles.set(dChamp.driverId, [...(driverTitles.get(dChamp.driverId) ?? []), year]);
    if (cChamp) constructorTitles.set(cChamp.constructorId, [...(constructorTitles.get(cChamp.constructorId) ?? []), year]);

    const finalStanding = new Map<string, Any>((s.driverStandings ?? []).map((x: Any) => [x.driverId, x]));
    const statsByDriver = new Map<string, Any>((s.drivers ?? []).map((x: Any) => [x.driverId, x]));

    // teams per driver, in order of first round
    const teams = new Map<string, { constructorId: string; first: number }[]>();
    for (const entrant of (s.entrants ?? []) as Any[]) {
      for (const con of entrant.constructors ?? []) {
        for (const drv of con.drivers ?? []) {
          if (drv.testDriver || !drv.rounds || drv.rounds.length === 0) continue;
          const list = teams.get(drv.driverId) ?? [];
          list.push({ constructorId: con.constructorId, first: Math.min(...drv.rounds) });
          teams.set(drv.driverId, list);
        }
      }
    }

    for (const [driverId, list] of teams) {
      const ordered = list.sort((a, b) => a.first - b.first);
      const ids = [...new Set(ordered.map((t) => t.constructorId))];
      const nums = ids.map((cid) => {
        const set = numbers.get(`${driverId}|${year}|${cid}`);
        return set && set.size > 0 ? [...set][0] : null;
      });
      const st = statsByDriver.get(driverId);
      const fin = finalStanding.get(driverId);
      const row = {
        y: year,
        t: ids,
        n: nums,
        p: fin?.positionNumber ?? st?.positionNumber ?? null,
        pts: fin?.points ?? st?.totalPoints ?? 0,
        w: st?.totalRaceWins ?? 0,
        pd: st?.totalPodiums ?? 0,
        pl: st?.totalPolePositions ?? 0,
        fl: st?.totalFastestLaps ?? 0,
        st: st?.totalRaceStarts ?? 0,
        ch: fin?.championshipWon ? 1 : 0,
      };
      const rows = driverRows.get(driverId) ?? [];
      rows.push(row);
      driverRows.set(driverId, rows);
    }

    for (const c of (s.constructors ?? []) as Any[]) {
      const cs = (s.constructorStandings ?? []).find((x: Any) => x.constructorId === c.constructorId);
      const entries = new Set<string>();
      const engines = new Set<string>();
      for (const entrant of (s.entrants ?? []) as Any[]) {
        for (const con of entrant.constructors ?? []) {
          if (con.constructorId !== c.constructorId) continue;
          entries.add(entrantNames.get(entrant.entrantId) ?? entrant.entrantId);
          if (con.engineManufacturerId) engines.add(engineNames.get(con.engineManufacturerId) ?? con.engineManufacturerId);
        }
      }
      const row = {
        y: year,
        p: cs?.positionNumber ?? c.positionNumber ?? null,
        pts: cs?.points ?? c.totalPoints ?? 0,
        w: c.totalRaceWins ?? 0,
        pd: c.totalPodiums ?? 0,
        pl: c.totalPolePositions ?? 0,
        ch: cs?.championshipWon ? 1 : 0,
        e: [...entries],
        en: [...engines],
      };
      const rows = constructorRows.get(c.constructorId) ?? [];
      rows.push(row);
      constructorRows.set(c.constructorId, rows);
    }
  }

  /* ---------------- constructors ---------------- */
  const constructorsOut: Record<string, unknown> = {};
  for (const c of db.constructors as Any[]) {
    const rows = (constructorRows.get(c.id) ?? []).sort((a, b) => a.y - b.y);
    if (rows.length === 0) continue;
    constructorsOut[c.id] = {
      n: c.name,
      fn: c.fullName,
      c: c.countryId,
      cn: countries.get(c.countryId) ?? c.countryId,
      chron: (c.chronology ?? []).map((x: Any) => ({ id: x.constructorId, from: x.yearFrom, to: x.yearTo })),
      titles: (constructorTitles.get(c.id) ?? []).sort((a, b) => a - b),
      tot: { w: c.totalRaceWins, ch: c.totalChampionshipWins, pd: c.totalPodiums, pl: c.totalPolePositions, st: c.totalRaceStarts },
      s: rows,
    };
  }

  /* ---------------- drivers ---------------- */
  const driversOut: Record<string, unknown> = {};
  for (const d of db.drivers as Any[]) {
    const rows = (driverRows.get(d.id) ?? []).sort((a, b) => a.y - b.y);
    if (rows.length === 0) continue;
    driversOut[d.id] = {
      n: d.name,
      code: d.abbreviation ?? null,
      num: d.permanentNumber ?? null,
      nat: countries.get(d.nationalityCountryId) ?? null,
      natId: d.nationalityCountryId ?? null,
      b: d.dateOfBirth ?? null,
      d: d.dateOfDeath ?? null,
      titles: (driverTitles.get(d.id) ?? []).sort((a, b) => a - b),
      tot: { w: d.totalRaceWins, ch: d.totalChampionshipWins, pd: d.totalPodiums, pl: d.totalPolePositions, st: d.totalRaceStarts },
      s: rows,
    };
  }

  mkdirSync(OUT_DIR, { recursive: true });
  writeEntities('constructors.json', constructorsOut);
  writeEntities('drivers.json', driversOut);
  writeEntities('seasons.json', seasonsOut);
  writeFileSync(
    join(OUT_DIR, 'meta.json'),
    JSON.stringify(
      {
        source: 'F1DB (https://github.com/f1db/f1db), CC BY 4.0',
        release: release.tag_name,
        zipSha256: actual,
        newestSeason: maxYear,
        constructors: Object.keys(constructorsOut).length,
        drivers: Object.keys(driversOut).length,
        seasons: Object.keys(seasonsOut).length,
      },
      null,
      2,
    ) + '\n',
    'utf8',
  );
  console.log(
    `F1DB ${release.tag_name}: ${Object.keys(constructorsOut).length} constructors, ${Object.keys(driversOut).length} drivers, ${Object.keys(seasonsOut).length} seasons (newest ${maxYear}, partial)`,
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
