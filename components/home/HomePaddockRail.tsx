import type { ReactNode } from 'react';

/** Mobile: snap-x bento rail. Desktop: 3-column grid. */
export function HomePaddockRail({ children }: { children: ReactNode }) {
  return (
    <div className="mx-0 flex min-w-0 max-w-full snap-x snap-mandatory gap-4 overflow-x-auto overscroll-x-contain px-0 pb-1 touch-pan-x [scrollbar-width:none] md:grid md:grid-cols-8 md:gap-5 md:overflow-visible md:px-0 md:pb-0 lg:grid-cols-12 lg:gap-6 [&::-webkit-scrollbar]:hidden">
      {children}
    </div>
  );
}
