/**
 * Creates / updates the Upstash QStash schedules that drive our cron routes (lib/cron/qstashSchedules.ts).
 * Idempotent: every schedule has a fixed id, so re-running updates it in place (run it again after rotating CRON_SECRET).
 *
 *   npm run qstash:sync -- --dry-run            print the plan and the daily message budget; needs no env, loads no env file
 *   npm run qstash:sync                         create/update all schedules
 *   npm run qstash:sync -- --skip apex-notify-sessions   leave one out (e.g. until the mobile app exists)
 *   npm run qstash:sync -- --list               show what QStash currently has (ids, cron, next run)
 *   npm run qstash:sync -- --remove <id>        delete one schedule
 *
 * Env (shell or .env.local; values are never printed):
 *   QSTASH_TOKEN      Upstash console -> QStash -> "Details" (required except --dry-run)
 *   QSTASH_URL        same page; the API origin of your region (default https://qstash.upstash.io)
 *   CRON_SECRET       the secret the cron routes check (CRON_SECRET_KEY is accepted too); forwarded as Bearer by QStash
 *   SITE_URL          site origin (default: PROD_SITE_URL in lib/data/siteUrl.ts)
 */

import { PROD_SITE_URL } from '../lib/data/siteUrl';
import {
  QSTASH_BUDGET_SHARE,
  QSTASH_FREE_LIMITS,
  QSTASH_SCHEDULES,
  buildScheduleRequest,
  runsPerDay,
  totalNormalMessagesPerDay,
  totalWorstCaseMessagesPerDay,
  type QStashSchedule,
} from '../lib/cron/qstashSchedules';

function flag(name: string): boolean {
  return process.argv.includes(`--${name}`);
}
function option(name: string): string | undefined {
  const i = process.argv.indexOf(`--${name}`);
  return i >= 0 ? process.argv[i + 1] : undefined;
}

function printPlan(schedules: readonly QStashSchedule[], siteUrl: string): void {
  console.log(`Destination: ${siteUrl}`);
  for (const s of schedules) {
    console.log(
      `  ${s.id.padEnd(22)} ${s.cron.padEnd(14)} ${String(runsPerDay(s.cron)).padStart(3)}/day  retries ${s.retries}  timeout ${s.timeout.padEnd(4)} ${s.path}`,
    );
  }
  const normal = totalNormalMessagesPerDay(schedules);
  const worst = totalWorstCaseMessagesPerDay(schedules);
  const limit = QSTASH_FREE_LIMITS.messagesPerDay;
  console.log(
    `Messages/day: ${normal} normal, ${worst} worst case (all runs fail, every retry used); free quota ${limit}, ` +
      `budget ${Math.round(limit * QSTASH_BUDGET_SHARE)}. Schedules: ${schedules.length}/${QSTASH_FREE_LIMITS.activeSchedules}.`,
  );
}

async function main(): Promise<void> {
  const dryRun = flag('dry-run');
  if (!dryRun) {
    try {
      process.loadEnvFile('.env.local');
    } catch {
      // no .env.local: values come from the environment
    }
  }

  const skip = new Set((option('skip') ?? '').split(',').map((s) => s.trim()).filter(Boolean));
  for (const id of skip) {
    if (!QSTASH_SCHEDULES.some((s) => s.id === id)) throw new Error(`--skip: unknown schedule id "${id}"`);
  }
  const schedules = QSTASH_SCHEDULES.filter((s) => !skip.has(s.id));

  const siteUrl = (process.env.SITE_URL ?? process.env.NEXT_PUBLIC_SITE_URL ?? PROD_SITE_URL).replace(/\/+$/, '');
  const qstashUrl = (process.env.QSTASH_URL ?? 'https://qstash.upstash.io').replace(/\/+$/, '');

  if (dryRun) {
    printPlan(schedules, siteUrl);
    console.log('Dry run: nothing was sent.');
    return;
  }

  const token = process.env.QSTASH_TOKEN;
  if (!token) throw new Error('QSTASH_TOKEN is required (Upstash console -> QStash -> Details)');
  const headers = { Authorization: `Bearer ${token}` };

  if (flag('list')) {
    const res = await fetch(`${qstashUrl}/v2/schedules`, { headers });
    if (!res.ok) throw new Error(`list failed: HTTP ${res.status}`);
    const rows = (await res.json()) as Array<Record<string, unknown>>;
    for (const r of rows) {
      console.log(
        [r.scheduleId, r.cron, r.destination, `paused=${String(r.isPaused ?? false)}`, `next=${String(r.nextScheduleTime ?? '-')}`, `last=${String(r.lastScheduleTime ?? '-')}`].join('  '),
      );
    }
    console.log(`${rows.length} schedule(s) on this QStash account.`);
    return;
  }

  const removeId = option('remove');
  if (removeId) {
    const res = await fetch(`${qstashUrl}/v2/schedules/${encodeURIComponent(removeId)}`, { method: 'DELETE', headers });
    if (!res.ok) throw new Error(`remove ${removeId} failed: HTTP ${res.status}`);
    console.log(`removed ${removeId}`);
    return;
  }

  const cronSecret = process.env.CRON_SECRET ?? process.env.CRON_SECRET_KEY;
  if (!cronSecret) throw new Error('CRON_SECRET (or CRON_SECRET_KEY) is required: QStash forwards it to the cron routes');

  printPlan(schedules, siteUrl);
  let failed = 0;
  for (const s of schedules) {
    const req = buildScheduleRequest(s, { qstashUrl, siteUrl, token, cronSecret });
    const res = await fetch(req.url, req.init);
    const body = await res.text();
    if (!res.ok) {
      failed++;
      // The body is QStash's error text; it never contains our token or secret.
      console.error(`  FAILED ${s.id}: HTTP ${res.status} ${body.slice(0, 300)}`);
      continue;
    }
    console.log(`  ok ${s.id}: ${body.slice(0, 120)}`);
  }
  if (failed > 0) {
    process.exitCode = 1;
    return;
  }
  console.log('Done. Verify with: npm run qstash:sync -- --list');
}

main().catch((err) => {
  console.error(err instanceof Error ? err.message : err);
  process.exit(1);
});
