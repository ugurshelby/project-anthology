/**
 * Streaming fallbacks for the homepage — keep the shell on screen while data resolves.
 * Paddock fallbacks match the real cards' height (~570–590 px) so the archive block below does not jump.
 */

export function HomePaddockCardFallback({ className = '' }: { className?: string }) {
  return (
    <div
      className={`min-h-[560px] min-w-[min(85vw,22rem)] shrink-0 snap-start animate-pulse rounded-[var(--radius-lg)] border border-hairline bg-surface md:col-span-4 md:min-w-0 lg:col-span-4 ${className}`}
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
