import { LIVERIES, type LiveryEra } from '@/data/history/liveries';
import { ensureVisible, mix, nudge } from './color';
import { constructorMeta, resolveConstructorId } from './ids';

/**
 * Team colours per season. Compatible with the older SeasonPalette
 * (primary = dark page tint, secondary = brand colour, accent = highlight) plus
 * `ui` — the colour for bars, chips and borders on the dark Apex surface.
 */
export interface TeamPalette {
  primary: string;
  secondary: string;
  accent: string;
  ui: string;
  /** True when the colour comes from a curated livery era, not a national fallback. */
  curated: boolean;
}

const SURFACE = '#0A0A0A';

/** National racing colours: fallback for teams without a curated livery. */
const NATIONAL: Record<string, readonly [main: string, accent: string]> = {
  italy: ['#C8202B', '#F4F4F4'],
  'united-kingdom': ['#00573F', '#F4D800'],
  france: ['#1F56C4', '#F4F4F4'],
  germany: ['#B9BEC6', '#1A1A1A'],
  'united-states-of-america': ['#2B4DA0', '#F4F4F4'],
  japan: ['#E6E6E6', '#C8102E'],
  switzerland: ['#D52B1E', '#F4F4F4'],
  austria: ['#C8102E', '#F4F4F4'],
  netherlands: ['#FF6A13', '#1A1A1A'],
  belgium: ['#F2C400', '#1A1A1A'],
  argentina: ['#74ACDF', '#F4F4F4'],
  brazil: ['#009C3B', '#FFDF00'],
  australia: ['#00843D', '#FFCD00'],
  canada: ['#D80621', '#F4F4F4'],
  'south-africa': ['#007A4D', '#FFB612'],
  spain: ['#AA151B', '#F1BF00'],
  malaysia: ['#F1C400', '#1A1A1A'],
  'new-zealand': ['#C9CED6', '#1A1A1A'],
  sweden: ['#006AA7', '#FECC00'],
  russia: ['#D52B1E', '#F4F4F4'],
  mexico: ['#006847', '#CE1126'],
};
const NEUTRAL: readonly [string, string] = ['#8B93A1', '#E6E8EC'];

function dist([from, to]: LiveryEra, year: number): number {
  if (year < from) return from - year;
  if (to !== null && year > to) return year - to;
  return 0;
}

function eraFor(eras: readonly LiveryEra[], year: number): LiveryEra {
  const covering = eras.find(([from, to]) => year >= from && (to === null || year <= to));
  if (covering) return covering;
  // outside every era: the closest one keeps the team recognisable
  return [...eras].sort((a, b) => dist(a, year) - dist(b, year))[0];
}

function build(main: string, accent: string, ui: string | undefined, curated: boolean): TeamPalette {
  return {
    primary: mix(SURFACE, main, 0.09),
    secondary: main.toUpperCase(),
    accent: accent.toUpperCase(),
    ui: ensureVisible(ui ?? main, SURFACE, 3),
    curated,
  };
}

/** Palette for a constructor id in a season. Never throws; unknown teams get a neutral one. */
export function paletteForConstructorId(constructorId: string, year: number): TeamPalette {
  const eras = LIVERIES[constructorId];
  if (eras && eras.length > 0) {
    const [, , main, accent, ui] = eraFor(eras, year);
    return build(main, accent, ui, true);
  }
  const meta = constructorMeta(constructorId);
  const [main, accent] = (meta && NATIONAL[meta.c]) || NEUTRAL;
  return build(nudge(main, constructorId), accent, undefined, false);
}

/**
 * Palette for any team reference (F1DB id, Ergast id, display name) in a
 * season. This is the single entry point for team colour.
 */
export function paletteFor(teamRef: string | null | undefined, year: number): TeamPalette {
  const id = resolveConstructorId(teamRef, year);
  if (!id) return build(NEUTRAL[0], NEUTRAL[1], undefined, false);
  return paletteForConstructorId(id, year);
}
