import type { NewsItem } from '@/lib/data/types';
import { formatDate } from '@/lib/i18n/format';

/** Return Turkish title if locale is 'tr' and translation exists, otherwise English title. */
export function localizedNewsTitle(item: NewsItem, locale?: string): string {
  return locale === 'tr' && item.titleTr ? item.titleTr : item.title;
}

/** Return Turkish summary if locale is 'tr' and translation exists, otherwise English summary. */
export function localizedNewsSummary(item: NewsItem, locale?: string): string {
  return locale === 'tr' && item.summaryTr ? item.summaryTr : item.summary;
}

/** Publication date in the visitor's language; falls back to the stored English label. */
export function newsDateLabel(item: { publishedAt?: string; publishedTs?: number; dateLabel?: string }, locale?: string): string {
  const source = item.publishedTs || item.publishedAt;
  const formatted = source ? formatDate(source, locale, { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC' }) : '';
  return formatted || item.dateLabel || '';
}
