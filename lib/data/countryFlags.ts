/**
 * F1 calendar country name → ISO 3166-1 alpha-2 code. The flag itself is an
 * SVG (`components/ui/CountryFlag.tsx`, country-flag-icons, MIT): emoji flags
 * fall back to letter pairs ("AU", "US") on Windows (2026-10 site audit #24).
 */
const COUNTRY_CODE: Record<string, string> = {
  Australia: 'AU',
  China: 'CN',
  Japan: 'JP',
  Bahrain: 'BH',
  'Saudi Arabia': 'SA',
  USA: 'US',
  'United States': 'US',
  Italy: 'IT',
  Monaco: 'MC',
  Spain: 'ES',
  Canada: 'CA',
  Austria: 'AT',
  UK: 'GB',
  'United Kingdom': 'GB',
  Belgium: 'BE',
  Hungary: 'HU',
  Netherlands: 'NL',
  Azerbaijan: 'AZ',
  Singapore: 'SG',
  Mexico: 'MX',
  Brazil: 'BR',
  Qatar: 'QA',
  UAE: 'AE',
  'United Arab Emirates': 'AE',
  Portugal: 'PT',
  France: 'FR',
  Germany: 'DE',
  Russia: 'RU',
  Turkey: 'TR',
  India: 'IN',
  'South Korea': 'KR',
  Korea: 'KR',
  Malaysia: 'MY',
};

/** ISO code for a circuit's country, or null if unknown (no flag is drawn then). */
export function countryCode(country: string | undefined | null): string | null {
  if (!country) return null;
  return COUNTRY_CODE[country] ?? null;
}
