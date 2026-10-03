import countriesJson from '@/data/history/countries.json';

/**
 * Locale-aware formatting for dates, country names and Grand Prix names.
 * Upstream data (Ergast/Jolpica/F1DB) is English; these helpers show it in
 * the visitor's language without touching the stored data.
 */

export type AppLocale = 'en' | 'tr';

export function asLocale(value: string | null | undefined): AppLocale {
  return value === 'tr' ? 'tr' : 'en';
}

/** BCP 47 tag used for Intl formatting. */
export function intlTag(locale: string | null | undefined): string {
  return asLocale(locale) === 'tr' ? 'tr-TR' : 'en-GB';
}

export function formatDate(
  value: string | number | Date,
  locale: string | null | undefined,
  options: Intl.DateTimeFormatOptions,
): string {
  const d = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(d.getTime())) return '';
  return new Intl.DateTimeFormat(intlTag(locale), options).format(d);
}

/* ------------------------------------------------------------------ */
/* countries                                                           */
/* ------------------------------------------------------------------ */

const COUNTRIES = countriesJson as unknown as Record<string, { n: string; a: string }>;

const ALIASES: Record<string, string> = {
  uk: 'GB',
  'great britain': 'GB',
  england: 'GB',
  usa: 'US',
  'united states': 'US',
  uae: 'AE',
  korea: 'KR',
  russia: 'RU',
  'czech republic': 'CZ',
  'monaco': 'MC',
};

let byName: Map<string, string> | null = null;

function lookup(): Map<string, string> {
  if (byName) return byName;
  byName = new Map();
  for (const [id, c] of Object.entries(COUNTRIES)) {
    byName.set(id, c.a);
    byName.set(c.n.toLowerCase(), c.a);
  }
  for (const [k, v] of Object.entries(ALIASES)) byName.set(k, v);
  return byName;
}

const displayNames = new Map<string, Intl.DisplayNames>();

/** Country name in the visitor's language. Unknown input is returned unchanged. */
export function countryName(input: string | null | undefined, locale: string | null | undefined): string {
  if (!input) return '';
  const code = lookup().get(input.trim().toLowerCase());
  if (!code) return input;
  const tag = intlTag(locale);
  let dn = displayNames.get(tag);
  if (!dn) {
    dn = new Intl.DisplayNames([tag], { type: 'region' });
    displayNames.set(tag, dn);
  }
  try {
    return dn.of(code) ?? input;
  } catch {
    return input;
  }
}

/* ------------------------------------------------------------------ */
/* Grand Prix names                                                    */
/* ------------------------------------------------------------------ */

const GP_TR: Record<string, string> = {
  australian: 'Avustralya',
  chinese: 'Çin',
  japanese: 'Japonya',
  bahrain: 'Bahreyn',
  'saudi arabian': 'Suudi Arabistan',
  miami: 'Miami',
  'emilia romagna': 'Emilia Romagna',
  monaco: 'Monako',
  spanish: 'İspanya',
  canadian: 'Kanada',
  austrian: 'Avusturya',
  british: 'Britanya',
  belgian: 'Belçika',
  hungarian: 'Macaristan',
  dutch: 'Hollanda',
  italian: 'İtalya',
  azerbaijan: 'Azerbaycan',
  singapore: 'Singapur',
  'united states': 'Amerika Birleşik Devletleri',
  'mexico city': 'Meksika Şehri',
  mexican: 'Meksika',
  'são paulo': 'São Paulo',
  'sao paulo': 'São Paulo',
  brazilian: 'Brezilya',
  'las vegas': 'Las Vegas',
  qatar: 'Katar',
  'abu dhabi': 'Abu Dabi',
  french: 'Fransa',
  german: 'Almanya',
  portuguese: 'Portekiz',
  turkish: 'Türkiye',
  russian: 'Rusya',
  styrian: 'Steiermark',
  'tuscan': 'Toskana',
  eifel: 'Eifel',
  sakhir: 'Sakhir',
  european: 'Avrupa',
  pacific: 'Pasifik',
  'san marino': 'San Marino',
  argentine: 'Arjantin',
  swiss: 'İsviçre',
  'south african': 'Güney Afrika',
  malaysian: 'Malezya',
  korean: 'Kore',
  indian: 'Hindistan',
  swedish: 'İsveç',
  luxembourg: 'Lüksemburg',
  moroccan: 'Fas',
  madrid: 'Madrid',
  'indianapolis 500': 'Indianapolis 500',
  '70th anniversary': '70. Yıl',
  'caesars palace': 'Caesars Palace',
  dallas: 'Dallas',
  detroit: 'Detroit',
  pescara: 'Pescara',
  'united states east': 'ABD Doğu',
  'united states west': 'ABD Batı',
  'long beach': 'Long Beach',
  'south africa': 'Güney Afrika',
};

