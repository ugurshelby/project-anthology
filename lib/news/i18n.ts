import type { NewsItem } from '@/lib/data/types';

/** Return Turkish title if locale is 'tr' and translation exists, otherwise English title. */
export function localizedNewsTitle(item: NewsItem, locale?: string): string {
  return locale === 'tr' && item.titleTr ? item.titleTr : item.title;
}

/** Return Turkish summary if locale is 'tr' and translation exists, otherwise English summary. */
export function localizedNewsSummary(item: NewsItem, locale?: string): string {
  return locale === 'tr' && item.summaryTr ? item.summaryTr : item.summary;
}
