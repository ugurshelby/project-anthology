/**
 * Apex F1 sync trigger — calls the Anthology site's live-scope sync-f1 cron
 * route. Runs on Railway's Cron Schedule (not a long-lived process); each
 * invocation makes one request and exits.
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

const url = `${siteUrl.replace(/\/+$/, '')}/api/cron/sync-f1?scope=live`;

try {
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${cronSecret}` },
  });
  const body = await res.text();
  console.log(`[sync-f1 live] ${res.status} ${res.statusText}`);
  console.log(body);
  if (!res.ok) process.exit(1);
} catch (err) {
  console.error('[sync-f1 live] request failed:', err);
  process.exit(1);
}
