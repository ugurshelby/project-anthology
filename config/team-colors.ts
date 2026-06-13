/**
 * F1 constructor brand colors — season-specific reference for UI theming.
 *
 * ⚠️ SEASONAL MAINTENANCE (do not skip):
 * Update this file at the start of each F1 season (typically January–February).
 * Check: FIA entry list, official livery launches, new/rebranded teams.
 * Also review alias strings when team display names change.
 *
 * @see .cursor/rules/CURSOR.md — "F1 takım renkleri" bölümü
 */

export const F1_TEAM_COLORS_SEASON = 2026;

/**
 * Season-aware 60-30-10 palette for profile-page theming (Faz 3).
 * primary = 60% dark background tone, secondary = 30% team brand,
 * accent = 10% highlight/glow.
 */
export interface SeasonPalette {
  primary: string;
  secondary: string;
  accent: string;
}

export type TeamColorSet = {
  /** Stable slug — matches `cars/` asset basename where possible */
  id: string;
  /** Official 2026 entry name */
  displayName: string;
  primary: string;
  secondary: string;
  accent: string;
  /** Best single color for timing bars, chips, and borders on dark UI */
  ui: string;
  /** Ergast constructorId and common live-API / broadcast name variants */
  aliases: readonly string[];
  carAsset: string;
  /**
   * Historical season palettes keyed by year (Faz 3). A profile page resolves
   * the nearest year ≤ the selected season; absent → falls back to the team's
   * current primary/secondary/accent. Only a few flagship teams are populated.
   */
  seasonPalettes?: Readonly<Record<number, SeasonPalette>>;
};

/** Default palette when no team context (site accent). */
export const DEFAULT_SEASON_PALETTE: SeasonPalette = {
  primary: '#0a0a0a',
  secondary: '#ff1801',
  accent: '#cc1400',
};

/** Intro / hero palette (site-wide, not team-specific) */
export const INTRO_COLORS = {
  background: '#000000',
  red: '#c60606',
  white: '#ffffff',
} as const;

