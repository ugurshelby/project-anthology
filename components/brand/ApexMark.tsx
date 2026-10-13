/**
 * Apex logomark: a corner drawn as a "Λ" whose tip is the apex — the point a
 * racing line clips — marked in the accent colour. Used in the header and the
 * home hero so the brand is visible where a visitor lands.
 */
export function ApexMark({
  className = '',
  glow = false,
  title,
}: {
  className?: string;
  /** Soft breathing glow on the apex point (home active state). */
  glow?: boolean;
  title?: string;
}) {
  return (
    <svg
      viewBox="0 0 32 32"
      className={className}
      role={title ? 'img' : undefined}
      aria-hidden={title ? undefined : true}
      aria-label={title}
      fill="none"
    >
      {/* the corner: entry and exit legs */}
      <path d="M5 26 L14.6 7.6" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
      <path d="M17.4 7.6 L27 26" stroke="currentColor" strokeWidth="3" strokeLinecap="round" opacity="0.55" />
      {/* the racing line sweeping through the apex */}
      <path d="M9.5 24 Q16 3.5 22.5 24" stroke="var(--accent)" strokeWidth="1.4" strokeLinecap="round" opacity="0.85" />
      {glow ? <circle cx="16" cy="9" r="5.5" fill="var(--accent)" opacity="0.45" className="apex-breathe" style={{ filter: 'blur(3px)' }} /> : null}
      <circle cx="16" cy="9" r="2.6" fill="var(--accent)" />
    </svg>
  );
}
