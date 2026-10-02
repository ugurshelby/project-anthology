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

/** "Australian Grand Prix" -> "Avustralya Grand Prix" in Turkish; English is left as is. */
export function raceName(name: string | null | undefined, locale: string | null | undefined): string {
  if (!name) return '';
  if (asLocale(locale) !== 'tr') return name;
  const m = name.match(/^(.*?)\s+Grand Prix$/i);
  if (!m) return name;
  const key = m[1].trim().toLowerCase();
  const tr = GP_TR[key];
  return tr ? `${tr} Grand Prix` : name;
}
