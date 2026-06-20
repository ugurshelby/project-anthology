import type { CSSProperties } from 'react';

/**
 * Design-aligned placeholder for a missing driver/team asset. Renders the
 * driver's 3-letter code (or a derived initial) on the surface tone with the
 * accent border-left, so a null `driverIconSrc`/`teamIconSrc` degrades to a
 * branded chip instead of an empty gap or a broken image.
 *
 * Visual spec (DESIGN_SYSTEM): bg #131313 (surface), 2px #ff1801 border-left,
 * IBM Plex Mono text. Square by default; pass a size to match the icon slot.
 */
interface AssetFallbackProps {
  /** Short label to show — FIA code, team initials, or a name to derive from. */
  label: string;
  /** Square edge length in px (matches the icon it replaces). */
  size?: number;
  className?: string;
}

/** Derive a compact, uppercase label: prefer a 3-letter code, else initials. */
function compactLabel(raw: string): string {
  const trimmed = raw.trim();
  if (!trimmed) return '—';
  // Already a short code (<= 3 chars): use as-is.
  if (trimmed.length <= 3) return trimmed.toUpperCase();
  // Multi-word name → initials (max 2). Single word → first 3 letters.
  const words = trimmed.split(/\s+/).filter(Boolean);
  if (words.length >= 2) {
    return (words[0][0] + words[words.length - 1][0]).toUpperCase();
  }
  return trimmed.slice(0, 3).toUpperCase();
}

export function AssetFallback({ label, size = 32, className = '' }: AssetFallbackProps) {
  const text = compactLabel(label);
  const style: CSSProperties = {
    width: size,
    height: size,
    backgroundColor: 'var(--surface)',
    borderLeft: '2px solid var(--border-hover)',
    fontFamily: 'var(--font-mono)',
    fontSize: Math.max(8, Math.round(size * 0.3)),
    letterSpacing: '0.05em',
    color: 'var(--muted)',
  };
  return (
    <span
      className={`inline-flex shrink-0 items-center justify-center uppercase ${className}`.trim()}
      style={style}
      aria-hidden
    >
      {text}
    </span>
  );
}
