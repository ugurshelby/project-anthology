import { classifyLicense } from '@/lib/media/license';
import type { Candidate, CommonsFileInfo, MediaEntityType } from '@/lib/media/types';

/**
 * Gates + scoring for candidate files, per entity type.
 *
 * Philosophy: wrong image is worse than no image. Every candidate passes HARD
 * gates first (license, format, size, subject words, year for cars). Survivors
 * are ranked; the winner must also reach MIN_SCORE or the entity becomes
 * `missing` and the UI draws a placeholder.
 */

export const MIN_SCORE: Record<MediaEntityType, number> = {
  driver: 55,
  team: 60,
  car: 60,
  circuit: 50,
};

/** Min pixel dimensions (longest side for logos is irrelevant for SVG renders). */
const MIN_WIDTH: Record<MediaEntityType, number> = {
  driver: 400,
  team: 160,
  car: 1400,
  circuit: 1400,
};

/** Width we ask Commons to render (we never need more than the biggest variant). */
export const THUMB_WIDTH: Record<MediaEntityType, number> = {
  driver: 1000,
  team: 800,
  car: 1600,
  circuit: 1600,
};

export function fold(text: string): string {
  return text
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase();
}

const GENERIC_WORDS = new Set([
  'f1', 'team', 'racing', 'formula', 'one', 'grand', 'prix', 'circuit', 'circuito', 'autodromo', 'autodromo',
  'nazionale', 'internacional', 'international', 'course', 'de', 'di', 'del', 'da', 'the', 'of', 'and', 'park',
  'speedway', 'motor', 'motorsport', 'racetrack', 'track', 'gp', 'world', 'championship', 'works',
]);

/** Significant lowercase, diacritic-free words of a name (generic motorsport words removed). */
export function nameTokens(name: string | null | undefined, minLen = 3): string[] {
  if (!name) return [];
  const words = fold(name)
    .replace(/[^a-z0-9\s-]/g, ' ')
    .split(/[\s-]+/)
    .filter(Boolean);
  const sig = words.filter((w) => w.length >= minLen && !GENERIC_WORDS.has(w));
  return Array.from(new Set(sig));
}

/** Display-name tokens plus tokens of hint names (e.g. the Wikipedia title 'Racing Bulls' for constructor 'RB F1 Team'). */
export function subjectTokens(ctx: { displayName: string | null; nameHints: string[] }, minLen = 3): string[] {
  return Array.from(new Set([...nameTokens(ctx.displayName, minLen), ...ctx.nameHints.flatMap((h) => nameTokens(h, minLen))]));
}

export function haystack(file: CommonsFileInfo): string {
  return fold([file.title, file.objectName, file.description, ...file.categories].join(' | '));
}

function titleOnly(file: CommonsFileInfo): string {
  return fold(file.title);
}

/** Short tokens ('rb', 'f1') must match as whole words, or 'rb' would hit 'Kirby'. */
function tokenHit(text: string, token: string): boolean {
  if (token.length >= 4) return text.includes(token);
  return new RegExp(`(^|[^a-z0-9])${token.replace(/[^a-z0-9]/g, '')}([^a-z0-9]|$)`).test(text);
}

function hasAny(text: string, tokens: string[]): boolean {
  return tokens.some((t) => tokenHit(text, t));
}

function hasAll(text: string, tokens: string[]): boolean {
  return tokens.length > 0 && tokens.every((t) => tokenHit(text, t));
}

/** Titles that are never a subject photo/logo for the site. */
const NEVER =
  /(\bmap\b|layout|diagram|schematic|ticket|stamp|poster|screenshot|wallpaper|sticker|\.djvu|\.pdf|\.tif|\.tiff|\bscan\b|crash test|replica|lego|diecast|die-cast|brumm|minichamps|hot wheels|scale model|toy|model car|\bsim\b|simulator|video game)/i;

/** Other series — a Formula 2/3/E car is not "the" F1 car. */
const OTHER_SERIES = /(formula 2\b|formula two|\bf2\b|formula 3\b|formula three|\bf3\b|formula e\b|\bgt3\b|motogp|nascar|indycar|\bdtm\b|\bwrc\b|\bwec\b)/i;

const CAR_DESIGNATION = /\b(?:mcl|sf|rb|w|amr|a5|c4|vf|fw|vcarb|rb|sf-|ar|mp4|f1)[ -]?\d{1,3}[a-z]?\b/i;

