import type { MediaEntityType } from '@/types/database';

export type { MediaEntityType };

export const MEDIA_ENTITY_TYPES: readonly MediaEntityType[] = ['driver', 'team', 'car', 'circuit'];

/** An entity the site needs an image for. `key` follows the Jolpica id conventions (see keys.ts). */
export interface MediaEntity {
  type: MediaEntityType;
  key: string;
  season?: number | null;
  displayName?: string | null;
  wikipediaUrl?: string | null;
  /** Other ids the site uses for this entity (F1DB ids on archive pages). */
  aliases?: string[];
  /** Free-form hints: constructor name for cars, curated file titles, search query. */
  extra?: Record<string, unknown>;
}

/** Everything `extmetadata` + imageinfo tells us about one Commons file. */
export interface CommonsFileInfo {
  title: string; // 'File:Example.jpg'
  pageUrl: string;
  width: number;
  height: number;
  mime: string;
  /** Render URL at `iiurlwidth` (PNG for SVG, scaled JPEG/PNG otherwise). */
  thumbUrl: string | null;
  originalUrl: string | null;
  licenseCode: string; // extmetadata.License ('cc-by-sa-4.0', 'pd', ...)
  licenseShortName: string;
  licenseUrl: string | null;
  nonFree: boolean;
  copyrighted: boolean | null;
  restrictions: string;
  artist: string;
  credit: string;
  description: string;
  objectName: string;
  /** DateTimeOriginal (or DateTime) year when parseable. */
  year: number | null;
  /** Visible (non-hidden) category names without the 'Category:' prefix. */
  categories: string[];
}

export interface LicenseVerdict {
  ok: boolean;
  /** Human label stored in the DB, e.g. 'CC BY-SA 4.0' or 'Public domain'. */
  label: string;
  attributionRequired: boolean;
  shareAlike: boolean;
  url: string | null;
  reason?: string;
}

export interface Candidate {
  file: CommonsFileInfo;
  license: LicenseVerdict;
  source: 'wikidata-p18' | 'wikidata-p154' | 'commons-category' | 'commons-search' | 'curated';
  score: number;
}

export interface ResolveOutcome {
  /** Best candidate, or null when nothing passed the gates ('missing'). */
  best: Candidate | null;
  /** How many candidates were inspected / rejected (diagnostics). */
  inspected: number;
  notes: string[];
  /** Every candidate that cleared the hard gates, best first (including those below MIN_SCORE; diagnostics). */
  candidates: Candidate[];
}

export interface MediaVariant {
  w: number;
  h: number;
  path: string;
  bytes: number;
}

export interface ProcessedImage {
  width: number;
  height: number;
  sha256: string;
  blurDataUrl: string;
  dominantColor: string;
  variants: Array<{ w: number; h: number; bytes: number; buffer: Buffer }>;
}
