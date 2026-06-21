import Image from 'next/image';
import { driverIconSrc } from '@/lib/assets/f1-icons';
import { resolveTeamUiColor } from '@/config/team-colors';

/** Initials from a driver's display name, e.g. "Lewis Hamilton" → "LH". */
function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '—';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

/**
 * Driver avatar with a graceful fallback. When a portrait SVG exists it's shown;
 * otherwise a monogram (initials over a faint team-colour wash) — never an empty
 * circle (design.md §6: no blank spaces; ui-ux empty-state guidance).
 */
export function DriverAvatar({
  driverName,
  driverCode,
  driverId,
  constructorName,
  season,
  size = 64,
  className = '',
}: {
  driverName: string;
  driverCode?: string;
  driverId?: string;
  constructorName?: string;
  season: number;
  size?: number;
  className?: string;
}) {
  const portrait = driverIconSrc(driverCode, driverId ?? driverName, season);
  const color = resolveTeamUiColor(undefined, constructorName);

  return (
    <span
      className={['relative shrink-0 overflow-hidden rounded-full bg-surface-raised', className].join(' ')}
      style={{ width: size, height: size }}
    >
      {portrait ? (
        <Image src={portrait} alt="" fill sizes={`${size}px`} className="object-cover object-top" />
      ) : (
        <span
          className="flex h-full w-full items-center justify-center font-condensed font-700 uppercase text-text-hi"
          style={{
            fontFamily: 'var(--font-condensed)',
            fontSize: size * 0.4,
            background: `linear-gradient(135deg, ${color}22, transparent 70%)`,
          }}
        >
          {initials(driverName)}
        </span>
      )}
    </span>
  );
}
