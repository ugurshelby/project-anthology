/**
 * Apex notify-sessions trigger — calls the Anthology site's notify-sessions
 * cron route. Runs on Railway's Cron Schedule (not a long-lived process); each
 * invocation makes one request and exits.
 *
 * Set the Railway Cron Schedule to every 5-10 minutes (e.g. `*​/10 * * * *`),
 * NOT once/day — the route notifies ~30min before each session and dedupes via
 * the notified_sessions table, so frequent invocations are safe and required.
 *
 * Required env vars:
 *   SITE_URL     — e.g. https://project-anthology-seven.vercel.app
 *   CRON_SECRET  — shared secret, sent as Authorization: Bearer <secret>
 */

const siteUrl = process.env.SITE_URL;
const cronSecret = process.env.CRON_SECRET;

if (!siteUrl) {
  console.error('Missing SITE_URL env var');
  process.exit(1);
}
if (!cronSecret) {
  console.error('Missing CRON_SECRET env var');
  process.exit(1);
}

const url = `${siteUrl.replace(/\/+$/, '')}/api/cron/notify-sessions`;

try {
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${cronSecret}` },
  });
  const body = await res.text();
  console.log(`[notify-sessions] ${res.status} ${res.statusText}`);
  console.log(body);
  if (!res.ok) process.exit(1);
} catch (err) {
  console.error('[notify-sessions] request failed:', err);
  process.exit(1);
}
