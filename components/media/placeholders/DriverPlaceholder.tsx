'use client';

interface DriverPlaceholderProps {
  seed: string;
  name?: string;
  driverNumber?: number | string;
  driverCode?: string;
  teamColor?: string;
  className?: string;
}

/**
 * Section 9 Driver Placeholder:
 * High-end telemetry driver badge with 3-letter FIA code / initials, racing number,
 * team racing accents, and angled aerodynamic speed cuts.
 */
export function DriverPlaceholder({
  seed,
  name,
  driverNumber,
  driverCode,
  teamColor = '#ff1801',
  className = 'h-full w-full',
}: DriverPlaceholderProps) {
  // Derive short 3-letter code
  let mark = driverCode?.trim().toUpperCase();
  if (!mark) {
    if (name) {
      const parts = name.trim().split(/\s+/).filter(Boolean);
      if (parts.length >= 2) {
        mark = (parts[0][0] + parts[parts.length - 1].slice(0, 2)).toUpperCase();
      } else {
        mark = name.slice(0, 3).toUpperCase();
      }
    } else {
      mark = seed.replace(/[-_]/g, '').slice(0, 3).toUpperCase();
    }
  }

  // Derive subtle visual variance hash
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = (hash << 5) - hash + seed.charCodeAt(i);
    hash |= 0;
  }
  const patternIndex = Math.abs(hash) % 3;

  return (
    <div
      role="img"
      aria-label={`${name || seed} driver badge`}
      className={`relative flex items-center justify-center overflow-hidden bg-[#0d1219] ${className}`}
      style={{
        background: `radial-gradient(circle at 50% 40%, color-mix(in srgb, ${teamColor} 20%, #0d1219), #070a0e 85%)`,
      }}
    >
      {/* Dynamic speed pattern overlay */}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-20"
        style={{
          backgroundImage:
            patternIndex === 0
              ? `repeating-linear-gradient(135deg, ${teamColor} 0px, ${teamColor} 1px, transparent 1px, transparent 12px)`
              : patternIndex === 1
              ? `repeating-linear-gradient(90deg, rgba(255,255,255,0.06) 0px, rgba(255,255,255,0.06) 2px, transparent 2px, transparent 8px)`
              : `radial-gradient(circle at 80% 20%, ${teamColor} 0%, transparent 60%)`,
        }}
      />

      {/* Crosshair border markings */}
      <span aria-hidden="true" className="pointer-events-none absolute top-2 left-2 h-2.5 w-2.5 border-t border-l border-white/20" />
      <span aria-hidden="true" className="pointer-events-none absolute top-2 right-2 h-2.5 w-2.5 border-t border-r border-white/20" />
      <span aria-hidden="true" className="pointer-events-none absolute bottom-2 left-2 h-2.5 w-2.5 border-b border-l border-white/20" />
      <span aria-hidden="true" className="pointer-events-none absolute bottom-2 right-2 h-2.5 w-2.5 border-b border-r border-white/20" />

      {/* Main SVG Badge */}
      <svg
        viewBox="0 0 200 240"
        className="relative z-10 h-full w-full p-4 transition-transform duration-300 hover:scale-[1.03]"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id={`driver-accent-${seed}`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={teamColor} />
            <stop offset="100%" stopColor="#ffffff" stopOpacity="0.8" />
          </linearGradient>
        </defs>

        {/* Top Header Tag */}
        <text x="18" y="24" fill="rgba(255,255,255,0.4)" fontSize="7" fontFamily="monospace" letterSpacing="0.1em">
          FIA PILOT // ROSTER
        </text>

        {/* Racing Number Stamp if available */}
        {driverNumber ? (
          <text
            x="182"
            y="32"
            textAnchor="end"
            fill={teamColor}
            fontFamily="var(--font-condensed), sans-serif"
            fontWeight="900"
            fontSize="26"
            fontStyle="italic"
            opacity="0.85"
          >
            #{driverNumber}
          </text>
        ) : null}

        {/* Helmet / Cockpit Silhouette Outline */}
        <path
          d="M 65 105 C 65 65, 135 65, 135 105 C 135 125, 128 140, 100 142 C 72 140, 65 125, 65 105 Z"
          fill="none"
          stroke="rgba(255,255,255,0.18)"
          strokeWidth="2"
        />
        {/* Visor Cut */}
        <path
          d="M 78 98 L 122 98 C 124 108, 116 114, 100 114 C 84 114, 76 108, 78 98 Z"
          fill={teamColor}
          opacity="0.6"
        />

        {/* Main 3-Letter FIA Code */}
        <text
          x="100"
          y="185"
          textAnchor="middle"
          fill="#ffffff"
          fontFamily="var(--font-condensed), sans-serif"
          fontWeight="900"
          fontSize="40"
          letterSpacing="0.08em"
          fontStyle="italic"
        >
          {mark}
        </text>

        {/* Racing Color Underline Slash */}
        <line
          x1="45"
          y1="198"
          x2="155"
          y2="198"
          stroke={`url(#driver-accent-${seed})`}
          strokeWidth="3.5"
          strokeLinecap="round"
        />

        {/* Full Name Footer if available */}
        {name ? (
          <text
            x="100"
            y="218"
            textAnchor="middle"
            fill="rgba(255,255,255,0.6)"
            fontFamily="var(--font-condensed), sans-serif"
            fontWeight="600"
            fontSize="10"
            letterSpacing="0.12em"
          >
            {name.toUpperCase()}
          </text>
        ) : null}
      </svg>
    </div>
  );
}