export const TEAM_COLORS: readonly TeamColorSet[] = [
  {
    id: 'red-bull',
    displayName: 'Oracle Red Bull Racing',
    primary: '#3671C6',
    secondary: '#DC052D',
    accent: '#F7C300',
    ui: '#3671C6',
    aliases: ['red_bull', 'red bull', 'red bull racing', 'oracle red bull racing'],
    carAsset: 'redbull.png',
    seasonPalettes: {
      2026: { primary: '#0a0e1a', secondary: '#3671C6', accent: '#F7C300' },
      2021: { primary: '#0a0e1a', secondary: '#1E2A78', accent: '#FFD700' }, // RB16B title era
      2010: { primary: '#0b0d18', secondary: '#10215C', accent: '#E1B000' }, // first title era
    },
  },
  {
    id: 'mclaren',
    displayName: 'McLaren Mastercard F1 Team',
    primary: '#FF8000',
    secondary: '#2D2D2D',
    accent: '#47C7FC',
    ui: '#FF8000',
    aliases: ['mclaren', 'mclaren mastercard f1 team', 'mclaren mastercard'],
    carAsset: 'mclaren.png',
    seasonPalettes: {
      2026: { primary: '#0d0a06', secondary: '#FF8000', accent: '#47C7FC' },
      2010: { primary: '#0a0a0f', secondary: '#C0C0C0', accent: '#E8E8E8' }, // chrome/silver era
      2007: { primary: '#0f0a0a', secondary: '#CC0000', accent: '#FF3333' }, // Vodafone red
      1998: { primary: '#0c0c0c', secondary: '#D0D0D0', accent: '#E10600' }, // West silver+red
    },
  },
  {
    id: 'racing-bulls',
    displayName: 'Visa Cash App Racing Bulls',
    primary: '#1434CB',
    secondary: '#FFFFFF',
    accent: '#E10600',
    ui: '#1434CB',
    aliases: [
      'rb',
      'rb f1',
      'rb f1 team',
      'racing_bulls',
      'racing bulls',
      'visa cash app rb',
      'visa cash app racing bulls',
    ],
    carAsset: 'racing-bulls.png',
  },
  {
    id: 'ferrari',
    displayName: 'Scuderia Ferrari',
    primary: '#DC0000',
    secondary: '#111111',
    accent: '#F7D117',
    ui: '#DC0000',
    aliases: ['ferrari', 'scuderia ferrari'],
    carAsset: 'ferrari.png',
    seasonPalettes: {
      2026: { primary: '#1a0606', secondary: '#DC0000', accent: '#F7D117' },
      2007: { primary: '#180505', secondary: '#D40000', accent: '#FFE000' }, // Räikkönen title
      2004: { primary: '#180505', secondary: '#C00000', accent: '#FFFFFF' }, // Schumacher dominance
      2000: { primary: '#170505', secondary: '#C80000', accent: '#FFD800' }, // first Schumi title
    },
  },
  {
    id: 'mercedes',
    displayName: 'Mercedes-AMG PETRONAS F1 Team',
    primary: '#00D2BE',
    secondary: '#000000',
    accent: '#C0C0C0',
    ui: '#00D2BE',
    aliases: ['mercedes', 'mercedes-amg petronas', 'mercedes-amg petronas f1 team'],
    carAsset: 'mercedes.png',
    seasonPalettes: {
      2026: { primary: '#06100f', secondary: '#00D2BE', accent: '#C0C0C0' },
      2020: { primary: '#0a0a0a', secondary: '#00D2BE', accent: '#000000' }, // black livery era
      2014: { primary: '#06100f', secondary: '#00D2BE', accent: '#C0C0C0' }, // hybrid era begins
    },
  },
  {
    id: 'aston-martin',
    displayName: 'Aston Martin Aramco F1 Team',
    primary: '#006F62',
    secondary: '#111111',
    accent: '#CEDC00',
    ui: '#006F62',
    aliases: ['aston_martin', 'aston martin', 'aston martin aramco', 'aston martin aramco f1 team'],
    carAsset: 'aston-martin.png',
  },
  {
    id: 'alpine',
    displayName: 'BWT Alpine Formula One Team',
    primary: '#FF80C7',
    secondary: '#111111',
    accent: '#FF80C7',
    ui: '#FF80C7',
    aliases: ['alpine', 'alpine f1 team', 'bwt alpine', 'bwt alpine formula one team'],
    carAsset: 'alpine.png',
  },
  {
    id: 'haas',
    displayName: 'TGR Haas F1 Team',
    primary: '#FFFFFF',
    secondary: '#000000',
    accent: '#E10600',
    ui: '#E10600',
    aliases: ['haas', 'haas f1 team', 'tgr haas', 'tgr haas f1 team', 'moneygram haas'],
    carAsset: 'haas.png',
  },
  {
    id: 'williams',
    displayName: 'Williams Racing',
    primary: '#005AFF',
    secondary: '#041E42',
    accent: '#FFFFFF',
    ui: '#005AFF',
    aliases: ['williams', 'williams racing'],
    carAsset: 'williams.png',
    seasonPalettes: {
      2026: { primary: '#04101f', secondary: '#005AFF', accent: '#FFFFFF' },
      2003: { primary: '#05101c', secondary: '#1B3A6B', accent: '#E10600' }, // BMW blue/white/red
      1997: { primary: '#0a0a0c', secondary: '#0B2E63', accent: '#E8E8E8' }, // Rothmans title era
      1992: { primary: '#0a0a0c', secondary: '#102A66', accent: '#FFD200' }, // Mansell FW14B
    },
  },
  {
    id: 'audi',
    displayName: 'Audi Revolut F1 Team',
    primary: '#E8E8E8',
    secondary: '#8B9196',
    accent: '#FFFFFF',
    ui: '#E8E8E8',
    aliases: [
      'audi',
      'audi revolut',
      'audi revolut f1 team',
      'sauber',
      'kick sauber',
      'stake f1 team kick sauber',
    ],
    carAsset: 'audi.png',
  },
  {
    id: 'cadillac',
    displayName: 'Cadillac Formula 1 Team',
    primary: '#111111',
    secondary: '#FFFFFF',
    accent: '#B40000',
    ui: '#B40000',
    aliases: ['cadillac', 'cadillac formula 1 team', 'cadillac f1 team'],
    carAsset: 'cadillac.png',
  },
] as const;

