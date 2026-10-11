import { describe, expect, it } from 'vitest';
import { MAX_BACKOFF_MS, POLL_INTERVAL_MS, RESTRICTED_POLL_MS, nextPollDelay } from '@/lib/home/livePoll';

describe('live tracker poll pacing (plan 1.7)', () => {
  it('polls every 12s while healthy', () => {
    expect(nextPollDelay({ failures: 0, restricted: false })).toBe(POLL_INTERVAL_MS);
  });

  it('drops to once a minute while OpenF1 locks the live session', () => {
    expect(nextPollDelay({ failures: 0, restricted: true })).toBe(RESTRICTED_POLL_MS);
  });

  it('backs off exponentially on failures, capped at 2 minutes', () => {
    const delays = [1, 2, 3, 4, 8].map((failures) => nextPollDelay({ failures, restricted: false }));
    expect(delays).toEqual([24_000, 48_000, 96_000, MAX_BACKOFF_MS, MAX_BACKOFF_MS]);
  });
});
