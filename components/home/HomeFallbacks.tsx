/** Streaming fallbacks for the homepage — keep the shell on screen while data resolves. */

export function HomeHeroFallback() {
  return (
    <div
      className="-mx-5 h-[520px] animate-pulse bg-surface md:-mx-8 md:h-[600px] lg:-mx-16"
      aria-hidden
    />
  );
}

export function HomePaddockCardFallback() {
  return (
    <div
      className="col-span-4 min-h-[320px] min-w-[85vw] shrink-0 snap-start animate-pulse rounded-[var(--radius-lg)] border border-hairline bg-surface md:col-span-4 md:min-w-0 lg:col-span-4"
      aria-hidden
    />
  );
}

export function HomeArchiveFallback() {
  return (
    <div
      className="min-h-40 animate-pulse rounded-[var(--radius-lg)] border border-hairline bg-surface md:min-h-[220px]"
      aria-hidden
    />
  );
}
