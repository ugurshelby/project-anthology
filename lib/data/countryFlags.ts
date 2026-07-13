/** F1 calendar country name → emoji flag. Small closed set (~24 entries), no i18n library needed. */
const COUNTRY_FLAG: Record<string, string> = {
  Australia: '🇦🇺',
  China: '🇨🇳',
  Japan: '🇯🇵',
  Bahrain: '🇧🇭',
  'Saudi Arabia': '🇸🇦',
  USA: '🇺🇸',
  'United States': '🇺🇸',
  Italy: '🇮🇹',
  Monaco: '🇲🇨',
  Spain: '🇪🇸',
  Canada: '🇨🇦',
  Austria: '🇦🇹',
  UK: '🇬🇧',
  'United Kingdom': '🇬🇧',
  Belgium: '🇧🇪',
  Hungary: '🇭🇺',
  Netherlands: '🇳🇱',
  Azerbaijan: '🇦🇿',
  Singapore: '🇸🇬',
  Mexico: '🇲🇽',
  Brazil: '🇧🇷',
  Qatar: '🇶🇦',
  UAE: '🇦🇪',
  'United Arab Emirates': '🇦🇪',
  Portugal: '🇵🇹',
  France: '🇫🇷',
  Germany: '🇩🇪',
  Russia: '🇷🇺',
  Turkey: '🇹🇷',
  India: '🇮🇳',
  'South Korea': '🇰🇷',
  Malaysia: '🇲🇾',
};

/** Returns an emoji flag for a circuit's country, or null if unknown (never a broken/placeholder glyph). */
export function countryFlag(country: string | undefined | null): string | null {
  if (!country) return null;
  return COUNTRY_FLAG[country] ?? null;
}
