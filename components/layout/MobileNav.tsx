'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { MOBILE_MORE_HREFS, MOBILE_MORE_ITEMS, MOBILE_NAV_ITEMS } from './nav-items';

/**
 * Poster Dense mobile tab-bar — accent pill active state, safe-area, More sheet.
 */
export function MobileNav() {
  const pathname = usePathname();
  const [moreOpen, setMoreOpen] = useState(false);
  const sheetRef = useRef<HTMLDivElement>(null);

  const moreActive = MOBILE_MORE_HREFS.some(
    (href) => pathname === href || pathname.startsWith(href + '/'),
  );

  useEffect(() => {
    if (!moreOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMoreOpen(false);
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [moreOpen]);

  useEffect(() => {
    setMoreOpen(false);
  }, [pathname]);

  return (
    <>
      {moreOpen ? (
        <button
          type="button"
          aria-label="Close menu"
          className="fixed inset-0 z-40 bg-bg/70 backdrop-blur-sm md:hidden"
          onClick={() => setMoreOpen(false)}
        />
      ) : null}

      <nav
        className="fixed inset-x-0 bottom-0 z-50 border-t border-hairline bg-bg/95 backdrop-blur-xl md:hidden"
        style={{ paddingBottom: 'max(12px, env(safe-area-inset-bottom))' }}
        aria-label="Primary"
      >
        {moreOpen ? (
          <div
            ref={sheetRef}
            className="border-b border-hairline px-4 py-3"
            role="menu"
          >
            <p className="label-caps mb-2 text-text-low">More</p>
            <ul className="grid grid-cols-2 gap-1">
              {MOBILE_MORE_ITEMS.map((item) => {
                const active =
                  pathname === item.href || pathname.startsWith(item.href + '/');
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      role="menuitem"
                      className={[
                        'label-caps flex min-h-11 items-center rounded-[var(--radius)] px-3 transition-colors',
                        active ? 'bg-accent text-text-hi' : 'text-text-mid hover:bg-surface-raised',
                      ].join(' ')}
                    >
                      {item.label}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ) : null}

        <ul className="mx-auto flex max-w-lg items-center justify-around px-1 pt-2">
          {MOBILE_NAV_ITEMS.map((item) => {
            const active =
              item.href === '/'
                ? pathname === '/'
                : pathname === item.href || pathname.startsWith(item.href + '/');
            return (
              <li key={item.href} className="flex-1">
                <Link
                  href={item.href}
                  className={[
                    'label-caps mx-auto flex h-11 max-w-[4.5rem] items-center justify-center rounded-full px-2 transition-colors',
                    active ? 'bg-accent text-text-hi' : 'text-text-mid',
                  ].join(' ')}
                >
                  {item.label}
                </Link>
              </li>
            );
          })}
          <li className="flex-1">
            <button
              type="button"
              aria-expanded={moreOpen}
              aria-haspopup="menu"
              onClick={() => setMoreOpen((o) => !o)}
              className={[
                'label-caps mx-auto flex h-11 max-w-[4.5rem] items-center justify-center rounded-full px-2 transition-colors',
                moreActive || moreOpen ? 'bg-accent text-text-hi' : 'text-text-mid',
              ].join(' ')}
            >
              More
            </button>
          </li>
        </ul>
      </nav>
    </>
  );
}
