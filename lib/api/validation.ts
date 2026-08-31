/**
 * Shared input validation for public API route params.
 *
 * Ergast/Jolpica entity slugs (driverId, constructorId, circuitId) are
 * lowercase alphanumeric with optional internal hyphens/underscores — e.g.
 * `hamilton`, `lewis-hamilton`, `red_bull`, `catalunya`. Rejecting anything
 * outside that shape keeps pathological inputs out of the data layer and
 * prevents accidental log/DB noise from crafted URLs.
 */

/** Max slug length — generous headroom above the longest real Ergast ID. */
export const ERGAST_SLUG_MAX_LEN = 64;

/** Matches Ergast/Jolpica driver, constructor, and circuit IDs. */
export const ERGAST_SLUG_PATTERN = /^[a-z0-9][a-z0-9_-]{0,63}$/;

/** True when `id` is a well-formed Ergast entity slug. */
export function isErgastSlug(id: string): boolean {
  return id.length > 0 && id.length <= ERGAST_SLUG_MAX_LEN && ERGAST_SLUG_PATTERN.test(id);
}
