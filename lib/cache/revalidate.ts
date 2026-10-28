import { revalidatePath } from 'next/cache';

/**
 * Drops every cached page under the locale layout after a cron wrote new data (caching design, DECISIONS
 * 2026-10-28). Nothing is rebuilt here: each page renders again on its next request. Outside a Next request
 * (unit tests) `revalidatePath` throws; that is logged and reported as false, never fatal for the cron.
 */
export function revalidateSitePages(source: string): boolean {
  try {
    revalidatePath('/[locale]', 'layout');
    return true;
  } catch (err) {
    console.warn(`[${source}] page revalidation skipped:`, err instanceof Error ? err.message : String(err));
    return false;
  }
}
