/** Shapes of the committed F1DB history index (data/history/*.json). */

export interface DriverSeasonRow {
  /** Season year. */
  y: number;
  /** Constructor ids driven for, in order of first round. */
  t: string[];
  /** Race numbers aligned with `t` (null when not recorded). */
  n: (string | null)[];
  /** Final championship position, null when unclassified. */
  p: number | null;
  pts: number;
  w: number;
  pd: number;
  pl: number;
  fl: number;
  st: number;
  ch: 0 | 1;
}

export interface DriverRecord {
  n: string;
  code: string | null;
  /** Permanent career number (1996+ rule), when one exists. */
  num: string | null;
  nat: string | null;
  natId: string | null;
  b: string | null;
  d: string | null;
  titles: number[];
  tot: { w: number; ch: number; pd: number; pl: number; st: number };
  s: DriverSeasonRow[];
}

export interface ConstructorSeasonRow {
  y: number;
  p: number | null;
  pts: number;
  w: number;
  pd: number;
  pl: number;
  ch: 0 | 1;
  /** Entrant names used that season (e.g. "Red Bull Racing"). */
  e: string[];
  /** Engine suppliers used that season. */
  en: string[];
}

export interface ChronologyLink {
  id: string;
  from: number;
  to: number | null;
}

export interface ConstructorRecord {
  n: string;
  fn: string;
  c: string;
  cn: string;
  chron: ChronologyLink[];
  titles: number[];
  tot: { w: number; ch: number; pd: number; pl: number; st: number };
  s: ConstructorSeasonRow[];
}

export interface SeasonSummary {
  rounds: number;
  raced: number;
  /** False for the newest season in the release (read live data instead). */
  final: boolean;
  driverChampion: { id: string; pts: number } | null;
  constructorChampion: { id: string; pts: number } | null;
}

export interface HistoryMeta {
  source: string;
  release: string;
  zipSha256: string;
  newestSeason: number;
  constructors: number;
  drivers: number;
  seasons: number;
}
