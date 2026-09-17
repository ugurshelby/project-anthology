import Link from 'next/link';
import { NAV_ITEMS_LEFT, NAV_ITEMS_RIGHT } from './nav-items';
import { HeaderNav } from './HeaderNav';

/**
 * Sticky header — desktop/tablet only (md+). Mobile navigation lives entirely
 * in MobileNav's bottom tab-bar; this header is hidden below md on every page
 * (not just home) so it never doubles up with the tab-bar or shows an
 * empty logo-only strip on pages without a Poster Dense hero.
 *
 * Desktop layout is symmetric around the APEX logo (2026-07 redesign): three
 * nav items either side — Season · Grid · Circuits | APEX | News · Anthology ·
 * Glossary — so the logo reads as the true center of the page, not a
 * left-aligned corner mark.
 */
export function SiteHeader() {
  return (
    <header className="sticky top-0 z-30 hidden border-b border-white/[0.1] bg-bg/85 backdrop-blur-xl md:block">
      <div className="mx-auto flex h-16 w-full max-w-[var(--container-max)] items-center justify-between px-5 md:px-8 lg:justify-center lg:gap-10 lg:px-16">
        <HeaderNav items={NAV_ITEMS_LEFT} className="hidden lg:flex" />

        <Link
          href="/"
          className="flex flex-col items-start leading-none lg:items-center"
        >
          <span
            className="font-condensed text-2xl font-700 tracking-tight text-text-hi"
            style={{ fontFamily: 'var(--font-condensed)', fontWeight: 700 }}
          >
            APEX
          </span>
          <span className="label-caps mt-0.5 text-[10px] tracking-[0.22em] text-text-mid">
            ARCHIVE
          </span>
        </Link>

        <HeaderNav items={NAV_ITEMS_RIGHT} className="hidden lg:flex" />

        {/* md-only (pre-lg) fallback: single flat list, logo stays left. Hidden below md — this header is desktop/tablet-only, mobile uses MobileNav's bottom tab-bar instead. */}
        <HeaderNav items={[...NAV_ITEMS_LEFT, ...NAV_ITEMS_RIGHT]} className="hidden md:flex lg:hidden" />
      </div>
    </header>
  );
}
