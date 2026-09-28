'use client';

import { Link } from '@/i18n/routing';
import { usePathname, useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import type { NavItem } from './nav-items';

/** Desktop nav links with active-route highlight (client: needs usePathname). */
export function HeaderNav({ items, className = 'hidden items-center gap-7 md:flex' }: { items: NavItem[]; className?: string }) {
  const pathname = usePathname();
  const t = useTranslations('nav');
  const router = useRouter();

  return (
    <nav className={['items-center gap-7', className].join(' ')}>
      {items.map((item) => {
        // Strip potential /tr locale prefix when evaluating active link
        const normalizedPath = pathname.replace(/^\/tr(\/|$)/, '$1') || '/';
        const active = normalizedPath === item.href || (item.href !== '/' && normalizedPath.startsWith(item.href + '/'));
        const label = item.key ? t(item.key) : item.label;

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
            {label}
            {active ? (
              <span className="absolute inset-x-0 -bottom-px h-0.5 bg-accent" aria-hidden />
            ) : null}
          </Link>
        );
      })}
    </nav>
  );
}
