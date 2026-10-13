import {
  AE, AR, AT, AU, AZ, BE, BH, BR, CA, CN, DE, DK, ES, FI, FR, GB, HU, IN, IT, JP, KR, MC, MX, MY, NL, NZ, PT, QA, RU, SA, SG, TH, TR, US,
  type FlagComponent,
} from 'country-flag-icons/react/3x2';
import { countryCode } from '@/lib/data/countryFlags';

/** Calendar and driver nationality flags (MIT SVG). */
const FLAGS: Record<string, FlagComponent> = {
  AE, AR, AT, AU, AZ, BE, BH, BR, CA, CN, DE, DK, ES, FI, FR, GB, HU, IN, IT, JP, KR, MC, MX, MY, NL, NZ, PT, QA, RU, SA, SG, TH, TR, US,
};

/** Country flag as an SVG (3:2), decorative; renders nothing for an unknown country. */
export function CountryFlag({ country, className = '' }: { country: string | null | undefined; className?: string }) {
  const code = countryCode(country);
  const Svg = code ? FLAGS[code] : undefined;
  if (!Svg) return null;
  return (
    <Svg
      aria-hidden
      focusable="false"
      className={`inline-block h-[0.75em] w-auto shrink-0 rounded-[2px] align-[-0.05em] shadow-[0_0_0_1px_rgba(255,255,255,0.12)] ${className}`.trim()}
    />
  );
}
