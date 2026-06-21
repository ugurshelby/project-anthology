'use client';

import { useRouter } from 'next/navigation';

/**
 * Season year scrubber (design.md §3.3) — prev/next chevrons around the big year.
 * Bounded by [minSeason, currentSeason]; navigates to /season/[year] (or /season
 * for the current year). Client: needs router navigation.
 */
export function YearScrubber({
  year,
  minSeason,
  currentSeason,
}: {
  year: number;
  minSeason: number;
  currentSeason: number;
}) {
  const router = useRouter();
  const go = (y: number) => router.push(y === currentSeason ? '/season' : `/season/${y}`);

  return (
    <div className="flex items-center gap-4">
      <button
        type="button"
        aria-label="Previous season"
        disabled={year <= minSeason}
        onClick={() => go(year - 1)}
        className="cursor-pointer text-text-mid transition-colors hover:text-text-hi disabled:cursor-not-allowed disabled:opacity-30"
      >
        <Chevron dir="left" />
      </button>
      <span className="hero-number text-[clamp(40px,6vw,72px)] text-text-hi">{year}</span>
      <button
        type="button"
        aria-label="Next season"
        disabled={year >= currentSeason}
        onClick={() => go(year + 1)}
        className="cursor-pointer text-text-mid transition-colors hover:text-text-hi disabled:cursor-not-allowed disabled:opacity-30"
      >
        <Chevron dir="right" />
      </button>
    </div>
  );
}

function Chevron({ dir }: { dir: 'left' | 'right' }) {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <path d={dir === 'left' ? 'm15 18-6-6 6-6' : 'm9 18 6-6-6-6'} />
    </svg>
  );
}
