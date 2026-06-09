import { readFileSync, writeFileSync, mkdirSync, readdirSync, rmSync, existsSync } from "fs";
import { join } from "path";
import { buildDriverSvg, buildTeamSvg } from "./lib/svg-builders.mjs";

const ROOT = process.cwd();
const PALETTE = JSON.parse(readFileSync(join(ROOT, "data", "constructor-palette.json"), "utf8"));
const ROSTERS_PATH = join(ROOT, "data", "season-rosters.json");
const DRIVERS_ROOT = join(ROOT, "public", "drivers");
const TEAMS_ROOT = join(ROOT, "public", "teams");

const SEASON_START = 2000;
const SEASON_END = 2026;

const MANUAL_2026 = {
  constructors: [
    "red_bull",
    "mclaren",
    "rb",
    "ferrari",
    "mercedes",
    "aston_martin",
    "alpine",
    "haas",
    "williams",
    "audi",
    "cadillac",
  ],
  drivers: [
    { driverId: "leclerc", code: "LEC", number: "16", constructorId: "ferrari" },
    { driverId: "hamilton", code: "HAM", number: "44", constructorId: "ferrari" },
    { driverId: "russell", code: "RUS", number: "63", constructorId: "mercedes" },
    { driverId: "antonelli", code: "ANT", number: "12", constructorId: "mercedes" },
    { driverId: "norris", code: "NOR", number: "4", constructorId: "mclaren" },
    { driverId: "piastri", code: "PIA", number: "81", constructorId: "mclaren" },
    { driverId: "verstappen", code: "VER", number: "1", constructorId: "red_bull" },
    { driverId: "lawson", code: "LAW", number: "30", constructorId: "red_bull" },
    { driverId: "alonso", code: "ALO", number: "14", constructorId: "aston_martin" },
    { driverId: "stroll", code: "STR", number: "18", constructorId: "aston_martin" },
    { driverId: "gasly", code: "GAS", number: "10", constructorId: "alpine" },
    { driverId: "doohan", code: "DOO", number: "7", constructorId: "alpine" },
    { driverId: "albon", code: "ALB", number: "23", constructorId: "williams" },
    { driverId: "sainz", code: "SAI", number: "55", constructorId: "williams" },
    { driverId: "bearman", code: "BEA", number: "87", constructorId: "haas" },
    { driverId: "ocon", code: "OCO", number: "31", constructorId: "haas" },
    { driverId: "tsunoda", code: "TSU", number: "22", constructorId: "rb" },
    { driverId: "hadjar", code: "HAD", number: "6", constructorId: "rb" },
    { driverId: "hulkenberg", code: "HUL", number: "27", constructorId: "audi" },
    { driverId: "bortoleto", code: "BOR", number: "5", constructorId: "audi" },
    { driverId: "perez", code: "PER", number: "11", constructorId: "cadillac" },
    { driverId: "bottas", code: "BOT", number: "77", constructorId: "cadillac" },
  ],
};

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

