'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import type { NavItem } from './nav-items';

/** Desktop nav links with active-route highlight (client: needs usePathname). */
export function HeaderNav({ items, className = 'hidden items-center gap-7 md:flex' }: { items: NavItem[]; className?: string }) {
  const pathname = usePathname();
  // prefetch={false} on every Link prevents the aggressive viewport-based RSC
  // pre-fetch that fires on page load and causes ERR_ABORTED + wasted bandwidth.
  // Intent is signalled on hover instead, which is early enough to feel instant.
  const router = useRouter();

  return (
    <nav className={['items-center gap-7', className].join(' ')}>
      {items.map((item) => {
        const active = pathname === item.href || pathname.startsWith(item.href + '/');
        return (
          <Link
            key={item.href}
            href={item.href}
            prefetch={false}
            onMouseEnter={() => router.prefetch(item.href)}
            aria-current={active ? 'page' : undefined}
            className={[
              'label-caps relative py-1 transition-colors',
              active ? 'text-text-hi' : 'text-text-mid hover:text-text',
            ].join(' ')}
          >
            {item.label}
            {active ? (
              <span className="absolute inset-x-0 -bottom-px h-0.5 bg-accent" aria-hidden />
            ) : null}
          </Link>
        );
      })}
    </nav>
  );
}
