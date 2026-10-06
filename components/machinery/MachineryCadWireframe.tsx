'use client';

import type { MachineryCar } from '@/data/machinery/cars';

interface MachineryCadWireframeProps {
  car: MachineryCar;
  interactive?: boolean;
}

export function MachineryCadWireframe({ car, interactive = false }: MachineryCadWireframeProps) {
  return (
    <div className="relative w-full overflow-hidden rounded-[14px] border border-white/10 bg-[#090d12] p-4 sm:p-6">
      {/* CAD Grid Background */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-20"
        style={{
          backgroundImage: `
            linear-gradient(to right, rgba(255,255,255,0.08) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(255,255,255,0.08) 1px, transparent 1px)
          `,
          backgroundSize: '24px 24px',
        }}
      />

      {/* Engineering HUD stamps */}
      <div className="relative z-10 flex items-center justify-between font-mono text-[10px] text-text-low">
        <div className="flex items-center gap-2">
          <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: car.accentColor }} />
          <span className="font-bold tracking-wider text-text-hi">
            CAD_SCHEMATIC // {car.name}
          </span>
        </div>
        <span className="tracking-widest">
          SCALE: 1:25 // PROJECTION: SIDE_PROFILE
        </span>
      </div>

      {/* Crosshair marks */}
      <div aria-hidden="true" className="pointer-events-none absolute top-2 left-2 font-mono text-[9px] text-white/20">+ [0,0]</div>
      <div aria-hidden="true" className="pointer-events-none absolute bottom-2 right-2 font-mono text-[9px] text-white/20">+ [DATUM_REF]</div>

      {/* Main SVG Blueprint Canvas */}
      <div className="relative z-10 my-4 flex items-center justify-center">
        <svg
          viewBox="0 0 500 110"
          className="h-auto w-full max-w-2xl overflow-visible transition-transform duration-500 hover:scale-[1.02]"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            {/* Blueprint Glow Filter */}
            <filter id={`glow-${car.id}`} x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="0" stdDeviation="3" floodColor={car.accentColor} floodOpacity="0.5" />
            </filter>
            <linearGradient id={`car-grad-${car.id}`} x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor={car.accentColor} stopOpacity="0.8" />
              <stop offset="100%" stopColor={car.secondaryColor || '#ffffff'} stopOpacity="0.4" />
            </linearGradient>
          </defs>

          {/* Ground Reference Baseline */}
          <line x1="0" y1="88" x2="500" y2="88" stroke="rgba(255,255,255,0.15)" strokeWidth="1" strokeDasharray="4 4" />
          <text x="5" y="100" fill="rgba(255,255,255,0.3)" fontSize="7" fontFamily="monospace">REFERENCE PLANE // RIDE HEIGHT ZERO</text>

          {/* Front & Rear Wheels (Wireframe Circles) */}
          {/* Front Wheel (approx x: 90, y: 72, r: 16) */}
          <circle cx="90" cy="72" r="16" fill="rgba(15,20,28,0.9)" stroke="rgba(255,255,255,0.4)" strokeWidth="1.5" />
          <circle cx="90" cy="72" r="9" fill="none" stroke={car.accentColor} strokeWidth="1" strokeDasharray="2 2" />
          <circle cx="90" cy="72" r="2.5" fill="white" />

          {/* Rear Wheel (approx x: 375, y: 72, r: 16) */}
          <circle cx="375" cy="72" r="16" fill="rgba(15,20,28,0.9)" stroke="rgba(255,255,255,0.4)" strokeWidth="1.5" />
          <circle cx="375" cy="72" r="9" fill="none" stroke={car.accentColor} strokeWidth="1" strokeDasharray="2 2" />
          <circle cx="375" cy="72" r="2.5" fill="white" />

          {/* Wheelbase Dimension Line */}
          <line x1="90" y1="94" x2="375" y2="94" stroke="rgba(255,255,255,0.3)" strokeWidth="0.8" />
          <line x1="90" y1="91" x2="90" y2="97" stroke="rgba(255,255,255,0.4)" strokeWidth="0.8" />
          <line x1="375" y1="91" x2="375" y2="97" stroke="rgba(255,255,255,0.4)" strokeWidth="0.8" />
          <text x="215" y="102" fill="rgba(255,255,255,0.4)" fontSize="7" fontFamily="monospace" textAnchor="middle">
            WHEELBASE ESTIMATE ~3,100mm
          </text>

          {/* Car Chassis Wireframe Path */}
          <path
            d={car.cadSilhouetteSvg}
            fill="none"
            stroke={car.accentColor}
            strokeWidth="2"
            strokeLinejoin="round"
            filter={`url(#glow-${car.id})`}
          />

          {/* Secondary Structural Lines (Cockpit halo / roll hoop / wings) */}
          {/* Front Wing Assembly */}
          <path d="M 10 70 L 40 70 L 35 60 L 10 60 Z" fill="rgba(255,255,255,0.05)" stroke="rgba(255,255,255,0.5)" strokeWidth="1" />
          {/* Rear Wing Endplate */}
          <path d="M 440 65 L 475 65 L 475 25 L 440 25 Z" fill="rgba(255,255,255,0.05)" stroke="rgba(255,255,255,0.5)" strokeWidth="1" />
          <line x1="440" y1="35" x2="475" y2="35" stroke={car.accentColor} strokeWidth="1.5" />
          <line x1="440" y1="45" x2="475" y2="45" stroke="rgba(255,255,255,0.4)" strokeWidth="1" />

          {/* Driver Cockpit & Helmet Outline */}
          <circle cx="230" cy="42" r="5" fill="rgba(255,255,255,0.6)" stroke="white" strokeWidth="0.8" />

          {/* Technical Aero Callout Pointers */}
          {interactive ? (
            <g className="text-white">
              {/* Front wing pointer */}
              <line x1="25" y1="58" x2="40" y2="18" stroke="rgba(255,255,255,0.3)" strokeWidth="0.8" />
              <circle cx="25" cy="58" r="2" fill={car.accentColor} />
              <text x="45" y="16" fill="rgba(255,255,255,0.7)" fontSize="7" fontFamily="monospace">FRONT WING CASCADE</text>

              {/* Airbox / Rollhoop pointer */}
              <line x1="260" y1="36" x2="280" y2="12" stroke="rgba(255,255,255,0.3)" strokeWidth="0.8" />
              <circle cx="260" cy="36" r="2" fill={car.accentColor} />
              <text x="285" y="12" fill="rgba(255,255,255,0.7)" fontSize="7" fontFamily="monospace">AIRBOX INTAKE</text>

              {/* Diffuser / Rear Wing pointer */}
              <line x1="445" y1="35" x2="420" y2="14" stroke="rgba(255,255,255,0.3)" strokeWidth="0.8" />
              <circle cx="445" cy="35" r="2" fill={car.accentColor} />
              <text x="350" y="14" fill="rgba(255,255,255,0.7)" fontSize="7" fontFamily="monospace">AERO BEAM / REAR WING</text>
            </g>
          ) : null}
        </svg>
      </div>

      {/* Blueprint Footer Bar */}
      <div className="relative z-10 flex flex-wrap items-center justify-between border-t border-white/10 pt-2 text-[10px] font-mono text-text-mid">
        <span className="flex items-center gap-1.5">
          <span className="text-text-low">POWER UNIT:</span>
          <span className="font-semibold text-text-hi">{car.engine.spec}</span>
        </span>
        <span className="flex items-center gap-1.5">
          <span className="text-text-low">WEIGHT:</span>
          <span className="font-semibold text-text-hi">{car.chassis.weightKg} KG</span>
        </span>
        <span className="flex items-center gap-1.5">
          <span className="text-text-low">WIN RATE:</span>
          <span className="font-bold text-accent">{car.achievements.winRate}</span>
        </span>
      </div>
    </div>
  );
}
