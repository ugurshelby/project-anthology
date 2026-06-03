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
}
