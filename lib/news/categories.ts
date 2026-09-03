/**
 * Editorial news taxonomy — keyword heuristics over title/summary.
 * Used by /news filter pills and wire telemetry tags.
 */

export type NewsCategory =
  | 'all'
  | 'breaking'
  | 'race-recaps'
  | 'tech'
  | 'paddock'
  | 'driver-market';

export interface NewsFilterOption {
  id: NewsCategory;
  label: string;
}

export const NEWS_FILTERS: NewsFilterOption[] = [
  { id: 'all', label: 'All Breaking' },
  { id: 'race-recaps', label: 'Race Recaps' },
  { id: 'tech', label: 'Tech & Upgrades' },
  { id: 'paddock', label: 'Paddock Rumors' },
  { id: 'driver-market', label: 'Driver Market' },
];

const TEAM_TAGS: { match: RegExp; tag: string }[] = [
  { match: /\bferrari\b/i, tag: 'FERRARI' },
  { match: /\bmclaren\b/i, tag: 'MCLAREN' },
  { match: /\bred bull\b|\brbr\b/i, tag: 'RED BULL' },
  { match: /\bmercedes\b/i, tag: 'MERCEDES' },
  { match: /\baston martin\b/i, tag: 'ASTON MARTIN' },
  { match: /\balpine\b/i, tag: 'ALPINE' },
  { match: /\bwilliams\b/i, tag: 'WILLIAMS' },
  { match: /\bhaas\b/i, tag: 'HAAS' },
  { match: /\bracing bulls?\b|\bvisa cash\b|\bvcarb\b/i, tag: 'RACING BULLS' },
  { match: /\bsauber\b|\baudi\b/i, tag: 'SAUBER' },
  { match: /\bcadillac\b/i, tag: 'CADILLAC' },
];

const DRIVER_MARKET_RE =
  /\b(contract|signing|signed|transfer|driver market|free agent|seat|replaces?|replacement|moves? to|joining|joins|rumour mill|line[- ]?up)\b/i;

const TECH_RE =
  /\b(upgrade|upgrades|floor|aero|aerodynamic|technical|wing|rear wing|front wing|DRS|power unit|PU |sidepod|sidepods|diffuser|telemetry|spec )\b/i;

const RACE_RE =
  /\b(race recap|grand prix|GP result|wins? |won |podium|pole |qualifying|sprint|FP1|FP2|FP3|practice|championship standings|points finish)\b/i;

const PADDOCK_RE =
  /\b(rumour|rumor|paddock|sources say|insider|gossip|alleged| reportedly|behind the scenes|team radio leak)\b/i;

const BREAKING_RE =
  /\b(breaking|exclusive|confirmed|just in|latest|official|announces?|announced)\b/i;

export function classifyNewsCategory(title: string, summary = ''): Exclude<NewsCategory, 'all'> {
  const hay = `${title} ${summary}`;
  if (DRIVER_MARKET_RE.test(hay)) return 'driver-market';
  if (TECH_RE.test(hay)) return 'tech';
  if (RACE_RE.test(hay)) return 'race-recaps';
  if (PADDOCK_RE.test(hay)) return 'paddock';
  if (BREAKING_RE.test(hay)) return 'breaking';
  return 'breaking';
}

export function detectTeamTag(title: string, summary = ''): string | null {
  const hay = `${title} ${summary}`;
  for (const row of TEAM_TAGS) {
    if (row.match.test(hay)) return row.tag;
  }
  return null;
}

/** Rough editorial read time from summary (+ title weight). Min 2, max 8. */
export function estimateReadMinutes(summary: string, title = ''): number {
  const words = `${title} ${summary}`.trim().split(/\s+/).filter(Boolean).length;
  // RSS summaries are short — bias toward 3–5 min editorial feel.
  const minutes = Math.round(words / 45) + 2;
  return Math.min(8, Math.max(2, minutes));
}

/** UTC clock for wire telemetry rows, e.g. "14:22 UTC". */
export function formatWireTime(publishedTs: number): string {
  if (!publishedTs) return '——:—— UTC';
  const d = new Date(publishedTs);
  const hh = String(d.getUTCHours()).padStart(2, '0');
  const mm = String(d.getUTCMinutes()).padStart(2, '0');
  return `${hh}:${mm} UTC`;
}

/** True when the cover URL is usable (not empty / not the site placeholder). */
export function hasRealImage(item: { image: string }): boolean {
  return Boolean(item.image) && item.image !== '/placeholder.svg';
}
