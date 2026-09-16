import type { ReactNode } from 'react';

export type ApexFallbackKind = 'car' | 'driver' | 'circuit' | 'media';

const KIND_LABEL: Record<ApexFallbackKind, string> = {
  car: 'CAR RENDER',
  driver: 'DRIVER',
  circuit: 'CIRCUIT',
  media: 'MEDIA',
};

/**
 * Intentional APEX empty-asset surface — technical wireframe, not a broken
 * icon, black void, or accidental number watermark.
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
      <div className="relative z-10 flex flex-col items-center gap-1.5 px-3 text-center">
        {children ?? (
          <>
            <span className="label-caps text-text-low">{caption}</span>
            <span className="data-tabular text-xs text-text-mid">ASSET PENDING</span>
          </>
        )}
      </div>
    </div>
  );
}
