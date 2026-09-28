import type { ReactNode } from 'react';

export type ApexFallbackKind = 'car' | 'driver' | 'circuit' | 'media' | 'team';

const KIND_LABEL: Record<ApexFallbackKind, string> = {
  car: 'CAR',
  driver: 'DRIVER',
  circuit: 'CIRCUIT',
  media: 'MEDIA',
  team: 'TEAM',
};

/**
 * Derive a short mark from whatever identity string the caller already has
 * (driver name, FIA code, constructor name) — no extra data fetch needed.
 * A pre-existing 2-4 letter uppercase code (e.g. "VER") passes through as-is;
 * anything else collapses to initials, e.g. "Max Verstappen" → "MV".
 */
function markFrom(label: string | undefined, kind: ApexFallbackKind): string {
  const trimmed = label?.trim();
  if (!trimmed) return KIND_LABEL[kind].slice(0, 3);
  if (/^[A-Z]{2,4}$/.test(trimmed)) return trimmed;
  const words = trimmed.split(/\s+/).filter(Boolean);
  if (words.length >= 2) {
    return (words[0][0] + words[words.length - 1][0]).toUpperCase();
  }
  return trimmed.slice(0, 3).toUpperCase();
}

/**
 * APEX's only visual for drivers/teams/cars/circuits — the site is
 * intentionally photo-free (no licensed photography or official marks; see
 * lib/assets/f1-icons.ts). Renders a data-driven mark (initials/code) inside
 * the existing technical-wireframe surface rather than a generic "missing
 * asset" placeholder, so this is a first-class visual, not a degrade state.
 * Colored via --team-secondary (set by lib/theme.ts teamThemeVars wherever a
 * team context exists) with a graceful CSS fallback to the site accent.
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
  const showMark = kind === 'driver' || kind === 'team' || kind === 'car';
  const mark = showMark ? markFrom(label, kind) : null;

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
      <div className="relative z-10 flex flex-col items-center gap-1 px-3 text-center">
        {children ?? (
          <>
            {mark ? (
              <span
                className="font-condensed text-2xl font-700 uppercase leading-none text-text-hi"
                style={{ fontFamily: 'var(--font-condensed)', color: 'color-mix(in srgb, var(--team-secondary, var(--accent)) 70%, white)' }}
              >
                {mark}
              </span>
            ) : null}
            <span className="label-caps text-text-low">{KIND_LABEL[kind]}</span>
          </>
        )}
      </div>
    </div>
  );
}
