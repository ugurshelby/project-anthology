'use client';

/**
 * Live indicator (design.md §5/§9) — red pulsing dot + mono "LIVE".
 * Pulse disabled under prefers-reduced-motion (handled globally in globals.css).
 */
export function LiveIndicator({ label = 'LIVE' }: { label?: string }) {
  return (
    <span className="label-caps inline-flex items-center gap-2 text-accent">
      <span className="relative flex h-2 w-2">
        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent opacity-60" />
        <span className="relative inline-flex h-2 w-2 rounded-full bg-accent" />
      </span>
      {label}
    </span>
  );
}