/** Format check. SVG is only accepted for team logos (rendered to PNG by Commons). */
function formatOk(file: CommonsFileInfo, type: MediaEntityType): boolean {
  if (file.mime === 'image/svg+xml') return type === 'team';
  return file.mime === 'image/jpeg' || file.mime === 'image/png' || file.mime === 'image/webp';
}

export interface Evaluation {
  ok: boolean;
  score: number;
  reason?: string;
}

const no = (reason: string): Evaluation => ({ ok: false, score: 0, reason });

export interface EvalContext {
  type: MediaEntityType;
  displayName: string | null;
  /** Extra subject-name words (Wikipedia title, the Jolpica id's words). */
  nameHints: string[];
  /** Town/area words for circuits. Only trusted for Wikidata P18; elsewhere they match unrelated places in the same town. */
  localityHints?: string[];
  season: number | null;
  source: Candidate['source'];
  curated: boolean;
}

export function evaluateCandidate(file: CommonsFileInfo, ctx: EvalContext): Evaluation {
  if (!formatOk(file, ctx.type)) return no(`format ${file.mime}`);
  const lic = classifyLicense(file);
  if (!lic.ok) return no(`license: ${lic.reason ?? lic.label}`);
  if (!ctx.curated && NEVER.test(file.title)) return no('blacklisted title');

  const isSvg = file.mime === 'image/svg+xml';
  if (!isSvg && file.width < MIN_WIDTH[ctx.type]) return no(`too small (${file.width}px)`);
  // Venue and car PHOTOS are JPEG/WebP; PNGs there are almost always track diagrams or screenshots
  // (seen in the dry run: 'Hard Rock Stadium Circuit 2022.png', 'National Circuit with Foro Sol.png').
  if (!ctx.curated && (ctx.type === 'circuit' || ctx.type === 'car') && file.mime === 'image/png') return no('png is not a photo');

  if (ctx.curated) {
    // Curated = a human picked this exact file; only the license/format/size gates apply.
    return { ok: true, score: 100 };
  }
  switch (ctx.type) {
    case 'driver':
      return evalDriver(file, ctx);
    case 'team':
      return evalTeam(file, ctx);
    case 'car':
      return evalCar(file, ctx);
    case 'circuit':
      return evalCircuit(file, ctx);
  }
}

function sourceBase(source: Candidate['source']): number {
  if (source === 'wikidata-p18' || source === 'wikidata-p154') return 45;
  if (source === 'curated') return 100;
  return 20;
}

// ── driver ───────────────────────────────────────────────────────────────────
function evalDriver(file: CommonsFileInfo, ctx: EvalContext): Evaluation {
  const text = haystack(file);
  const tokens = nameTokens(ctx.displayName);
  const surnameHit = hasAny(text, tokens);
  // Search/category hits must clearly be about this person; a Wikidata P18 is
  // curated by Wikidata editors for exactly this person, so it is trusted.
  if (ctx.source === 'commons-search' && !surnameHit) return no('driver name not in title/categories');
  if (OTHER_SERIES.test(file.title) && ctx.source === 'commons-search') return no('other series');

  let score = sourceBase(ctx.source);
  if (surnameHit) score += 20;
  if (hasAll(text, tokens)) score += 10;
  const ratio = file.width / Math.max(1, file.height);
  if (ratio >= 0.6 && ratio <= 1.25) score += 15; // portrait-ish framing: face is large
  else if (ratio > 1.8) score -= 15;
  if (file.width >= 800) score += 8;
  if (file.width >= 1600) score += 4;
  if (/cropped/i.test(file.title)) score += 6;
  if (/(helmet|jumpsuit|trophy|statue|waxwork|wax figure|exhibition|museum|autograph|signature|caricature|drawing|cartoon)/i.test(file.title)) {
    score -= 40;
  }
  // Group / podium shots make a bad single portrait.
  if (/(&|\band\b|\bwith\b|podium|\bteam\b|celebrat|handshake|duo|\bvs\b)/i.test(file.title)) score -= 30;
  // Prefer a photo from the driver's most recent season (current team livery).
  if (file.year && ctx.season) {
    const age = ctx.season - file.year;
    if (age <= 1) score += 14;
    else if (age <= 3) score += 6;
    else if (age >= 6) score -= 4;
  } else if (file.year && file.year >= 2015) {
    score += 6;
  }
  return { ok: true, score };
}

// ── team logo ────────────────────────────────────────────────────────────────
const LOGO_WORDS = /(logo|wordmark|emblem|crest|badge|symbol|speedmark|lettermark|marque)/i;

