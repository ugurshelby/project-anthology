import { PlaceholderArt } from './PlaceholderArt';

interface DriverPlaceholderProps {
  seed: string;
  name?: string;
  driverNumber?: number | string;
  driverCode?: string;
  /** Kept for callers; the artwork carries its own accent. */
  teamColor?: string;
  priority?: boolean;
  className?: string;
}

/**
 * Driver without a licensed photo: the shared driver artwork. No caption: every driver image on the site sits next
 * to the driver's name and number already (a caption collided with the grid bay's own text).
 */
export function DriverPlaceholder({ seed, name, priority = false, className = 'h-full w-full' }: DriverPlaceholderProps) {
  return <PlaceholderArt kind="driver" ariaLabel={`${name || seed} driver badge`} priority={priority} className={className} />;
}
