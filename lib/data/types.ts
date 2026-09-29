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
}
