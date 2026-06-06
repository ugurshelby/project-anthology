import type { ReactNode } from 'react';

interface AtmosphericHeroProps {
  children: ReactNode;
  className?: string;
}

export function AtmosphericHero({ children, className = '' }: AtmosphericHeroProps) {
  return (
    <section className={`atmospheric-hero ${className}`.trim()}>
      <div className="hero-layer hero-spotlight-left" aria-hidden />
      <div className="hero-layer hero-spotlight-right" aria-hidden />
      <div className="hero-layer hero-red-glow" aria-hidden />
      <svg
        className="hero-layer hero-grain"
        aria-hidden
        width="100%"
        height="100%"
        preserveAspectRatio="none"
      >
        <filter id="hero-grain-filter">
          <feTurbulence type="fractalNoise" baseFrequency="0.8" numOctaves="4" stitchTiles="stitch" />
        </filter>
        <rect width="100%" height="100%" filter="url(#hero-grain-filter)" />
      </svg>
      <div className="hero-layer hero-light-streak" aria-hidden />
      <div className="hero-content content-wrap flex min-h-screen flex-col items-center justify-center px-6 py-28 text-center">
        {children}
      </div>
    </section>
  );
}
