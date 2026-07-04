'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { NAV_ITEMS } from './nav-items';
import { HeaderNav } from './HeaderNav';

/**
 * Sticky header — full nav on md+. On mobile home (Poster Dense) header is hidden;
 * logo lives in PosterHero instead.
 */
export function SiteHeader() {
  const pathname = usePathname();
  const hideOnMobileHome = pathname === '/';

  return (
    <header
      className={[
        'sticky top-0 z-30 border-b border-hairline bg-bg/60 backdrop-blur-xl',
        hideOnMobileHome ? 'hidden md:block' : 'block',
      ].join(' ')}
    >
      <div className="mx-auto flex h-[52px] w-full max-w-[var(--container-max)] items-center justify-between px-5 md:px-8 lg:px-16">
        <Link
          href="/"
          className="font-condensed text-2xl font-700 tracking-tight text-text-hi"
          style={{ fontFamily: 'var(--font-condensed)', fontWeight: 700 }}
        >
          APEX
        </Link>

        <HeaderNav items={NAV_ITEMS} />

        <Link
          href="/season"
          aria-label="Search"
          className="hidden text-text-mid transition-colors hover:text-text-hi md:block"
        >
          <SearchIcon />
        </Link>
      </div>
    </header>
  );
}

function SearchIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <circle cx="11" cy="11" r="7" />
      <path d="m21 21-4.3-4.3" />
    </svg>
  );
}