function evalTeam(file: CommonsFileInfo, ctx: EvalContext): Evaluation {
  if (!LOGO_WORDS.test(file.title)) return no('not a logo file');
  const tokens = subjectTokens(ctx, 2);
  const t = titleOnly(file);
  if (tokens.length && !hasAny(t, tokens) && !hasAny(haystack(file), tokens)) return no('team name not in title/categories');
  if (/(photograph|photo of|car |livery|pit |driver|\bsponsor|\bgp\b|advertis|marlboro|subliminal|barcode|billboard|\bsign\b|merchandise|poster)/i.test(file.title)) return no('not a plain logo');
  // Junior series that reuse a team's name ('Formula Renault 2.0 NEC', 'Eurocup', 'Formula Regional').
  if (/(formula renault|eurocup|\bnec\b|\b2\.0\b|formula regional|formula 4|\bf4\b|formula 3|formula 2|\bf3\b|\bf2\b|\balps\b|academy|junior|karting|esports?|simracing)/i.test(file.title)) {
    return no('junior series / other competition');
  }
  // Same brand, different business: theme parks, museums, shops, energy drinks, esports, road cars.
  if (/(\bworld\b|abu dhabi|\bland\b|museum|museo|\bpark\b|\bstore\b|\bshop\b|esports?|energy drink|\bcan\b|automobili|\bcars?\b|\bmotorcycle|\bmotogp\b|\bbikes?\b|\bwatch|\bfoundation\b)/i.test(file.title)) {
    return no('same brand, not the F1 team');
  }

  // A model/trim code in the name (F430, 16M, 599) means a road-car badge, not a team logo.
  if (/\b[a-z]{0,2}\d{2,3}[a-z]?\b/i.test(file.title.replace(/\b(19|20)\d{2}\b/g, ''))) return no('looks like a car model badge');

  let score = sourceBase(ctx.source);
  if (hasAny(t, tokens)) score += 25;
  // The F1 team's own mark usually says racing / F1 / formula / team / scuderia.
  if (/(racing|\bf1\b|formula|scuderia|\bteam\b|petronas|grand prix)/i.test(file.title)) score += 15;
  else if (ctx.source === 'commons-search') score -= 10;
  if (file.mime === 'image/svg+xml') score += 15;
  if (file.mime === 'image/png' && file.width >= 400) score += 6;
  if (/(white|negative|reversed|inverted|monochrome|mono)\b/i.test(file.title)) score -= 18;
  if (/\bblack\b/i.test(file.title)) score -= 6;
  if (/(old|former|vintage|historic|\b19\d\d\b)/i.test(file.title)) score -= 12;
  // Prefer the most recent year-stamped version: '(2026)' beats '(2018)'.
  const y = /\b(20[0-3]\d)\b/.exec(file.title);
  if (y) score += Math.max(-15, Math.min(14, Number(y[1]) - 2012));
  return { ok: true, score };
}

// ── car (one image per team per season) ──────────────────────────────────────
/** A Commons category that names BOTH the team and a car designation ('McLaren MCL39', 'Red Bull RB19'). */
function carSpecificCategory(file: CommonsFileInfo, tokens: string[]): boolean {
  return file.categories.some((c) => {
    const f = fold(c);
    return CAR_DESIGNATION.test(c) && hasAny(f, tokens);
  });
}

