import type { ReactNode } from 'react';

/**
 * Bento grid wrapper (design.md §3.2). 12-col desktop / 8-col tablet / 4-col
 * mobile, snapped via Tailwind's responsive columns. Children set their own
 * span with `col-span-*` utilities (see BentoCard `span`).
 */
export function BentoGrid({ children }: { children: ReactNode }) {
  return (
    <div className="grid grid-cols-4 gap-4 md:grid-cols-8 md:gap-5 lg:grid-cols-12 lg:gap-6">
      {children}
    </div>
  );
}

/** Page container — centered, container-max 1440, responsive page margins (§3.2). */
export function PageShell({ children }: { children: ReactNode }) {
  return (
    <main
      id="main-content"
      className="mx-auto w-full max-w-[var(--container-max)] flex-1 px-5 py-8 md:px-8 lg:px-16 lg:py-12"
    >
      {children}
    </main>
  );
}
