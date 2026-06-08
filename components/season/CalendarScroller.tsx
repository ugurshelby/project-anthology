'use client';

import { useEffect, useRef, type ReactNode } from 'react';

/**
 * Horizontal scroll wrapper for the Race Calendar. On mount it centers the card
 * marked `data-nearest="true"` (the race closest to today). The marking is done
 * server-side; the scroll is an imperative DOM read in useEffect, so there is no
 * hydration mismatch. `behavior: 'auto'` avoids an animated jump on first paint.
 */
export function CalendarScroller({
  children,
  className,
  scrollKey,
}: {
  children: ReactNode;
  className?: string;
  /** When this changes (e.g. season year), re-center the nearest race card. */
  scrollKey?: string | number;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = ref.current;
    if (!container) return;
    const nearest = container.querySelector<HTMLElement>('[data-nearest="true"]');
    if (!nearest) return;
    // Center the nearest card without nudging vertical page scroll.
    container.scrollLeft =
      nearest.offsetLeft - container.clientWidth / 2 + nearest.clientWidth / 2;
  }, [scrollKey]);

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}
