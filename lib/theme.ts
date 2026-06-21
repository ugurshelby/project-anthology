import {
  getSeasonPalette,
  teamPaletteCssVars,
  type SeasonPalette,
} from '@/config/team-colors';

/**
 * Resolve a team-context theme for profile / round pages (design.md §1.1).
 * Returns inline CSS custom properties to spread onto the page root element:
 *   - --team-primary / --team-secondary / --team-accent (from the 60-30-10 palette)
 *   - --bg overridden to a very faint team tint (palette.primary) so neutral
 *     cards sit on a team-toned canvas (§1.2). Cards stay neutral --surface.
 *
 * Global pages (home, season, news…) skip this and keep --accent #ff1801.
 */
export function teamThemeVars(
  teamIdOrName: string | null | undefined,
  season: number,
): Record<string, string> {
  const palette: SeasonPalette = getSeasonPalette(teamIdOrName, season);
  return {
    ...teamPaletteCssVars(palette),
    '--bg': palette.primary,
    '--accent': palette.secondary,
  };
}
