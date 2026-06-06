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
    primary: '#1E5BC6',
    secondary: '#DC052D',
    accent: '#F7C300',
    ui: '#1E5BC6',
    aliases: ['red_bull', 'red bull', 'red bull racing', 'oracle red bull racing'],
    carAsset: 'redbull.png',
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
  },
  {
    id: 'racing-bulls',
    displayName: 'Visa Cash App Racing Bulls',
    primary: '#2647D8',
    secondary: '#FFFFFF',
    accent: '#E10600',
    ui: '#2647D8',
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
    primary: '#0090FF',
    secondary: '#111111',
    accent: '#FF87BC',
    ui: '#0090FF',
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
  },
  {
    id: 'audi',
    displayName: 'Audi Revolut F1 Team',
    primary: '#C00000',
    secondary: '#8B9196',
    accent: '#FFFFFF',
    ui: '#C00000',
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
    accent: '#C8102E',
    ui: '#C8102E',
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
