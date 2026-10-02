import type { ReactNode } from 'react';
import { BentoCard } from '@/components/bento/BentoCard';

type Span = 4 | 5 | 6 | 7 | 8 | 12;

/** Bento card with an eyebrow, a heading and a thin team-colour line on top. */
export function HistoryCard({
  span,
  eyebrow,
  heading,
  children,
  className = '',
}: {
  span: Span;
  eyebrow?: string;
  heading: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <BentoCard span={span} className={`relative ${className}`.trim()}>
      <span
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-px"
        style={{ backgroundColor: 'var(--team-secondary)', opacity: 0.7 }}
      />
      {eyebrow ? <p className="label-caps mb-2 text-text-mid">{eyebrow}</p> : null}
      <h2 className="headline-md text-text-hi">{heading}</h2>
      <div className="mt-6">{children}</div>
    </BentoCard>
  );
}
