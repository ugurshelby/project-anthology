import type { MachineryCar } from '@/data/machinery/cars';
import { MediaAssetView } from '@/components/media/MediaAssetView';
import { paletteFor } from '@/lib/history/palette';
import type { MediaResult } from '@/lib/media/read';

/** Two livery colours for a car: the curated era palette, else the car's own pair. */
export function machineryLivery(car: MachineryCar): { body: string; accent: string } {
  const palette = paletteFor(car.constructorId, car.year);
  return palette.curated
    ? { body: palette.secondary, accent: palette.accent }
    : { body: car.accentColor, accent: car.secondaryColor };
}

/**
 * The one visual of an iconic car: its licensed archive photo when the media
 * system has one, otherwise the two-tone livery silhouette. Never both.
 */
export function MachineryVisual({
  car,
  media,
  priority = false,
  showAttribution = true,
  sizes,
  className = '',
}: {
  car: MachineryCar;
  media: MediaResult | null | undefined;
  priority?: boolean;
  showAttribution?: boolean;
  sizes?: string;
  className?: string;
}) {
  const livery = machineryLivery(car);
  return (
    <MediaAssetView
      type="car"
      entityKey={`iconic:${car.id}`}
      initialResult={media}
      alt={car.fullName}
      name={car.fullName}
      teamColor={livery.body}
      teamAccent={livery.accent}
      season={car.year}
      aspectRatio="16/9"
      priority={priority}
      sizes={sizes}
      showAttribution={showAttribution}
      className={`w-full ${className}`}
    />
  );
}
