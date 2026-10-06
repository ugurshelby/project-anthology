'use client';

interface TeamPlaceholderProps {
  seed: string;
  name?: string;
  teamColor?: string;
  className?: string;
}

/**
 * Section 9 Team Placeholder:
 * Typographic wordmark SVG using team colors without mimicking official protected logos.
 * Features racing-grade typography, italic dynamic cuts, and secondary accent stripes.
 */
export function TeamPlaceholder({
  seed,
  name,
  teamColor = '#ff1801',
  className = 'h-full w-full',
}: TeamPlaceholderProps) {
  const cleanName = (name || seed.replace(/[-_]/g, ' ')).toUpperCase();
  const words = cleanName.split(/\s+/).filter(Boolean);

  let primaryText = cleanName;
  let secondaryText = '';

  if (words.length > 2) {
    primaryText = words.slice(0, 2).join(' ');
    secondaryText = words.slice(2).join(' ');
  } else if (words.length === 2 && cleanName.length > 14) {
    primaryText = words[0];
    secondaryText = words[1];
  }

  return (
    <div
      role="img"
      aria-label={`${cleanName} typography badge`}
      className={`relative flex items-center justify-center overflow-hidden bg-[#0c1017] ${className}`}
      style={{
        background: `radial-gradient(circle at 50% 50%, color-mix(in srgb, ${teamColor} 18%, #0a0d13), #07090e 85%)`,
      }}
    >
      {/* Carbon weave texture */}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-20"
        style={{
          backgroundImage: `repeating-linear-gradient(45deg, rgba(255,255,255,0.06) 0px, rgba(255,255,255,0.06) 2px, transparent 2px, transparent 4px)`,
        }}
      />

      <svg
        viewBox="0 0 320 180"
        className="relative z-10 h-full w-full p-4 transition-transform duration-300 hover:scale-[1.02]"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id={`team-grad-${seed}`} x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor={teamColor} />
            <stop offset="100%" stopColor="color-mix(in srgb, var(--accent) 70%, white)" />
          </linearGradient>
        </defs>

        {/* Speed Angle Slashes */}
        <line x1="24" y1="20" x2="16" y2="160" stroke="rgba(255,255,255,0.1)" strokeWidth="1.5" />
        <line x1="36" y1="20" x2="28" y2="160" stroke={teamColor} strokeWidth="2.5" />

        {/* Diagonal Tech Mark */}
        <polygon
          points="280,24 296,24 286,54 270,54"
          fill={teamColor}
          opacity="0.8"
        />

        {/* Main Wordmark Text */}
        <text
          x="160"
          y={secondaryText ? '85' : '98'}
          textAnchor="middle"
          fill="#ffffff"
          fontFamily="var(--font-condensed), Impact, sans-serif"
          fontWeight="800"
          fontSize={primaryText.length > 10 ? '24' : '28'}
          letterSpacing="0.08em"
          fontStyle="italic"
        >
          {primaryText}
        </text>

        {secondaryText ? (
          <text
            x="160"
            y="118"
            textAnchor="middle"
            fill="rgba(255,255,255,0.65)"
            fontFamily="var(--font-condensed), sans-serif"
            fontWeight="600"
            fontSize="14"
            letterSpacing="0.16em"
          >
            {secondaryText}
          </text>
        ) : null}

        {/* Bottom Baseline Bar */}
        <rect
          x="60"
          y={secondaryText ? '136' : '124'}
          width="200"
          height="2"
          fill={`url(#team-grad-${seed})`}
        />

        <text
          x="160"
          y="156"
          textAnchor="middle"
          fill="rgba(255,255,255,0.3)"
          fontSize="8"
          fontFamily="monospace"
          letterSpacing="0.2em"
        >
          FORMULA 1 CONSTRUCTOR
        </text>
      </svg>
    </div>
  );
}
