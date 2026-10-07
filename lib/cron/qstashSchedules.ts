/**
 * Schedules that Upstash QStash fires against our cron routes (`scripts/qstash-sync.ts` creates them).
 *
 * Why not GitHub Actions `schedule`: GitHub runs those best-effort and drops most of them on a quiet repo
 * (measured 2026-10-07: ~5 runs/day for a 10-minute cron, median gap ~5 h), which cannot hit the 10-minute window of
 * `notify-sessions` or the +2.5 h result windows of `sync-f1`. QStash fires on the minute.
 *
 * Free plan (https://upstash.com/pricing/qstash, checked 2026-10-07): 1,000 messages/day, 10 active schedules,
 * 15 minutes max HTTP response duration. Each delivery attempt (including each retry) counts as a message, so the
 * budget below is computed WORST CASE (every run fails and every retry is used). `tests/qstash-schedules.test.ts`
 * fails when the worst case exceeds 60% of the free daily quota, so adding a schedule cannot silently push the
 * project over the limit.
 */

export const QSTASH_FREE_LIMITS = { messagesPerDay: 1000, activeSchedules: 10 } as const;

/** Keep at least 40% of the free quota unused (manual tests, retries from outages, spikes). */
export const QSTASH_BUDGET_SHARE = 0.6;

export interface QStashSchedule {
  /** Upstash-Schedule-Id: letters, digits, '-', '.', '_'. Re-applying the same id updates the schedule in place. */
  id: string;
  /** Route under app/api/cron (GET, `Authorization: Bearer <CRON_SECRET>` forwarded by QStash). */
  path: string;
  /** Five-field cron in UTC. Day-of-month, month and weekday must be `*` (see runsPerDay). */
  cron: string;
  /** Extra delivery attempts after a non-2xx answer. 0 for frequent jobs: the next tick is the retry. */
  retries: number;
  /** Upstash-Timeout: how long QStash waits for our answer (the route's maxDuration plus headroom). */
  timeout: string;
  purpose: string;
}

export const QSTASH_SCHEDULES: readonly QStashSchedule[] = [
  {
    id: 'apex-notify-sessions',
    path: '/api/cron/notify-sessions',
    // The route notifies 25-35 minutes before a session; two ticks per window (dedupes via notified_sessions).
    cron: '*/5 * * * *',
    retries: 0,
    timeout: '30s',
    purpose: 'Push notification ~30 min before qualifying / sprint / race',
  },
  {
    id: 'apex-sync-f1',
    path: '/api/cron/sync-f1',
    // No `scope`: live on a race weekend, season otherwise; settled snapshots are never fetched again.
    cron: '*/30 * * * *',
    retries: 1,
    timeout: '5m',
    purpose: 'Jolpica -> f1_snapshots: results/quali/sprint/standings inside their due windows',
  },
  {
    id: 'apex-sync-news',
    path: '/api/cron/sync-news',
    cron: '11 * * * *',
    retries: 1,
    timeout: '5m',
    purpose: 'RSS -> clustered stories -> EN/TR brief',
  },
  {
    id: 'apex-sync-media',
    path: '/api/cron/sync-media',
    cron: '41 * * * *',
    retries: 1,
    timeout: '5m',
    purpose: 'Wikimedia -> license-checked images -> Supabase Storage (incremental, 215 s budget)',
  },
];

// ── cron arithmetic (only what the schedules above need) ─────────────────────

function fieldValues(field: string, min: number, max: number): Set<number> {
  const out = new Set<number>();
  for (const part of field.split(',')) {
    const m = /^(\*|\d+(?:-\d+)?)(?:\/(\d+))?$/.exec(part.trim());
    if (!m) throw new Error(`unsupported cron field "${field}"`);
    const [, range, stepRaw] = m;
    const step = stepRaw ? Number(stepRaw) : 1;
    if (!Number.isInteger(step) || step < 1) throw new Error(`bad step in "${field}"`);
    let lo = min;
    let hi = max;
    if (range !== '*') {
      const [a, b] = range!.split('-').map(Number) as [number, number | undefined];
      lo = a;
      hi = b ?? (stepRaw ? max : a);
    }
    if (lo < min || hi > max || lo > hi) throw new Error(`out-of-range cron field "${field}"`);
    for (let v = lo; v <= hi; v += step) out.add(v);
  }
  return out;
}

/** How many times a (minute, hour only) cron fires per UTC day. */
export function runsPerDay(cron: string): number {
  const f = cron.trim().split(/\s+/);
  if (f.length !== 5) throw new Error(`cron needs 5 fields: "${cron}"`);
  if (f[2] !== '*' || f[3] !== '*' || f[4] !== '*') throw new Error(`only minute/hour crons are supported: "${cron}"`);
  return fieldValues(f[0]!, 0, 59).size * fieldValues(f[1]!, 0, 23).size;
}

/** Messages per day if every run failed and every retry fired. */
export function worstCaseMessagesPerDay(s: Pick<QStashSchedule, 'cron' | 'retries'>): number {
  return runsPerDay(s.cron) * (1 + s.retries);
}

export function totalWorstCaseMessagesPerDay(schedules: readonly QStashSchedule[] = QSTASH_SCHEDULES): number {
  return schedules.reduce((sum, s) => sum + worstCaseMessagesPerDay(s), 0);
}

export function totalNormalMessagesPerDay(schedules: readonly QStashSchedule[] = QSTASH_SCHEDULES): number {
  return schedules.reduce((sum, s) => sum + runsPerDay(s.cron), 0);
}

// ── QStash REST request ──────────────────────────────────────────────────────

export interface ScheduleRequestInput {
  /** QStash API origin, e.g. https://qstash.upstash.io (the console shows the one for your region). */
  qstashUrl: string;
  /** Our site origin, e.g. https://project-anthology-eight.vercel.app */
  siteUrl: string;
  /** QSTASH_TOKEN. */
  token: string;
  /** CRON_SECRET: forwarded to the route as `Authorization: Bearer <secret>`. */
  cronSecret: string;
}

/** `POST /v2/schedules/{destination}`: with a fixed Upstash-Schedule-Id this creates the schedule or updates it in place. */
export function buildScheduleRequest(s: QStashSchedule, input: ScheduleRequestInput): { url: string; init: { method: 'POST'; headers: Record<string, string> } } {
  const qstash = input.qstashUrl.replace(/\/+$/, '');
  const destination = `${input.siteUrl.replace(/\/+$/, '')}${s.path}`;
  return {
    url: `${qstash}/v2/schedules/${destination}`,
    init: {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${input.token}`,
        'Upstash-Schedule-Id': s.id,
        'Upstash-Cron': s.cron,
        'Upstash-Method': 'GET',
        'Upstash-Retries': String(s.retries),
        'Upstash-Timeout': s.timeout,
        'Upstash-Forward-Authorization': `Bearer ${input.cronSecret}`,
      },
    },
  };
}
