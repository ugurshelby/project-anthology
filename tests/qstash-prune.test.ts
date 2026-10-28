import { describe, expect, it } from 'vitest';
import { schedulesToPrune } from '@/lib/cron/qstashPrune';
import { QSTASH_SCHEDULES } from '@/lib/cron/qstashSchedules';

const SITE = 'https://project-anthology-eight.vercel.app';

describe('schedulesToPrune (1.8)', () => {
  it('returns the MCP-made scd_ duplicates of managed routes and keeps the apex-* ids', () => {
    const live = [
      { scheduleId: 'scd_5SQ', destination: `${SITE}/api/cron/sync-f1` },
      { scheduleId: 'scd_6H9', destination: `${SITE}/api/cron/notify-sessions` },
      { scheduleId: 'apex-sync-f1', destination: `${SITE}/api/cron/sync-f1` },
      { scheduleId: 'apex-sync-news', destination: `${SITE}/api/cron/sync-news` },
    ];
    expect(schedulesToPrune(live, QSTASH_SCHEDULES, SITE)).toEqual(['scd_5SQ', 'scd_6H9']);
  });

  it('never touches schedules aimed at another site or an unmanaged route', () => {
    const live = [
      { scheduleId: 'scd_other', destination: 'https://lyrica.example/api/cron/sync-news' },
      { scheduleId: 'scd_radio', destination: `${SITE}/api/cron/sync-radio` },
    ];
    expect(schedulesToPrune(live, QSTASH_SCHEDULES, SITE)).toEqual([]);
  });

  it('matches a destination with a query string or trailing slash, and a site URL with a trailing slash', () => {
    const live = [{ scheduleId: 'scd_q', destination: `${SITE}/api/cron/sync-f1/?scope=season` }];
    expect(schedulesToPrune(live, QSTASH_SCHEDULES, `${SITE}/`)).toEqual(['scd_q']);
  });
});
