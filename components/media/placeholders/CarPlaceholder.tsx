import { F1CarSilhouette, carEraForSeason } from '@/components/media/F1CarSilhouette';

interface CarPlaceholderProps {
  seed: string;
  name?: string;
  /** Main livery colour. */
  teamColor?: string;
  /** Second livery colour; derived from the main colour's lightness when absent. */
  accentColor?: string;
  season?: number | string;
  className?: string;
}

/** Relative luminance of a #rgb / #rrggbb colour (0 = black, 1 = white). */
function luminance(hex: string): number {
  const raw = hex.replace('#', '');
  const full = raw.length === 3 ? raw.replace(/./g, (c) => c + c) : raw.slice(0, 6);
  const n = Number.parseInt(full, 16);
  if (!Number.isFinite(n)) return 0;
  const [r, g, b] = [(n >> 16) & 255, (n >> 8) & 255, n & 255].map((v) => {
    const c = v / 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function seasonFrom(seed: string, season: number | string | undefined): number | null {
  const explicit = Number(season);
  if (season !== undefined && Number.isFinite(explicit)) return explicit;
  const fromSeed = /:(\d{4})$/.exec(seed);
  return fromSeed ? Number(fromSeed[1]) : null;
}

/**
 * Car placeholder, shown only when no licensed photo exists for the car:
 * a minimal two-tone side profile in the team's livery colours, drawn for the
 * car's era, with the name and season as a quiet caption.
 */
export function CarPlaceholder({
  seed,
  name,
  teamColor = '#ff1801',
  accentColor,
  season,
  className = 'h-full w-full',
}: CarPlaceholderProps) {
  const isIconic = seed.startsWith('iconic:');
  const rawTitle = name || (isIconic ? seed.replace('iconic:', '').replace(/-/g, ' ') : seed.replace(/:\d{4}$/, '').replace(/[-_:]/g, ' '));
  const title = rawTitle.toUpperCase();
  const year = seasonFrom(seed, season);
  const accent = accentColor ?? (luminance(teamColor) > 0.45 ? '#15171a' : '#f4f4f4');
  const label = year ? `${title} · ${year}` : title;

  return (
    <div
      role="img"
      aria-label={label}
      className={`@container relative flex items-center justify-center overflow-hidden bg-surface ${className}`}
      style={{
        background: `radial-gradient(ellipse 70% 60% at 50% 62%, color-mix(in srgb, ${teamColor} 14%, var(--surface)), var(--surface) 75%)`,
      }}
    >
      <F1CarSilhouette
        body={teamColor}
        accent={accent}
        era={carEraForSeason(year)}
        className="relative h-auto max-h-full w-[88%]"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-3 top-3 hidden items-baseline justify-between gap-3 font-mono text-[10px] uppercase tracking-[0.12em] @min-[260px]:flex"
      >
        <span className="truncate text-text-mid">{title}</span>
        {year ? <span className="shrink-0 tabular-nums text-text-low">{year}</span> : null}
      </div>
    </div>
  );
}