function evalCar(file: CommonsFileInfo, ctx: EvalContext): Evaluation {
  if (!ctx.season) return no('car needs a season');
  if (OTHER_SERIES.test(file.title) || file.categories.some((c) => OTHER_SERIES.test(c))) return no('other series');

  const tokens = subjectTokens(ctx, 2);
  const titleText = fold(file.title);
  const tokenInTitle = hasAny(titleText, tokens);
  // The team must be named in the TITLE, or in a car-specific category. A team word in some generic
  // category is not enough: engine suppliers, sponsors and partners were matched that way (dry run:
  // a McLaren driver filed as 'Renault', a politician at the Azerbaijan GP as 'Racing Point').
  if (!tokenInTitle && !carSpecificCategory(file, tokens)) return no('constructor not in title or a car-specific category');

  // Heritage / exhibition / merchandise / non-car subjects (dry run: a 1984 MP4-2C, a W196S road car,
  // a steering wheel, a sponsor booth, a podium celebration).
  if (/(classic|historic|vintage|legend|goodwood|festival of speed|demo run|museum|exhibition|booth|partner|ceremony|steering wheel|\btire\b|\btyre\b|rubber|\btoy\b|miniature|replica|\bscene\b|celebrat|\bwin\b|winner|victory|fan ?zone|fashion|trophy|helmet|jumpsuit|interview|press conference|cutaway|engine\b|merchandise)/i.test(file.title)) {
    return no('not a current-season car shot');
  }
  if (file.categories.some((c) => /(historic|classic|vintage|museum|collection|goodwood|legends?|retro|heritage)/i.test(c))) {
    return no('historic/museum category');
  }

  // Designation families that were used for decades: 'MP4-x' is McLaren 1981–2016, so for later seasons it is a
  // classic car shown at a parade (dry run: 'MP4-1B at the 2018 British GP', 'MP4-25' filed under 2019).
  if (ctx.season >= 2017 && /\bmp4[-/ ]?\d/i.test(`${file.title} ${file.categories.join(' ')}`)) return no('heritage designation (MP4-x) for a modern season');

  // The year gate is what stops "previous/next season's car" being shown.
  const titleYears = Array.from(file.title.matchAll(/\b(19|20)\d{2}\b/g)).map((m) => Number(m[0]));
  const yearOk = titleYears.includes(ctx.season) || (titleYears.length === 0 && file.year === ctx.season);
  if (!yearOk) return no(`year mismatch (want ${ctx.season}, title ${titleYears.join('/') || '-'}, meta ${file.year ?? '-'})`);
  // Only the upload date to go on (no year in the title): demand an event word so it is a race-weekend shot.
  if (titleYears.length === 0 && !/(grand prix|\bgp\b|testing|test days|pre-?season|\bfp[123]\b|qualifying|\brace\b|sprint)/i.test(file.title) && !carSpecificCategory(file, tokens)) {
    return no('year only from metadata and no event/car signal');
  }

  const ratio = file.width / Math.max(1, file.height);
  if (ratio < 1.2 || ratio > 2.6) return no(`aspect ${ratio.toFixed(2)}`);

  let score = sourceBase(ctx.source) + 25; // name + year gates passed
  if (tokenInTitle) score += 12;
  if (CAR_DESIGNATION.test(file.title) || carSpecificCategory(file, tokens)) score += 15;
  // On-track action shows the whole car. Pit-garage walks ("Thursday"), show cars, fan zones and launches
  // often hide it behind crew/crowds (seen in the 2025 dry run), so they are accepted but ranked lower.
  if (/\b(fp[123]|practice|qualifying|sprint|race|test|testing|shakedown|grand prix|gp)\b/i.test(file.title)) score += 10;
  else if (/\b(car|chassis|livery)\b/i.test(file.title)) score += 4;
  if (/\b(thursday|garage|pit ?lane|pitlane|walk|show car|launch)\b/i.test(file.title)) score -= 5;
  if (file.width >= 2400) score += 6;
  if (file.width >= 3600) score += 3;
  return { ok: true, score };
}

