/**
 * Curated media registry — the ONLY place where files are named by hand.
 *
 * Everything else is discovered automatically (see docs/reference/media-sistemi.md).
 * Curated entries exist for things automation cannot judge well:
 *   - ICONIC_CARS: season-independent hero cars for the "iconic cars" pages.
 *   - LOGO_OVERRIDES: team logos whose Wikidata P154 is empty and whose Commons
 *     search is ambiguous (big, long-lived teams).
 *   - EXTRA_CIRCUITS: historic/iconic circuits outside the seasons the sync discovers.
 *
 * Rules for adding a file: it must be a Commons file (title as shown on its
 * file page) with a license the gate accepts (CC BY, CC BY-SA, CC0, public
 * domain). The sync still re-verifies license, format and size on every run;
 * a curated file that fails is skipped and the entity falls back to the
 * automatic search, then to the placeholder. `files` are tried in order.
 */

export interface IconicCar {
  /** URL-safe slug → entity key `iconic:<slug>`. */
  slug: string;
  name: string;
  /** Jolpica constructorId of the team (for linking to the team page). */
  constructorId: string;
  season: number;
  /** Ordered Commons file titles (with or without the `File:` prefix). */
  files: string[];
  /** Fallback Commons search used only when no listed file is usable. */
  query?: string;
}

export interface LogoOverride {
  /** Jolpica constructorId. */
  constructorId: string;
  files: string[];
  /** Extra Commons search phrases (e.g. the team's current official name). */
  queries?: string[];
}

export interface ExtraCircuit {
  /** Jolpica circuitId — must equal the id used in site URLs. Name, locality and Wikipedia link come from Jolpica. */
  circuitId: string;
  /** Optional hand-picked Commons files, tried first. */
  files?: string[];
}

/**
 * Iconic cars (owner request 2026-10-06: the "iconic cars" pages need a photo for each).
 * Each entry lists a primary file and backups; every file was checked on Commons for license
 * (CC BY / CC BY-SA / CC0 / PD) and resolution. NOTE: "Mercedes v14" in the request is
 * ambiguous — both the 2014 W05 (hybrid-era start) and the 2023 W14 are included; drop one if unwanted.
 */
/**
 * Circuit ids that differ between Jolpica (site's live pages) and F1DB (archive pages). Hyphen/underscore
 * variants are generated automatically; list only the genuinely different ones. Unverified entries are
 * harmless (an alias that never matches costs nothing) — add more as mismatches are found.
 */
export const CIRCUIT_ALIASES: Record<string, string[]> = {
  spa: ['spa-francorchamps'],
  monaco: ['monte-carlo'],
  villeneuve: ['montreal'],
  rodriguez: ['mexico-city'],
  vegas: ['las-vegas'],
  losail: ['lusail'],
  americas: ['austin', 'circuit-of-the-americas'],
  red_bull_ring: ['spielberg', 'a1-ring'],
  yeongam: ['korean-international-circuit'],
  nurburgring: ['nurburgring-gp'],
  hockenheimring: ['hockenheim'],
};

