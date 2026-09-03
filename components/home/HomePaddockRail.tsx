import type { ReactNode } from 'react';

/** Mobile: snap-x bento rail. Desktop: 3-column grid. */
export function HomePaddockRail({ children }: { children: ReactNode }) {
  return (
    <div className="-mx-5 flex snap-x snap-mandatory gap-4 overflow-x-auto px-5 pb-1 [scrollbar-width:none] md:mx-0 md:grid md:grid-cols-8 md:gap-5 md:overflow-visible md:px-0 md:pb-0 lg:grid-cols-12 lg:gap-6 [&::-webkit-scrollbar]:hidden">
      {children}
    </div>
  );
}
