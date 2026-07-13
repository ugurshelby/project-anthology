'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { NAV_ITEMS_LEFT, NAV_ITEMS_RIGHT } from './nav-items';
import { HeaderNav } from './HeaderNav';

/**
 * Sticky header — full nav on md+. On mobile home (Poster Dense) header is hidden;
 * logo lives in PosterHero instead.
 *
 * Desktop layout is symmetric around the APEX logo (2026-07 redesign): three
 * nav items either side — Season · Grid · Circuits | APEX | News · Anthology ·
 * Glossary — so the logo reads as the true center of the page, not a
 * left-aligned corner mark.
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
      <div className="mx-auto flex h-[52px] w-full max-w-[var(--container-max)] items-center justify-between px-5 md:px-8 lg:justify-center lg:gap-10 lg:px-16">
        <HeaderNav items={NAV_ITEMS_LEFT} className="hidden lg:flex" />

        <Link
          href="/"
          className="font-condensed text-2xl font-700 tracking-tight text-text-hi"
          style={{ fontFamily: 'var(--font-condensed)', fontWeight: 700 }}
        >
          APEX
        </Link>

        <HeaderNav items={NAV_ITEMS_RIGHT} className="hidden lg:flex" />

        {/* md-only (pre-lg) fallback: single flat list, logo stays left. */}
        <HeaderNav items={[...NAV_ITEMS_LEFT, ...NAV_ITEMS_RIGHT]} className="flex lg:hidden" />
      </div>
    </header>
  );
}
