import type { ReactNode } from 'react';
import { BentoCard } from '@/components/bento/BentoCard';
import { teamPatternStyle } from '@/lib/assets/team-pattern';

type Span = 4 | 5 | 6 | 7 | 8 | 12;

/** Bento card with an eyebrow, a heading and a thin team-colour line on top. */
export function HistoryCard({
  span,
  eyebrow,
  heading,
  children,
  className = '',
  texture,
}: {
  span: Span;
  eyebrow?: string;
  heading: string;
  children: ReactNode;
  className?: string;
  /** Constructor id whose signature texture and glow decorate the card. */
  texture?: string | null;
}) {
  return (
    <BentoCard span={span} className={`relative ${className}`.trim()}>
      <span
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-px"
        style={{ backgroundColor: 'var(--team-secondary)', opacity: 0.7 }}
      />
      {texture ? (
        <>
          <span aria-hidden className="pointer-events-none absolute inset-0 opacity-70" style={teamPatternStyle(texture, 'var(--team-secondary, var(--accent))', 0.07)} />
          <span
            aria-hidden
            className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full"
            style={{ background: 'radial-gradient(circle, color-mix(in srgb, var(--team-secondary, var(--accent)) 16%, transparent), transparent 70%)' }}
          />
        </>
      ) : null}
      {eyebrow ? <p className="label-caps relative mb-2 text-text-mid">{eyebrow}</p> : null}
      <h2 className="headline-md relative text-text-hi">{heading}</h2>
      <div className="relative mt-6">{children}</div>
    </BentoCard>
  );
}