// ── circuit ──────────────────────────────────────────────────────────────────
function evalCircuit(file: CommonsFileInfo, ctx: EvalContext): Evaluation {
  const text = haystack(file);
  const nameToks = subjectTokens(ctx);
  // Locality words ('Berlin' for AVUS, 'Kent' for Brands Hatch) also match unrelated photos of the same town,
  // so they only count for a Wikidata P18 (editor-curated for this very venue).
  const localToks = ctx.source === 'wikidata-p18' ? (ctx.localityHints ?? []).flatMap((h) => nameTokens(h)) : [];
  const tokens = Array.from(new Set([...nameToks, ...localToks]));
  if (tokens.length && !hasAny(text, tokens)) return no('circuit name not in title/categories');
  if (OTHER_SERIES.test(file.title) && ctx.source === 'commons-search') return no('other series');

  const ratio = file.width / Math.max(1, file.height);
  if (ratio < 1.2 || ratio > 3.4) return no(`aspect ${ratio.toFixed(2)}`);

  // 'panoramio' is a defunct photo site that tags thousands of unrelated place photos, not a "panorama".
  const title = file.title.replace(/panoramio/gi, ' ');
  const lowered = fold(`${title} | ${file.categories.join(' | ')}`);

  // Racing context: the file must say it is a racing venue (title or Commons categories). This is what
  // separates "Donington Park Farmhouse Hotel", "Long Beach, NY" or "Aerial View of Baku" from the circuit.
  // A Wikidata P18 on a circuit item is already editor-curated for that venue, so it only needs the name.
  const RACING_CONTEXT = /(circuit|race ?track|racetrack|racing|\brace\b|motor ?sport|motorsport|autodrom|autodromo|speedway|raceway|nordschleife|rennstrecke|karussell|carousel|boxengasse|haupttribune|\bf1\b|formula (one|1)|grand prix|\bgp\b|pit (lane|building|complex)|paddock|grandstand|tribuna|tribune|main straight|hairpin|chicane|schikane|\bturn \d|kurve|corner|street circuit|start[- ]finish)/;
  const hasContext = RACING_CONTEXT.test(lowered);
  const tokenInTitle = hasAny(fold(title), tokens);
  // A PHYSICAL venue word in the title ('racing'/'race'/'F1' alone describe an event, not a place: a Daytona
  // prototype photo passed on 'Racing' in its title).
  const VENUE_WORD = /(circuit|circuito|autodrom|speedway|raceway|race ?track|racetrack|nordschleife|rennstrecke|karussell|carousel|grandstand|tribuna|tribune|haupttribune|paddock|pit (lane|building|complex)|boxengasse|main straight|start[- ]finish|hairpin|chicane|schikane|\bturn \d|kurve|control tower|infield)/;
  const contextInTitle = VENUE_WORD.test(fold(title));
  // Categories alone are not enough: a NASCAR driver's portrait sat in 'Watkins Glen' categories and was even the
  // Wikidata image of the circuit. The TITLE must name the venue or contain a racing word; categories add context.
  if (!tokenInTitle && !contextInTitle) return no('title names neither the venue nor a racing word');
  if (!hasContext && !(ctx.source === 'wikidata-p18' && tokenInTitle)) return no('no racing context in title/categories');
  // 'Kyalami 1968 - 1987.jpg': a year range is a layout/history diagram, not a photo.
  if (/\b(19|20)\d{2}\s*[-–—]\s*(19|20)\d{2}\b/.test(title)) return no('year range = layout diagram');
  // City/landscape views and traffic scenes that carry the place name (dry run: Baku seen from a plane, a Dutch
  // 'File op de Nürburgring' = traffic jam seen in a car mirror). A real venue photo names a venue part.
  if (!contextInTitle && /(aerial view of|view of|skyline|cityscape|downtown|panorama of)/i.test(title)) return no('city/landscape view, not the venue');
  if (/(\bfile op\b|\bstau\b|traffic|queue|\bjam\b|mirror|spiegel|rétroviseur|retrovisor)/i.test(title)) return no('traffic scene');
  if (/(hotel|farmhouse|restaurant|\bchurch\b|cathedral|\bcastle\b|village|hospital|school|\bmarket\b|\bstation\b|airport terminal|\bmap\b|\bflag\b|funkturm|\btower\b(?!.*control))/i.test(title)) {
    return no('not the venue (building/place)');
  }

  let score = sourceBase(ctx.source) + 25;
  if (/(aerial|a[eé]re[ao]|luftbild|vue a[eé]rienne|veduta|overview|panoram|from above|bird|drone|skyline)/i.test(title)) score += 20;
  else if (/(grandstand|main straight|start[- ]finish|pit lane|pit building|paddock|infield|control tower|tribuna|tribune|hairpin|chicane|\bturn \d|nordschleife)/i.test(title)) score += 10;
  if (/\b(circuit|track|autodrom\w*|speedway|raceway)\b/i.test(title)) score += 6;
  if (CAR_DESIGNATION.test(title) || /(shakedown|helmet|portrait|driver|pit stop|podium|trophy|cockpit|steering|tyre|tire|wheel|livery|fan zone|fanzone|race start|\bstart of\b|lap \d|qualifying|practice)/i.test(title)) {
    score -= 45;
  }
  // Event/action photos show cars and crowds, not the place (WEC/IMSA/ETCR rounds, safety car…).
  if (/(\brace\b|\brd\d|\bround\b|championship|challenge|clubsport|\bseries\b|\bcup\b|\bwec\b|\belms\b|\bimsa\b|\betcr\b|\bdtm\b|\bbtcc\b|safety car|winner|prototype|daytona)/i.test(title)) score -= 30;
  // Teams / drivers named in the title mean it is a racing-action photo.
  if (/(ferrari|mclaren|mercedes|red bull|williams|lotus|brabham|tyrrell|renault|alpine|sauber|haas|benetton|\bgp\b|grand prix \d{4}|\b(19|20)\d{2} .*grand prix)/i.test(title)) score -= 25;
  if (file.width >= 2400) score += 6;
  if (file.width >= 4000) score += 3;
  return { ok: true, score };
}

/** Pick the best candidate that cleared its type's MIN_SCORE. */
export function pickBest(candidates: Candidate[], type: MediaEntityType): Candidate | null {
  const eligible = candidates.filter((c) => c.score >= MIN_SCORE[type]);
  if (eligible.length === 0) return null;
  return eligible.sort((a, b) => b.score - a.score)[0] ?? null;
}
