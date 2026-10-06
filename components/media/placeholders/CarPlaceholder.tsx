'use client';

interface CarPlaceholderProps {
  seed: string;
  name?: string;
  teamColor?: string;
  season?: number | string;
  className?: string;
}

/**
 * Section 9 Car Placeholder:
 * F1 single-seater side silhouette with team racing colors and CAD blueprint styling.
 * Supports seed-based wing profiles, airbox styling, and chassis technical markings.
 */
export function CarPlaceholder({
  seed,
  name,
  teamColor = '#ff1801',
  season,
  className = 'h-full w-full',
}: CarPlaceholderProps) {
  const isIconic = seed.startsWith('iconic:');
  const rawTitle = name || (isIconic ? seed.replace('iconic:', '').replace(/-/g, ' ') : seed.replace(/[-_]/g, ' '));
  const title = rawTitle.toUpperCase();

  // Derive slight aerodynamic shape variations based on seed hash
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = (hash << 5) - hash + seed.charCodeAt(i);
    hash |= 0;
  }
  const aeroProfile = Math.abs(hash) % 3;

  // Path silhouettes
  const chassisPaths = [
    // Modern high-downforce silhouette
    'M 20 85 L 65 85 L 85 70 L 140 60 L 210 52 L 270 52 L 315 62 L 370 66 L 425 66 L 452 79 L 478 79 L 478 88 L 415 88 L 402 81 L 350 81 L 338 88 L 132 88 L 120 81 L 76 81 L 64 88 Z',
    // Ultra-lowline / low-drag profile
    'M 20 85 L 60 85 L 80 67 L 145 61 L 215 54 L 265 54 L 305 63 L 365 67 L 420 67 L 448 78 L 476 78 L 476 88 L 412 88 L 400 81 L 348 81 L 336 88 L 128 88 L 116 81 L 72 81 L 60 88 Z',
    // Stepped nose / aggressive bargeboard profile
    'M 22 84 L 62 84 L 84 68 L 135 59 L 208 51 L 272 51 L 318 61 L 368 65 L 426 65 L 454 80 L 480 80 L 480 88 L 416 88 L 404 81 L 352 81 L 340 88 L 130 88 L 118 81 L 74 81 L 62 88 Z',
  ];

  const dChassis = chassisPaths[aeroProfile];

  return (
    <div
      role="img"
      aria-label={`${title} F1 car technical silhouette`}
      className={`relative flex items-center justify-center overflow-hidden bg-[#090d14] ${className}`}
      style={{
        background: `radial-gradient(ellipse at 50% 60%, color-mix(in srgb, ${teamColor} 15%, #080b11), #05070a 90%)`,
      }}
    >
      {/* Background blueprint grid */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-15"
        style={{
          backgroundImage: `
            linear-gradient(to right, rgba(255,255,255,0.08) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(255,255,255,0.08) 1px, transparent 1px)
          `,
          backgroundSize: '24px 24px',
        }}
      />

      <svg
        viewBox="0 0 500 130"
        className="relative z-10 h-full w-full p-4 transition-transform duration-500 hover:scale-[1.02]"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id={`car-wire-${seed}`} x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor={teamColor} />
            <stop offset="70%" stopColor="#ffffff" stopOpacity="0.85" />
            <stop offset="100%" stopColor={teamColor} />
          </linearGradient>
        </defs>

        {/* Technical Header Stamps */}
        <text x="20" y="24" fill="rgba(255,255,255,0.4)" fontSize="8" fontFamily="monospace">
          + APEX_CHASSIS // {isIconic ? 'ICONIC COLLECTION' : 'SEASON TECHNICAL PROFILE'}
        </text>
        {season ? (
          <text x="480" y="24" fill={teamColor} fontSize="8" fontFamily="monospace" textAnchor="end">
            SEASON {season}
          </text>
        ) : null}

        {/* Baseline Ground Plane */}
        <line x1="10" y1="102" x2="490" y2="102" stroke="rgba(255,255,255,0.15)" strokeWidth="1" strokeDasharray="4 4" />

        {/* Wheels (Front & Rear) */}
        <circle cx="96" cy="86" r="16" fill="rgba(15,20,28,0.9)" stroke="rgba(255,255,255,0.3)" strokeWidth="1.5" />
        <circle cx="96" cy="86" r="10" fill="none" stroke={teamColor} strokeWidth="1" strokeDasharray="2 2" />
        <circle cx="96" cy="86" r="2.5" fill="#ffffff" />

        <circle cx="376" cy="86" r="16" fill="rgba(15,20,28,0.9)" stroke="rgba(255,255,255,0.3)" strokeWidth="1.5" />
        <circle cx="376" cy="86" r="10" fill="none" stroke={teamColor} strokeWidth="1" strokeDasharray="2 2" />
        <circle cx="376" cy="86" r="2.5" fill="#ffffff" />

        {/* Front Wing Cascade */}
        <polygon points="18,84 46,84 42,72 18,72" fill="rgba(255,255,255,0.06)" stroke={teamColor} strokeWidth="1.2" />

        {/* Rear Wing Assembly */}
        <polygon points="446,78 480,78 480,42 446,42" fill="rgba(255,255,255,0.06)" stroke="rgba(255,255,255,0.4)" strokeWidth="1.2" />
        <line x1="446" y1="50" x2="480" y2="50" stroke={teamColor} strokeWidth="2" />
        <line x1="446" y1="60" x2="480" y2="60" stroke="rgba(255,255,255,0.3)" strokeWidth="1" />

        {/* Chassis Path */}
        <path
          d={dChassis}
          fill="rgba(255,255,255,0.03)"
          stroke={`url(#car-wire-${seed})`}
          strokeWidth="2"
          strokeLinejoin="round"
        />

        {/* Cockpit Halo & Driver Helmet */}
        <circle cx="236" cy="56" r="5" fill={teamColor} stroke="#ffffff" strokeWidth="0.8" />
        <path d="M 226 62 Q 236 50 248 62" fill="none" stroke="rgba(255,255,255,0.6)" strokeWidth="1.5" />

        {/* Chassis Name Label */}
        <text
          x="20"
          y="120"
          fill="#ffffff"
          fontFamily="var(--font-condensed), sans-serif"
          fontWeight="700"
          fontSize="12"
          letterSpacing="0.08em"
        >
          {title}
        </text>
      </svg>
    </div>
  );
}
