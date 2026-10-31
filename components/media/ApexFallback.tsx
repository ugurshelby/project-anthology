import type { ReactNode } from 'react';
import { PlaceholderArt } from '@/components/media/placeholders/PlaceholderArt';

export type ApexFallbackKind = 'car' | 'driver' | 'circuit' | 'media' | 'team';

const KIND_LABEL: Record<ApexFallbackKind, string> = {
  car: 'CAR',
  driver: 'DRIVER',
  circuit: 'CIRCUIT',
  media: 'MEDIA',
  team: 'TEAM',
};

/**
 * Fallback for an image that is missing or failed to load. Drivers, teams, cars and circuits show the owner-supplied
 * placeholder artwork (2026-10-31); anything else (`media`) shows a neutral archive surface. Callers may pass
 * `children` to put their own content on that surface.
 */
export function ApexFallback({
  kind = 'media',
  label,
  className = '',
  children,
}: {
  kind?: ApexFallbackKind;
  label?: string;
  className?: string;
  children?: ReactNode;
}) {
  const caption = label ?? KIND_LABEL[kind];
  // Drivers, teams, cars and circuits get the owner-supplied artwork (2026-10-31), like the media placeholders.
  if (kind !== 'media' && !children) {
    return <PlaceholderArt kind={kind} ariaLabel={caption} caption={label?.toUpperCase()} className={`h-full w-full ${className}`} />;
  }

  return (
    <div
      role="img"
      aria-label={caption}
      className={[
        'relative flex h-full w-full items-center justify-center overflow-hidden bg-surface-raised',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      style={{
        background:
          'linear-gradient(155deg, color-mix(in srgb, var(--team-secondary, var(--accent)) 20%, var(--surface-raised)), var(--surface-raised) 65%)',
      }}
    >
      <span
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.45]"
        style={{
          backgroundImage:
            'repeating-linear-gradient(90deg, transparent, transparent 11px, rgba(255,255,255,0.045) 11px, rgba(255,255,255,0.045) 12px), repeating-linear-gradient(0deg, transparent, transparent 11px, rgba(255,255,255,0.045) 11px, rgba(255,255,255,0.045) 12px)',
        }}
      />
      <span aria-hidden className="pointer-events-none absolute left-2 top-2 h-3 w-3 border-l border-t border-hairline" />
      <span aria-hidden className="pointer-events-none absolute right-2 top-2 h-3 w-3 border-r border-t border-hairline" />
      <span aria-hidden className="pointer-events-none absolute bottom-2 left-2 h-3 w-3 border-b border-l border-hairline" />
      <span aria-hidden className="pointer-events-none absolute bottom-2 right-2 h-3 w-3 border-b border-r border-hairline" />
      <span
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            'radial-gradient(ellipse at center, transparent 35%, rgba(0,0,0,0.35) 100%)',
        }}
      />
      <div className="relative z-10 flex flex-col items-center justify-center gap-1.5 px-3 text-center">
        {children ?? (
          <>
            <svg
              aria-hidden="true"
              className="h-5 w-5 text-text-mid/60"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
            >
              <path d="M4 6h16M4 12h16M4 18h10" strokeLinecap="round" />
              <circle cx="18" cy="18" r="2" fill="currentColor" />
            </svg>
            <span className="font-mono text-[9px] uppercase tracking-[0.2em] text-text-low/80">ARCHIVE // SPEC</span>
          </>
        )}
      </div>
    </div>
  );
}
