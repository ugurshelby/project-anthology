/** Relative wire timestamp for compact news rows. */
export function formatDispatchAge(publishedTs: number, now = Date.now()): string {
  if (!publishedTs) return '';
  const diffMs = Math.max(0, now - publishedTs);
  const minutes = Math.floor(diffMs / 60_000);
  if (minutes < 60) return minutes <= 1 ? 'JUST IN' : `${minutes} MIN AGO`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} ${hours === 1 ? 'HOUR' : 'HOURS'} AGO`;
  const days = Math.floor(hours / 24);
  if (days < 14) return `${days} ${days === 1 ? 'DAY' : 'DAYS'} AGO`;
  return '';
}
