/**
 * Race-calendar-aware sync trigger for GitHub Actions.
 *
 * Hourly workflow runs this script. It fetches the current-season calendar from
 * Jolpica, computes sync windows, and if any window fell due in the last
 * lookback period, calls production /api/cron/sync-f1?scope=live.
 *
 * Env:
 *   CRON_SECRET_KEY  — Bearer token (required)
 *   SITE_URL         — e.g. https://project-anthology-five.vercel.app (optional)
 *
 * Usage: npx tsx scripts/sync-f1-scheduled.ts
 */

import { config } from 'dotenv';
import { CURRENT_SEASON } from '../lib/f1Calendar';
import { getSyncWindows, getDueSyncWindows } from '../lib/f1/syncSchedule';
import type { CalendarRace } from '../lib/f1Calendar';

config({ path: '.env.local' });

const JOLPICA_CALENDAR = `https://api.jolpi.ca/ergast/f1/${CURRENT_SEASON}.json`;
const DEFAULT_SITE_URL = 'https://project-anthology-five.vercel.app';
const LOOKBACK_MS = 65 * 60 * 1000;

async function fetchCalendarRaces(): Promise<CalendarRace[]> {
  const res = await fetch(JOLPICA_CALENDAR, {
    headers: { Accept: 'application/json', 'User-Agent': 'ProjectAnthology/sync-f1-scheduled' },
    signal: AbortSignal.timeout(15_000),
  });
  if (!res.ok) throw new Error(`Jolpica calendar ${res.status}`);
  const json = (await res.json()) as {
    MRData?: { RaceTable?: { Races?: CalendarRace[] } };
  };
  return json.MRData?.RaceTable?.Races ?? [];
}

async function triggerLiveSync(siteUrl: string, secret: string): Promise<void> {
  const url = `${siteUrl.replace(/\/+$/, '')}/api/cron/sync-f1?scope=live`;
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${secret}` },
    signal: AbortSignal.timeout(120_000),
  });
  const body = await res.text();
  if (!res.ok) {
    throw new Error(`sync-f1 ${res.status}: ${body.slice(0, 500)}`);
  }
  console.log('sync-f1 response:', body);
}

async function main(): Promise<void> {
  const secret = process.env.CRON_SECRET_KEY;
  if (!secret) {
    console.error('CRON_SECRET_KEY is required');
    process.exit(1);
  }

  const siteUrl = (process.env.SITE_URL ?? process.env.NEXT_PUBLIC_SITE_URL ?? DEFAULT_SITE_URL).replace(
    /\/+$/,
    '',
  );

  const now = new Date();
  const races = await fetchCalendarRaces();
  const windows = getSyncWindows(races);
  const due = getDueSyncWindows(windows, now, LOOKBACK_MS);

  if (due.length === 0) {
    console.log(`[${now.toISOString()}] No sync windows due in the last ${LOOKBACK_MS / 60000} minutes — skip.`);
    return;
  }

  console.log(
    `[${now.toISOString()}] ${due.length} window(s) due — triggering live sync:`,
    due.map((w) => w.label).join(', '),
  );

  await triggerLiveSync(siteUrl, secret);
  console.log('Live sync completed.');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