export const ICONIC_CARS: IconicCar[] = [
  {
    slug: 'ferrari-f2004', name: 'Ferrari F2004', constructorId: 'ferrari', season: 2004,
    files: ['Michael Schumacher Ferrari 2004.jpg', 'Fale F1 Monza 2004 132.jpg'],
    query: 'Ferrari F2004',
  },
  {
    slug: 'mclaren-mp4-4', name: 'McLaren MP4/4', constructorId: 'mclaren', season: 1988,
    files: ['1988 McLaren MP4-4 1.jpg', 'McLaren MP4-4 at Goodwood 2014 001.jpg', 'McLaren MP4-4 (1988).jpg'],
    query: 'McLaren MP4-4 1988',
  },
  {
    slug: 'mclaren-m23', name: 'McLaren M23', constructorId: 'mclaren', season: 1976,
    files: ['James Hunt - McLaren M23 (6707990279).jpg', "James Hunt's 1976 World Championship Winning McLaren M23 (6838108365).jpg"],
  },
  {
    slug: 'mclaren-mp4-13', name: 'McLaren MP4/13', constructorId: 'mclaren', season: 1998,
    files: ['Mika Hakkinen 2008 Stars and Cars McLaren MP4-13.jpg', 'McLaren MP4-13 at Goodwood 2012 (4).jpg'],
  },
  {
    slug: 'red-bull-rb19', name: 'Red Bull RB19', constructorId: 'red_bull', season: 2023,
    files: ['FIA F1 Austria 2023 Nr. 1 (1).jpg'],
    query: 'Red Bull RB19 Verstappen 2023',
  },
  {
    slug: 'mercedes-w05', name: 'Mercedes F1 W05 Hybrid', constructorId: 'mercedes', season: 2014,
    files: ['Mercedes F1 W05 Melbourne.jpg', "Mercedes-AMG Petronas F1 W05 Hybrid - Mondial de l'Automobile de Paris 2014 - 001.jpg"],
  },
  {
    slug: 'mercedes-w11', name: 'Mercedes F1 W11 EQ Performance', constructorId: 'mercedes', season: 2020,
    files: ['Lewis Hamilton-Mercedes W11 (1).jpg', '2020 Formula One tests Barcelona, Mercedes-AMG F1 W11 EQ Performance, Hamilton.jpg'],
  },
  {
    slug: 'mercedes-w14', name: 'Mercedes W14 E Performance', constructorId: 'mercedes', season: 2023,
    files: ['FIA F1 Austria 2023 Nr. 44 (1).jpg', 'FIA F1 Austria 2023 Nr. 44 (2).jpg'],
  },
  {
    slug: 'mercedes-w196', name: 'Mercedes-Benz W196', constructorId: 'mercedes', season: 1954,
    files: ['Großer Preis von Europa -1954 Nürburgring, Juan Manuel Fangio, Mercedes (3)x.JPG', 'GPItaliaFangioAscari1954.jpg'],
  },
  {
    slug: 'alfa-romeo-158', name: 'Alfa Romeo 158 Alfetta', constructorId: 'alfa', season: 1950,
    files: ['1950 Alfa Romeo 158 (54834195044).jpg', 'Alfa Romeo Alfetta 159.jpg'],
  },
  {
    slug: 'ferrari-156-sharknose', name: 'Ferrari 156 "Sharknose"', constructorId: 'ferrari', season: 1961,
    files: ['Ferrari 156 "Sharknose" at Goodwood 2014 001.jpg', 'Ferrari F1 156 Sharknose (52760743886).jpg'],
  },
  {
    slug: 'ferrari-312t', name: 'Ferrari 312T', constructorId: 'ferrari', season: 1975,
    files: ['1975 Italian GP - Niki Lauda - Ferrari 312T.jpg'],
  },
  {
    slug: 'ferrari-640', name: 'Ferrari 640', constructorId: 'ferrari', season: 1989,
    files: ['Nigel Mansell 1989 Belgian GP 1.jpg', 'Nigel Mansell 1989 Belgian GP 3.jpg'],
  },
  {
    slug: 'ferrari-f1-75', name: 'Ferrari F1-75', constructorId: 'ferrari', season: 2022,
    files: ['Ferrari F1-75 in Melbourne.jpg'],
  },
  {
    slug: 'lotus-49', name: 'Lotus 49', constructorId: 'lotus_f1', season: 1968,
    files: ['1968 Lotus 49 Ford (49380121867).jpg'],
  },
  {
    slug: 'lotus-79', name: 'Lotus 79', constructorId: 'lotus_f1', season: 1978,
    files: ['Mario Andretti 1978 World Championship Winning Lotus 79 (49379922591).jpg', 'Lotus 79 (Mario Andretti) 001.jpg'],
  },
  {
    slug: 'brabham-bt46b', name: 'Brabham BT46B "Fan Car"', constructorId: 'brabham', season: 1978,
    files: ['1978 Brabham-Alfa Romeo BT46B Fan Car.jpg', '1978 Brabham-Alfa Romeo BT46B Fan Car mod.jpg'],
  },
  {
    slug: 'tyrrell-p34', name: 'Tyrrell P34 "Six-Wheeler"', constructorId: 'tyrrell', season: 1976,
    files: ['Tyrrell P34 six wheel F1 pic1.JPG', 'Tyrrell P34 six wheel F1 pic2.JPG', 'Tyrrell P34 at Goodwood 2012.jpg'],
  },
  {
    slug: 'williams-fw14b', name: 'Williams FW14B', constructorId: 'williams', season: 1992,
    files: ["Nigel Mansell's 1992 Williams FW14B (24246600790).jpg", 'Williams FW14B-Renault 1992 Nigel Mansell.jpg'],
  },
  {
    slug: 'williams-fw16', name: 'Williams FW16', constructorId: 'williams', season: 1994,
    files: ['1994Williams-RenaultFW16B.jpg', 'Williams FW16 British GP 1994.jpg'],
  },
  {
    slug: 'benetton-b194', name: 'Benetton B194', constructorId: 'benetton', season: 1994,
    files: ['2006FOS 1994BenettonB194.jpg', 'Benetton B194 approaches Woodcote at the 1994 British Grand Prix (32418703451).jpg'],
  },
  {
    slug: 'renault-r25', name: 'Renault R25', constructorId: 'renault', season: 2005,
    files: ['Renault R25 (2005) Fernando Alonso.jpg'],
  },
  {
    slug: 'brawn-bgp-001', name: 'Brawn BGP 001', constructorId: 'brawn', season: 2009,
    files: ['Barrichello Barcelona Brawn BGP 001.jpg', 'Brawn BGP 001 Barcelona 3.jpg'],
  },
  {
    slug: 'vanwall-vw5', name: 'Vanwall VW5', constructorId: 'vanwall', season: 1958,
    files: ['Vanwall VW5 Donington.jpg'],
  },
];

export const LOGO_OVERRIDES: LogoOverride[] = [
  // Commons hosts no free Scuderia Ferrari logo as of 2026-10 (checked by direct title and search);
  // these queries keep looking for one in case a free version appears. Until then Ferrari uses the placeholder.
  { constructorId: 'ferrari', files: [], queries: ['Scuderia Ferrari shield emblem', 'Cavallino Rampante Scuderia Ferrari'] },
  { constructorId: 'red_bull', files: [], queries: ['Red Bull Racing logo', 'Oracle Red Bull Racing'] },
  { constructorId: 'rb', files: [], queries: ['Racing Bulls logo', 'Visa Cash App RB logo', 'Scuderia AlphaTauri logo'] },
];

/** Circuits outside the 2018+ seasons that the site tells stories about (e.g. Lauda's 1976 Nürburgring crash). */
export const EXTRA_CIRCUITS: ExtraCircuit[] = [
  'nurburgring', 'dijon', 'jerez', 'donington', 'estoril', 'adelaide', 'kyalami', 'hockenheimring',
  'magny_cours', 'brands_hatch', 'sepang', 'istanbul', 'indianapolis', 'jarama', 'zolder', 'ricard',
  'fuji', 'yeongam', 'anderstorp', 'watkins_glen', 'zeltweg', 'aintree', 'long_beach', 'avus',
].map((circuitId) => ({ circuitId }));
