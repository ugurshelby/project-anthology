import { PageShell, BentoGrid } from '@/components/layout/BentoGrid';

type Span = 4 | 6 | 8 | 12;

const SPAN: Record<Span, string> = {
  4: 'col-span-4 md:col-span-4 lg:col-span-4',
  6: 'col-span-4 md:col-span-4 lg:col-span-6',
  8: 'col-span-4 md:col-span-8 lg:col-span-8',
  12: 'col-span-4 md:col-span-8 lg:col-span-12',
};

/**
 * Generic loading skeleton for force-dynamic bento pages — shown by Next.js
 * while the route's async data (Supabase/Jolpica fetches) resolves.
 */
export function BentoSkeleton({
  heroSpan = 12,
  cards = [4, 4, 4, 6, 6],
}: {
  /** Span of the top hero placeholder block (0 to omit). */
  heroSpan?: Span | 0;
  /** Span of each card placeholder below the hero. */
  cards?: Span[];
}) {
  return (
    <PageShell>
      {heroSpan > 0 ? (
        <div
          aria-hidden
          className={`mb-8 h-40 animate-pulse rounded-[var(--radius-lg)] bg-surface md:h-56 ${SPAN[heroSpan as Span]}`}
        />
      ) : null}
      <BentoGrid>
        {cards.map((span, i) => (
          <div
            key={i}
            aria-hidden
            className={`h-40 animate-pulse rounded-[var(--radius-lg)] bg-surface ${SPAN[span]}`}
          />
        ))}
      </BentoGrid>
    </PageShell>
  );
}
