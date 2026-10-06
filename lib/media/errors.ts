/**
 * PostgREST / Postgres wording for "table not there", matched only for our own two
 * media tables so no other failure is swallowed. Lets the sync-media cron stay inert
 * (HTTP 200) until the `media_assets` migration has been applied.
 */
export function isMissingMediaTables(message: string): boolean {
  return (
    /\bmedia_(assets|sync_state)\b/.test(message) &&
    /(schema cache|does not exist|PGRST205|42P01)/i.test(message)
  );
}