const CIRCUIT_NAME_TR: Record<string, string> = {
  'sepang international circuit': 'Sepang Uluslararası Pisti',
  'bahrain international circuit': 'Bahreyn Uluslararası Pisti',
  'shanghai international circuit': 'Şanghay Uluslararası Pisti',
  'jeddah corniche circuit': 'Cidde Cadde Pisti',
  'albert park circuit': 'Albert Park Pisti',
  'miami international autodrome': 'Miami Uluslararası Pisti',
  'circuit de monaco': 'Monako Cadde Pisti',
  'circuit gilles-villeneuve': 'Gilles Villeneuve Pisti',
  'circuit gilles villeneuve': 'Gilles Villeneuve Pisti',
  'circuit de barcelona-catalunya': 'Barselona-Katalunya Pisti',
  'red bull ring': 'Red Bull Ring',
  'silverstone circuit': 'Silverstone Pisti',
  'hungaroring': 'Hungaroring',
  'circuit de spa-francorchamps': 'Spa-Francorchamps Pisti',
  'circuit zandvoort': 'Zandvoort Pisti',
  'autodromo nazionale monza': 'Monza Pisti',
  'baku city circuit': 'Bakü Şehir Pisti',
  'marina bay street circuit': 'Marina Bay Cadde Pisti',
  'circuit of the americas': 'Amerika Pisti',
  'autódromo hermanos rodríguez': 'Hermanos Rodríguez Pisti',
  'autodromo hermanos rodriguez': 'Hermanos Rodríguez Pisti',
  'autódromo josé carlos pace': 'Interlagos Pisti',
  'autodromo jose carlos pace': 'Interlagos Pisti',
  'las vegas strip circuit': 'Las Vegas Strip Pisti',
  'las vegas street circuit': 'Las Vegas Strip Pisti',
  'losail international circuit': 'Luseyl Uluslararası Pisti',
  'yas marina circuit': 'Yas Marina Pisti',
  'circuito de madring': 'Madring Pisti',
};

/**
 * Normalizes and localizes Grand Prix names.
 * Fixes data contradictions like "Bahrain Grand Prix in Malaysia" -> "Malaysian Grand Prix" (EN) / "Malezya Grand Prix" (TR).
 */
export function raceName(name: string | null | undefined, locale: string | null | undefined): string {
  if (!name) return '';
  let cleanName = name.trim();

  // Normalize data contradiction or "X Grand Prix in Y" patterns
  if (/bahrain\s+grand\s+prix\s+in\s+malaysia/i.test(cleanName)) {
    cleanName = 'Malaysian Grand Prix';
  } else {
    const inMatch = cleanName.match(/^(.*?)\s+Grand Prix\s+in\s+(.*?)$/i);
    if (inMatch) {
      const country = inMatch[2].trim().toLowerCase();
      if (country === 'malaysia') {
        cleanName = 'Malaysian Grand Prix';
      }
    }
  }

  if (asLocale(locale) !== 'tr') return cleanName;

  const m = cleanName.match(/^(.*?)\s+Grand Prix$/i);
  if (!m) return cleanName;
  const key = m[1].trim().toLowerCase();
  const tr = GP_TR[key];
  return tr ? `${tr} Grand Prix` : cleanName;
}

/** Circuit name in visitor's locale ("Sepang International Circuit" -> "Sepang Uluslararası Pisti" in Turkish). */
export function circuitName(name: string | null | undefined, locale: string | null | undefined): string {
  if (!name) return '';
  const trimmed = name.trim();
  if (asLocale(locale) !== 'tr') return trimmed;

  const key = trimmed.toLowerCase();
  const direct = CIRCUIT_NAME_TR[key];
  if (direct) return direct;

  return trimmed
    .replace(/\s+International\s+Circuit$/i, ' Uluslararası Pisti')
    .replace(/\s+Street\s+Circuit$/i, ' Cadde Pisti')
    .replace(/\s+City\s+Circuit$/i, ' Şehir Pisti')
    .replace(/\s+Circuit$/i, ' Pisti')
    .replace(/^Circuit\s+(?:de\s+)?/i, '')
    .replace(/\s+(?:Autodrome|Autódromo|Autodromo)$/i, ' Pisti')
    .replace(/\s+Racing\s+Course$/i, ' Pisti');
}

