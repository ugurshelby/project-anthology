/** Shared imageless / broken-cover fallback for news cards and wire thumbs. */
export function NewsImageFallback() {
  return (
    <span
      aria-hidden
      className="absolute inset-0 bg-surface"
      style={{
        backgroundImage:
          'radial-gradient(ellipse 70% 60% at 80% 20%, color-mix(in srgb, var(--accent) 12%, transparent), transparent 55%), repeating-linear-gradient(90deg, transparent, transparent 24px, rgba(255,255,255,0.03) 24px, rgba(255,255,255,0.03) 25px)',
      }}
    >
      <span className="absolute inset-0 flex items-center justify-center font-condensed text-[4.5rem] font-700 uppercase leading-none text-white/[0.05]">
        APEX
      </span>
    </span>
  );
}
