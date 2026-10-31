import { PlaceholderArt } from './PlaceholderArt';

interface CarPlaceholderProps {
  seed: string;
  name?: string;
  /** Kept for callers; the artwork carries its own accent. */
  teamColor?: string;
  accentColor?: string;
  season?: number | string;
  priority?: boolean;
  className?: string;
}

function seasonFrom(seed: string, season: number | string | undefined): number | null {
  const explicit = Number(season);
  if (season !== undefined && Number.isFinite(explicit)) return explicit;
  const fromSeed = /:(\d{4})$/.exec(seed);
  return fromSeed ? Number(fromSeed[1]) : null;
}

/** Car without a licensed photo: the shared car artwork, captioned with the car or team name and season. */
export function CarPlaceholder({ seed, name, season, priority = false, className = 'h-full w-full' }: CarPlaceholderProps) {
  const isIconic = seed.startsWith('iconic:');
  const rawTitle = name || (isIconic ? seed.replace('iconic:', '').replace(/-/g, ' ') : seed.replace(/:\d{4}$/, '').replace(/[-_:]/g, ' '));
  const title = rawTitle.toUpperCase();
  const year = seasonFrom(seed, season);
  const label = year && !title.includes(String(year)) ? `${title} · ${year}` : title;
  return <PlaceholderArt kind="car" ariaLabel={label} caption={label} priority={priority} className={className} />;
}
