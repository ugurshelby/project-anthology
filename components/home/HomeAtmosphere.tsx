export function HomeAtmosphere() {
  return (
    <div className="home-atmosphere" aria-hidden>
      <div className="home-atmosphere-layer home-atmosphere-spotlight-left" />
      <div className="home-atmosphere-layer home-atmosphere-spotlight-right" />
      <div className="home-atmosphere-layer home-atmosphere-red-glow" />
      <svg
        className="home-atmosphere-layer home-atmosphere-grain"
        width="100%"
        height="100%"
        preserveAspectRatio="none"
      >
        <filter id="home-grain-filter">
          <feTurbulence type="fractalNoise" baseFrequency="0.8" numOctaves="4" stitchTiles="stitch" />
        </filter>
        <rect width="100%" height="100%" filter="url(#home-grain-filter)" />
      </svg>
      <div className="home-atmosphere-layer home-atmosphere-streak" />
      <div className="home-atmosphere-layer home-atmosphere-streak-2" />
      <div className="home-atmosphere-layer home-atmosphere-streak-3" />
    </div>
  );
}
