'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { MOBILE_NAV_ITEMS } from './nav-items';

/**
 * Mobile bottom tab-bar (design.md §3.1 — Stitch pattern, approved).
 * Fixed, blurred, active tab uses accent. Hidden on md+ (desktop uses header).
 */
export function MobileNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed inset-x-0 bottom-0 z-30 border-t border-hairline bg-bg/80 backdrop-blur-xl md:hidden">
      <ul className="mx-auto flex max-w-md items-stretch justify-around">
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
                  'label-caps flex h-14 items-center justify-center transition-colors',
                  active ? 'text-accent' : 'text-text-mid',
                ].join(' ')}
              >
                {item.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
