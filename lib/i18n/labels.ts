import { asLocale } from './format';

/** Session names on the weekend bar. FP1-FP3 are used as is in both languages. */
export function sessionLabel(id: string, fallback: string, locale: string | null | undefined): string {
  if (asLocale(locale) !== 'tr') return fallback;
  if (id === 'qualifying') return 'Sıralama';
  if (id === 'race') return 'Yarış';
  return fallback;
}

const WMO_TR: Record<number, string> = {
  0: 'Açık gökyüzü',
  1: 'Çoğunlukla açık',
  2: 'Parçalı bulutlu',
  3: 'Kapalı',
  45: 'Sisli',
  48: 'Kırağılı sis',
  51: 'Hafif çisenti',
  53: 'Çisenti',
  55: 'Yoğun çisenti',
  56: 'Donan çisenti',
  57: 'Donan çisenti',
  61: 'Hafif yağmur',
  63: 'Yağmurlu',
  65: 'Şiddetli yağmur',
  66: 'Donan yağmur',
  67: 'Donan yağmur',
  71: 'Hafif kar',
  73: 'Karlı',
  75: 'Yoğun kar',
  77: 'Kar taneleri',
  80: 'Sağanak',
  81: 'Sağanak',
  82: 'Şiddetli sağanak',
  85: 'Kar sağanağı',
  86: 'Kar sağanağı',
  95: 'Gök gürültülü fırtına',
  96: 'Dolulu fırtına',
  99: 'Dolulu fırtına',
};

/** Weather description from the stored WMO code, in the visitor's language. */
export function weatherSummary(code: number | null | undefined, english: string, locale: string | null | undefined): string {
  if (asLocale(locale) !== 'tr' || code == null) return english;
  return WMO_TR[code] ?? english;
}