const TEAM_BY_ID = new Map(TEAM_COLORS.map((team) => [team.id, team]));

const TEAM_LOOKUP = new Map<string, TeamColorSet>();
for (const team of TEAM_COLORS) {
  TEAM_LOOKUP.set(team.id, team);
  for (const alias of team.aliases) {
    TEAM_LOOKUP.set(alias.toLowerCase(), team);
  }
  TEAM_LOOKUP.set(team.displayName.toLowerCase(), team);
}

function normalizeHex(input: string): string {
  const raw = input.trim();
  if (!raw) return '';
  return raw.startsWith('#') ? raw : `#${raw}`;
}

export function getTeamById(id: string): TeamColorSet | undefined {
  return TEAM_BY_ID.get(id);
}

export function getTeamByName(name: string): TeamColorSet | undefined {
  const key = name.trim().toLowerCase();
  if (!key) return undefined;

  const exact = TEAM_LOOKUP.get(key);
  if (exact) return exact;

  // Fuzzy: Jolpica returns short or variant names (e.g. "Alpine F1 Team", "RB F1 Team").
  let best: { team: TeamColorSet; score: number } | undefined;
  for (const team of TEAM_COLORS) {
    const candidates = [
      team.id.replace(/-/g, ' '),
      ...team.aliases,
    ];
    for (const alias of candidates) {
      if (key === alias || key.includes(alias) || alias.includes(key)) {
        const score = alias.length;
        if (!best || score > best.score) {
          best = { team, score };
        }
      }
    }
  }
  return best?.team;
}

/** Resolve the best UI accent color from live API hex and/or team name. */
export function resolveTeamUiColor(apiColor: unknown, teamName?: string): string {
  const fromApi = normalizeHex(String(apiColor ?? ''));
  if (fromApi) return fromApi;

  const team = teamName ? getTeamByName(teamName) : undefined;
  if (team) return team.ui;

  return INTRO_COLORS.red;
}

/**
 * Resolve the 60-30-10 palette for a team in a given season (Faz 3):
 *   1. exact season match in seasonPalettes
 *   2. nearest populated year ≤ season (era continuity)
 *   3. the team's current primary/secondary/accent
 *   4. DEFAULT_SEASON_PALETTE when the team is unknown.
 */
export function getSeasonPalette(
  teamIdOrName: string | null | undefined,
  season: number,
): SeasonPalette {
  if (!teamIdOrName) return DEFAULT_SEASON_PALETTE;
  const team = getTeamById(teamIdOrName) ?? getTeamByName(teamIdOrName);
  if (!team) return DEFAULT_SEASON_PALETTE;

  const palettes = team.seasonPalettes;
  if (palettes) {
    if (palettes[season]) return palettes[season];
    const years = Object.keys(palettes)
      .map(Number)
      .filter((y) => y <= season)
      .sort((a, b) => b - a);
    if (years.length > 0) return palettes[years[0]];
  }
  return { primary: team.primary, secondary: team.secondary, accent: team.accent };
}

/** Inline CSS custom properties for a resolved palette (profile page theming). */
export function teamPaletteCssVars(palette: SeasonPalette): Record<string, string> {
  return {
    '--team-primary': palette.primary,
    '--team-secondary': palette.secondary,
    '--team-accent': palette.accent,
  };
}

export function teamColorsCssVars(): Record<string, string> {
  const vars: Record<string, string> = {
    '--f1-intro-bg': INTRO_COLORS.background,
    '--f1-intro-red': INTRO_COLORS.red,
    '--f1-intro-white': INTRO_COLORS.white,
  };
  for (const team of TEAM_COLORS) {
    const prefix = `--team-${team.id}`;
    vars[`${prefix}-primary`] = team.primary;
    vars[`${prefix}-secondary`] = team.secondary;
    vars[`${prefix}-accent`] = team.accent;
    vars[`${prefix}-ui`] = team.ui;
  }
  return vars;
}
