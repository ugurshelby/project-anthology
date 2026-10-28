/**
 * `?season=` variant of the teams index: the proxy rewrites `/teams?season=<year>` here, so the page reads the season from
 * params instead of searchParams and stays cacheable (caching design, DECISIONS 2026-10-28). Public links keep
 * the query form; the canonical URL stays the base page.
 */
export { default, generateMetadata } from '../../page';

export const revalidate = 600;

export function generateStaticParams() {
  return [];
}
