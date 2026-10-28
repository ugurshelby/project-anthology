import type { MediaResult } from '@/lib/media/read';
import type { MediaEntityType } from '@/lib/media/types';
/** Shared data-layer types consumed by RSC pages. */

export interface NewsItem {
  id: string;
  title: string;
  summary: string;
  url: string;
  sourceName: string;
  sources: string[];
  image: string;
  publishedAt: string;
  publishedTs: number;
  /** Pre-formatted display label, e.g. "14 Apr 2026". */
  dateLabel: string;
  /** Machine-translated (MyMemory) Turkish title — null/undefined when not yet translated; UI falls back to `title`. */
  titleTr?: string | null;
  /** Machine-translated (MyMemory) Turkish summary — null/undefined when not yet translated; UI falls back to `summary`. */
  summaryTr?: string | null;
  /** Every outlet that covered the story, with a link to its article (detail page attribution). */
  sourceLinks?: Array<{ name: string; url: string; title: string }>;
  /**
   * Licensed archive image for an item without a usable publisher photo (master-plan 8.9): the
   * driver, team car or circuit the headline is about. Team matches use the season's car photo,
   * never a team logo (owner decision 2026-10-27, 8.11b).
   */
  fallbackMedia?: { type: MediaEntityType; key: string; result: MediaResult };
}
