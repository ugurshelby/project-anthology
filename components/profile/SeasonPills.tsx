'use client';

import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useCallback } from 'react';

/**
 * Season selector pills for profile pages (Faz 3). Pushes `?season=` so the RSC
 * re-renders server-side with the new season's data + palette — the 800ms color
 * transition is driven by the CSS variables on the page root (instant under
 * prefers-reduced-motion via the .profile-root rule in globals.css).
 */
export function SeasonPills({
  seasons,
  active,
}: {
  seasons: number[];
  active: number;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const select = useCallback(
    (year: number) => {
      if (year === active) return;
      const params = new URLSearchParams(searchParams.toString());
      params.set('season', String(year));
      router.push(`${pathname}?${params.toString()}`, { scroll: false });
    },
    [active, pathname, router, searchParams],
  );

  return (
    <div
      className="flex flex-wrap gap-2"
      role="tablist"
      aria-label="Select season"
    >
      {seasons.map((year) => {
        const isActive = year === active;
        return (
          <button
            key={year}
            type="button"
            role="tab"
            aria-selected={isActive}
            onClick={() => select(year)}
            className="profile-season-pill"
            data-active={isActive ? '' : undefined}
          >
            {year}
          </button>
        );
      })}
    </div>
  );
}
