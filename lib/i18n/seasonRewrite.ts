/**
 * Internal path for a `?season=<year>` request on the grid, driver or team pages (caching design, DECISIONS
 * 2026-10-28). The pages read the season from the `season/[year]` variant route's params, never from searchParams,
 * so both forms stay cacheable. `pathname` is the locale-prefixed path the proxy is about to render; null when the
 * request is not one of these pages or the season is not a four-digit year. `locales` comes from the routing config
 * (passed in so this stays importable without next-intl's navigation module).
 */
export function seasonRewritePath(pathname: string, season: string | null, locales: readonly string[]): string | null {
  if (!season || !/^\d{4}$/.test(season)) return null;
  const m = new RegExp(`^/(${locales.join('|')})/(grid|drivers|teams)(/(?!season(?:/|$))[^/]+)?/?$`).exec(pathname);
  if (!m) return null;
  return `/${m[1]}/${m[2]}${m[3] ?? ''}/season/${season}`;
}
