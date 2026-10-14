/** Relative wire timestamp for compact news rows, in the page language (EN default). */
export function formatDispatchAge(publishedTs: number, now = Date.now(), locale = 'en'): string {
  if (!publishedTs) return '';
  const tr = locale === 'tr';
  const diffMs = Math.max(0, now - publishedTs);
  const minutes = Math.floor(diffMs / 60_000);
  if (minutes < 60) {
    if (minutes <= 1) return tr ? 'AZ ÖNCE' : 'JUST IN';
    return tr ? `${minutes} DK ÖNCE` : `${minutes} MIN AGO`;
  }
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return tr ? `${hours} SAAT ÖNCE` : `${hours} ${hours === 1 ? 'HOUR' : 'HOURS'} AGO`;
  const days = Math.floor(hours / 24);
  if (days < 14) return tr ? `${days} GÜN ÖNCE` : `${days} ${days === 1 ? 'DAY' : 'DAYS'} AGO`;
  return '';
}
