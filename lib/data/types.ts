export type {
  Story,
  RadioMoment,
  Circuit,
  NewsCache,
  F1Snapshot,
} from '@/types/database';

/** Ergast/Jolpica MRData envelope returned by season proxies and snapshots. */
export interface MrDataPayload {
  MRData?: Record<string, unknown>;
  [key: string]: unknown;
}

export interface SeasonStandings {
  season: number;
  data: MrDataPayload;
}

export interface SeasonCalendar {
  season: number;
  data: MrDataPayload;
}

export interface RaceResult {
  season: number;
  round: number;
  data: MrDataPayload;
}

/** Race row from calendar MRData (minimal shape for pages). */
export interface Race {
  season: string;
  round: string;
  raceName: string;
  date: string;
  time?: string;
  Circuit?: {
    circuitId?: string;
    circuitName?: string;
    Location?: { locality?: string; country?: string };
  };
}

/** Normalized news row for server components. */
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
  dateLabel: string;
}
