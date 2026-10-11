/**
 * Poll pacing for the home live tracker (components/home/LiveRaceTracker.tsx).
 * Plan 1.7: slow down while the live source is locked or failing, so race-day
 * viewers do not hammer /api/live-timing (and through it, OpenF1).
 */

export const POLL_INTERVAL_MS = 12_000;
/** OpenF1 locks unauthenticated access for the whole session; re-check once a minute. */
export const RESTRICTED_POLL_MS = 60_000;
/** Failed polls back off 24s → 48s → 96s → 120s. */
export const MAX_BACKOFF_MS = 120_000;

export function nextPollDelay(state: { failures: number; restricted: boolean }): number {
  if (state.restricted) return RESTRICTED_POLL_MS;
  if (state.failures === 0) return POLL_INTERVAL_MS;
  return Math.min(MAX_BACKOFF_MS, POLL_INTERVAL_MS * 2 ** state.failures);
}
