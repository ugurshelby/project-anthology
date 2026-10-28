import type { QStashSchedule } from './qstashSchedules';

/**
 * Live schedules that duplicate a managed one: same destination as a managed `path`,
 * but not one of our fixed `apex-*` ids (the `scd_…` ones made through the Upstash MCP).
 * Schedules aimed anywhere else are never touched.
 */
export function schedulesToPrune(
  live: ReadonlyArray<{ scheduleId: string; destination: string }>,
  managed: readonly QStashSchedule[],
  siteUrl: string,
): string[] {
  const origin = siteUrl.replace(/\/+$/, '');
  const managedIds = new Set(managed.map((s) => s.id));
  const managedTargets = new Set(managed.map((s) => `${origin}${s.path}`));
  return live
    .filter((s) => !managedIds.has(s.scheduleId))
    .filter((s) => managedTargets.has(s.destination.split('?')[0].replace(/\/+$/, '')))
    .map((s) => s.scheduleId);
}
