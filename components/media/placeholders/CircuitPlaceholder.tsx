'use client';

import { useId } from 'react';

interface CircuitPlaceholderProps {
  seed: string;
  name?: string;
  className?: string;
}

/**
 * Section 9 Circuit Placeholder:
 * Abstract, single-line, defined track contour illustration (loop, S/F line, telemetry CAD grid).
 * Zero raster images, pure parametric vector SVG, lightweight (< 3 KB).
 */
export function CircuitPlaceholder({
  seed,
  name,
  className = 'h-full w-full',
}: CircuitPlaceholderProps) {
  const filterId = useId();

  // Pseudo-random variance from seed string to create subtly varied track loops if not matched
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = (hash << 5) - hash + seed.charCodeAt(i);
    hash |= 0;
  }
  const variance = Math.abs(hash) % 4;

  const trackPaths = [
    // High-speed sweep layout
    'M 60 140 C 40 80, 100 40, 180 40 C 240 40, 300 70, 330 110 C 350 140, 320 180, 270 170 C 220 160, 200 190, 150 180 C 100 170, 70 180, 60 140 Z',
    // Technical chicane layout
    'M 50 120 C 50 60, 120 40, 200 50 C 260 60, 320 45, 340 90 C 355 130, 310 160, 260 150 C 210 140, 190 185, 130 180 C 80 175, 50 160, 50 120 Z',
    // Tight hairpin layout
    'M 70 150 C 50 100, 80 50, 160 45 C 240 40, 330 60, 340 120 C 345 160, 290 180, 240 160 C 200 140, 180 180, 120 180 C 80 180, 75 170, 70 150 Z',
    // Street circuit sharp angles
    'M 60 130 L 90 50 L 220 45 L 320 70 L 340 130 L 280 175 L 180 160 L 120 185 Z',
  ];

  const dPath = trackPaths[variance];

  return (
    <div
      role="img"
      aria-label={name ? `${name} circuit layout schematic` : 'Formula 1 circuit layout schematic'}
      className={`relative flex items-center justify-center overflow-hidden bg-[#0a0f16] ${className}`}
    >
      {/* Background CAD Grid */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-15"
        style={{
          backgroundImage: `
            linear-gradient(to right, rgba(255,255,255,0.1) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(255,255,255,0.1) 1px, transparent 1px)
          `,
          backgroundSize: '20px 20px',
        }}
      />

      {/* SVG Canvas */}
      <svg
        viewBox="0 0 400 220"
        className="relative z-10 h-full w-full p-4 transition-transform duration-500 hover:scale-[1.02]"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <filter id={filterId} x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="0" stdDeviation="4" floodColor="#ff1801" floodOpacity="0.45" />
          </filter>
        </defs>

        {/* Ambient track glow path */}
        <path
          d={dPath}
          fill="none"
          stroke="rgba(255, 24, 1, 0.15)"
          strokeWidth="10"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Main Vector Track Boundary Line */}
        <path
          d={dPath}
          fill="none"
          stroke="rgba(255, 255, 255, 0.85)"
          strokeWidth="2.75"
          strokeLinecap="round"
          strokeLinejoin="round"
          filter={`url(#${filterId})`}
        />

        {/* Start / Finish line indicator */}
        <line
          x1="60"
          y1="125"
          x2="60"
          y2="145"
          stroke="#ff1801"
          strokeWidth="3.5"
          strokeLinecap="square"
        />
        <circle cx="60" cy="135" r="2.5" fill="#ffffff" />

        {/* Sector telemetries */}
        <text x="18" y="24" fill="rgba(255,255,255,0.4)" fontSize="8" fontFamily="monospace">
          + CAD_SCHEMATIC // SECTOR 1-2-3
        </text>
        <text x="18" y="206" fill="rgba(255,255,255,0.4)" fontSize="8" fontFamily="monospace">
          DATUM: {seed.toUpperCase()}
        </text>
        <text x="382" y="206" fill="#ff1801" fontSize="8" fontFamily="monospace" textAnchor="end">
          FIA GRADE 1 SPEC
        </text>
      </svg>
    </div>
  );
}
