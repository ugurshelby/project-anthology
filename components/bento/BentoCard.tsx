import type { ReactNode } from 'react';

type Span = 4 | 6 | 8 | 12;

const SPAN: Record<Span, string> = {
  4: 'col-span-4 md:col-span-4 lg:col-span-4',
  6: 'col-span-4 md:col-span-4 lg:col-span-6',
  8: 'col-span-4 md:col-span-8 lg:col-span-8',
  12: 'col-span-4 md:col-span-8 lg:col-span-12',
};

/**
 * Bento card (design.md §4, §9). --surface + 1px hairline + 16px radius +
 * ambient shadow + pseudo-glass (no real backdrop blur). Hover lifts to
 * --surface-raised with a thin accent bar and a 2px translate (CSS only).
 */
export function BentoCard({
  span = 4,
  children,
  className = '',
  as: Tag = 'section',
  interactive = false,
}: {
  span?: Span;
  children: ReactNode;
  className?: string;
  as?: 'section' | 'article' | 'div';
  interactive?: boolean;
}) {
  return (
    <Tag
      className={[
        SPAN[span],
        'group relative overflow-hidden rounded-[var(--radius-lg)] border border-hairline bg-surface p-6 md:p-8',
        'shadow-[0_8px_40px_-12px_rgba(0,0,0,0.6)]',
        interactive
          ? 'bg-surface-raised/0 transition-[transform,opacity] duration-150 ease-out will-change-transform hover:-translate-y-0.5 hover:opacity-95'
          : '',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      {interactive ? (
        <span
          aria-hidden
          className="absolute inset-x-0 top-0 h-0.5 origin-left scale-x-0 bg-accent transition-transform duration-150 ease-out group-hover:scale-x-100"
        />
      ) : null}
      {children}
    </Tag>
  );
}
