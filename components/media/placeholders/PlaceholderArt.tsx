import Image from 'next/image';

export type PlaceholderKind = 'driver' | 'car' | 'team' | 'circuit';

/**
 * Owner-supplied artwork (Google Flow, approved for this use 2026-10-31; sources in assets/placeholders/) shown only
 * where no licensed photo exists. One image per kind; the large width is served everywhere (at most 11 KB, so a
 * srcset would save almost nothing). The small widths stay in public/placeholders for a later srcset.
 */
const ART: Record<PlaceholderKind, { widths: [number, number]; position: string }> = {
  driver: { widths: [448, 896], position: '50% 30%' },
  car: { widths: [640, 1280], position: '50% 50%' },
  team: { widths: [384, 768], position: '50% 50%' },
  circuit: { widths: [688, 1376], position: '50% 50%' },
};

/** Car artwork per era (owner-supplied 2026-10-31, master-plan 8.15): first season of each era. */
export const CAR_ERAS = [1950, 1961, 1968, 1983, 1994, 2009] as const;
export type CarEra = (typeof CAR_ERAS)[number];

/** The era artwork for a season; null from 2018 (halo cars) or without a season: the default car artwork. */
export function carEraFor(season: number | null | undefined): CarEra | null {
  if (season == null || !Number.isFinite(season) || season >= 2018) return null;
  let era: CarEra | null = null;
  for (const start of CAR_ERAS) if (season >= start) era = start;
  return era ?? CAR_ERAS[0];
}

export function placeholderSrc(kind: PlaceholderKind, width: number, variant?: string | number | null): string {
  return `/placeholders/${kind}${variant != null ? `-${variant}` : ''}-${width}.webp`;
}

/**
 * Shared surface of the four media placeholders: the kind's artwork filling the slot, and an optional small
 * caption (driver code, team, car or circuit name) so neighbouring placeholders stay distinguishable.
 */
export function PlaceholderArt({
  kind,
  ariaLabel,
  caption,
  fit = 'cover',
  variant = null,
  priority = false,
  className = 'h-full w-full',
}: {
  kind: PlaceholderKind;
  ariaLabel: string;
  caption?: string;
  fit?: 'cover' | 'contain';
  /** Alternative artwork of the same kind, e.g. a car era (`car-1983-1280.webp`). */
  variant?: string | number | null;
  /** Stands in for a priority image (the LCP candidate): load it eagerly too. */
  priority?: boolean;
  className?: string;
}) {
  const { widths, position } = ART[kind];
  const large = widths[1];
  return (
    <div role="img" aria-label={ariaLabel} className={`relative overflow-hidden bg-[#252a31] ${className}`}>
      <Image
        src={placeholderSrc(kind, large, variant)}
        alt=""
        aria-hidden
        fill
        unoptimized
        {...(priority ? { fetchPriority: 'high' as const, loading: 'eager' as const } : {})}
        sizes="(max-width: 768px) 100vw, 50vw"
        className={fit === 'contain' ? 'object-contain' : 'object-cover'}
        style={{ objectPosition: position }}
      />
      {caption ? (
        <span className="absolute bottom-2 left-3 z-10 max-w-[85%] truncate font-mono text-[11px] uppercase tracking-wider text-white/70">
          {caption}
        </span>
      ) : null}
    </div>
  );
}
