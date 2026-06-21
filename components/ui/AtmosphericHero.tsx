import type { ReactNode } from 'react';

interface AtmosphericHeroProps {
  children: ReactNode;
  className?: string;
  /**
   * Compact heroes are for index/list pages (Drivers, Teams, Circuits, …) where
   * the hero is a title band, not a destination — a full 100dvh band there just
   * forces the visitor to scroll past empty space to reach the content. The
   * full-height form stays the default for true landing heroes.
   */
  compact?: boolean;
}

export function AtmosphericHero({ children, className = '', compact = false }: AtmosphericHeroProps) {
  const rootClass = `atmospheric-hero ${compact ? 'atmospheric-hero--compact' : ''} ${className}`
    .replace(/\s+/g, ' ')
    .trim();
  const contentClass = compact
    ? 'hero-content content-wrap flex min-h-[46vh] flex-col items-center justify-center px-6 py-20 text-center'
    : 'hero-content content-wrap flex min-h-dvh flex-col items-center justify-center px-6 py-28 text-center';

  return (
    <section className={rootClass}>
      <div className="hero-layer hero-grain" aria-hidden />
      <div className="hero-layer hero-light-streak" aria-hidden />
      <div className="hero-layer hero-light-streak-2" aria-hidden />
      <div className="hero-layer hero-light-streak-3" aria-hidden />
      <div className={contentClass}>{children}</div>
    </section>
  );
}
