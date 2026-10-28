/**
 * Analog film grain overlay (season and cockpit surfaces). Drawn as an inline SVG noise pattern, not a CSS
 * background image: a background image on a full-viewport layer, even on `::before`, was the LCP element on the
 * season pages (Lighthouse 2026-10-29). SVG shapes are not LCP candidates. The ids repeat when two grains share a
 * page; the definitions are identical, so whichever the browser picks draws the same texture.
 */
export function FilmGrain({ className = '' }: { className?: string }) {
  return (
    <svg aria-hidden focusable="false" className={`pointer-events-none opacity-[0.03] ${className}`}>
      <filter id="apex-film-grain-noise">
        <feTurbulence type="fractalNoise" baseFrequency="1.2" numOctaves={4} stitchTiles="stitch" />
      </filter>
      <pattern id="apex-film-grain" width="180" height="180" patternUnits="userSpaceOnUse">
        <rect width="180" height="180" filter="url(#apex-film-grain-noise)" />
      </pattern>
      <rect width="100%" height="100%" fill="url(#apex-film-grain)" />
    </svg>
  );
}
