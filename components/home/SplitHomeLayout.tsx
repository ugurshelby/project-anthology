import type { ReactNode } from 'react';
import type { PosterHeroProps } from './PosterHero';
import { PosterHero } from './PosterHero';

interface SplitHomeLayoutProps {
  hero: PosterHeroProps;
  dataColumn: ReactNode;
}

/**
 * Home responsive shell — Poster Dense (&lt; lg) stacked · Split Cinema (lg+) 55/45.
 */
export function SplitHomeLayout({ hero, dataColumn }: SplitHomeLayoutProps) {
  return (
    <main id="main-content" className="pb-mobile-nav flex-1 lg:pb-0">
      <div className="lg:mx-auto lg:w-full lg:max-w-[var(--container-max)]">
        <div className="grid grid-cols-1 lg:grid-cols-[1.1fr_0.9fr] lg:min-h-[calc(100dvh-52px)]">
          <div className="lg:border-r lg:border-hairline">
            <PosterHero {...hero} />
          </div>
          <div className="px-5 py-6 md:px-8 lg:max-h-[calc(100dvh-52px)] lg:overflow-y-auto lg:px-10 lg:py-10">
            {dataColumn}
          </div>
        </div>
      </div>
    </main>
  );
}