function normalizeCode(driver) {
  if (driver.code && driver.code.length === 3) return driver.code.toUpperCase();
  const name = (driver.familyName || driver.driverId || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toUpperCase();
  return name.slice(0, 3).padEnd(3, "X");
}

function getPalette(constructorId, season) {
  const base = PALETTE[constructorId];
  if (!base) {
    return {
      slug: constructorId.replace(/_/g, "-"),
      abbr: constructorId.slice(0, 3).toUpperCase(),
      primary: "#333333",
      secondary: "#111111",
      accent: "#FFFFFF",
      text: "#FFFFFF",
    };
  }
  let merged = { ...base };
  if (base.eras) {
    const era = base.eras.find((e) => season >= e.from && season <= e.to);
    if (era) merged = { ...merged, ...era };
  }
  return merged;
}

async function fetchSeasonFromApi(season) {
  const url = `https://api.jolpi.ca/ergast/f1/${season}/results.json?limit=1000`;
  const res = await fetch(url, { signal: AbortSignal.timeout(60000) });
  if (!res.ok) throw new Error(`HTTP ${res.status} for ${season}`);
  const json = await res.json();
  const races = json.MRData?.RaceTable?.Races ?? [];
  if (!races.length) return null;

  const driverMap = new Map();
  const constructorSet = new Set();

  for (const race of races) {
    for (const result of race.Results) {
      const cId = result.Constructor.constructorId;
      constructorSet.add(cId);
      const dId = result.Driver.driverId;
      const key = `${dId}|${cId}`;
      const existing = driverMap.get(key) ?? {
        driverId: dId,
        constructorId: cId,
        code: normalizeCode(result.Driver),
        numbers: {},
        givenName: result.Driver.givenName,
        familyName: result.Driver.familyName,
      };
      const num = result.number || result.Driver.permanentNumber || "0";
      existing.numbers[num] = (existing.numbers[num] ?? 0) + 1;
      if (result.Driver.code) existing.code = result.Driver.code.toUpperCase();
      driverMap.set(key, existing);
    }
  }

  const drivers = [...driverMap.values()].map((d) => {
    const number = Object.entries(d.numbers).sort((a, b) => b[1] - a[1])[0]?.[0] ?? "0";
    return {
      driverId: d.driverId,
      constructorId: d.constructorId,
      code: d.code,
      number: String(number),
      givenName: d.givenName,
      familyName: d.familyName,
    };
  });

  return { season, constructors: [...constructorSet].sort(), drivers };
}

async function buildRosters(force = false) {
  if (!force && existsSync(ROSTERS_PATH)) {
    return JSON.parse(readFileSync(ROSTERS_PATH, "utf8"));
  }

  const rosters = {};
  for (let season = SEASON_START; season <= 2025; season++) {
    process.stdout.write(`Fetching ${season}... `);
    try {
      const data = await fetchSeasonFromApi(season);
      if (data) {
        rosters[season] = data;
        console.log(`${data.drivers.length} driver entries, ${data.constructors.length} teams`);
      } else {
        console.log("no data");
      }
    } catch (err) {
      console.log(`error: ${err.message}`);
    }
    await sleep(250);
  }

  rosters[2026] = {
    season: 2026,
    constructors: MANUAL_2026.constructors,
    drivers: MANUAL_2026.drivers,
  };

  writeFileSync(ROSTERS_PATH, JSON.stringify(rosters, null, 2), "utf8");
  return rosters;
}

function driverFileName(driverId, teamSlug, duplicateInSeason) {
  return duplicateInSeason ? `${driverId}-${teamSlug}.svg` : `${driverId}.svg`;
}

function clearLegacyFlatAssets() {
  for (const root of [DRIVERS_ROOT, TEAMS_ROOT]) {
    if (!existsSync(root)) continue;
    for (const entry of readdirSync(root, { withFileTypes: true })) {
      if (entry.isFile() && entry.name.endsWith(".svg")) {
        rmSync(join(root, entry.name));
      }
    }
  }
}

function generateAssets(rosters) {
  clearLegacyFlatAssets();

  let teamFiles = 0;
  let driverFiles = 0;
  const seasons = Object.keys(rosters).map(Number).sort((a, b) => a - b);

  for (const season of seasons) {
    const { constructors, drivers } = rosters[season];
    const teamDir = join(TEAMS_ROOT, String(season));
    const driverDir = join(DRIVERS_ROOT, String(season));
    mkdirSync(teamDir, { recursive: true });
    mkdirSync(driverDir, { recursive: true });

    const teamSlugsWritten = new Set();
    for (const cId of constructors) {
      const palette = getPalette(cId, season);
      if (teamSlugsWritten.has(palette.slug)) continue;
      teamSlugsWritten.add(palette.slug);
      writeFileSync(
        join(teamDir, `${palette.slug}.svg`),
        buildTeamSvg({
          abbr: palette.abbr,
          primary: palette.primary,
          secondary: palette.secondary,
          accent: palette.accent,
          text: palette.text,
        }),
        "utf8"
      );
      teamFiles++;
    }

    const driverCounts = new Map();
    for (const d of drivers) {
      driverCounts.set(d.driverId, (driverCounts.get(d.driverId) ?? 0) + 1);
    }

    for (const d of drivers) {
      const palette = getPalette(d.constructorId, season);
      const duplicate = (driverCounts.get(d.driverId) ?? 0) > 1;
      const fileName = driverFileName(d.driverId, palette.slug, duplicate);
      const clipId = `c-${season}-${d.driverId}-${palette.slug}`.replace(/[^a-zA-Z0-9_-]/g, "-");

      writeFileSync(
        join(driverDir, fileName),
        buildDriverSvg({
          clipId,
          abbr: d.code,
          number: d.number,
          primary: palette.primary,
          accent: palette.accent,
        }),
        "utf8"
      );
      driverFiles++;
    }

    console.log(`Season ${season}: ${teamSlugsWritten.size} teams, ${drivers.length} driver assets`);
  }

  return { seasons: seasons.length, teamFiles, driverFiles };
}

const forceFetch = process.argv.includes("--fetch");
const rosters = await buildRosters(forceFetch);
const stats = generateAssets(rosters);

console.log("\n=== Done ===");
console.log(`Seasons: ${stats.seasons}`);
console.log(`Team SVGs: ${stats.teamFiles}`);
console.log(`Driver SVGs: ${stats.driverFiles}`);
console.log(`Total SVGs: ${stats.teamFiles + stats.driverFiles}`);
