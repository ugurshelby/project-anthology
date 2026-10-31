import { PlaceholderArt } from './PlaceholderArt';

interface CircuitPlaceholderProps {
  seed: string;
  name?: string;
  priority?: boolean;
  className?: string;
}

/** Circuit without a licensed photo: the shared circuit artwork, captioned with the circuit name. */
export function CircuitPlaceholder({ seed, name, priority = false, className = 'h-full w-full' }: CircuitPlaceholderProps) {
  return (
    <PlaceholderArt
      kind="circuit"
      ariaLabel={name ? `${name} circuit layout schematic` : 'Formula 1 circuit layout schematic'}
      caption={(name || seed.replace(/[-_]/g, ' ')).toUpperCase()}
      priority={priority}
      className={className}
    />
  );
}
