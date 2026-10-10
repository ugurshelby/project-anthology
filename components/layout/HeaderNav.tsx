'use client';

import type { CSSProperties } from 'react';
import { Link } from '@/i18n/routing';
import { usePathname, useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { desktopNavSlots, isNavItemActive, type NavItem } from './nav-items';
import { LocaleSwitcher } from './LocaleSwitcher';

/**
 * Desktop/tablet header navigation (md+). Layout rules: docs/design/apex-component-rules.md §1.
 *
 * - APEX (Home) is always at the horizontal centre of the header AND the page:
 *   both flanks are `minmax(0,1fr)` and both edge columns have the same fixed
 *   width (the right one holds the language switcher, the left one is empty).
 * - One spacing unit G (`--nav-g`) is used for the outer padding and for every
 *   gap between columns, so page edge → switcher → pages → logo are equal.
 * - Every page slot has the same width; an odd page count leaves the outermost
 *   right slot empty instead of shifting the logo.
 * - md–xl: two rows (logo + switcher, then the slots split around the centre);
 *   xl+: one row.
 */

const EDGE_WIDTH = '5.75rem';
const LOGO_WIDTH = '7.5rem';

export function HeaderNav() {
  const pathname = usePathname();
  const { left, right } = desktopNavSlots();
  const homeActive = isNavItemActive(pathname, '/');

  const sideGrid = (count: number): CSSProperties => ({
    gridTemplateColumns: `repeat(${count}, minmax(0, 1fr))`,
  });

  return (
    <div
      className="mx-auto w-full max-w-[var(--container-max)] px-[var(--nav-g)] [--nav-g:1.25rem] lg:[--nav-g:2rem] xl:[--nav-g:2.5rem]"
    >
      {/* xl+: single row — edge | left pages | APEX | right pages | edge (language) */}
      <div
        className="hidden h-16 items-center gap-x-[var(--nav-g)] xl:grid"
        style={{ gridTemplateColumns: `${EDGE_WIDTH} minmax(0,1fr) ${LOGO_WIDTH} minmax(0,1fr) ${EDGE_WIDTH}` }}
      >
        <span aria-hidden />
        <NavSlots slots={left} style={sideGrid(left.length)} />
        <HomeLink active={homeActive} />
        <NavSlots slots={right} style={sideGrid(right.length)} />
        <LanguageEdge />
      </div>

      {/* md–xl: row 1 = edge | APEX | edge (language); row 2 = pages split around the centre */}
      <div className="xl:hidden">
        <div
          className="grid h-14 items-center gap-x-[var(--nav-g)]"
          style={{ gridTemplateColumns: `${EDGE_WIDTH} minmax(0,1fr) ${EDGE_WIDTH}` }}
        >
          <span aria-hidden />
          <div className="flex justify-center">
            <HomeLink active={homeActive} />
          </div>
          <LanguageEdge />
        </div>
        <div className="grid h-10 grid-cols-2 items-center gap-x-[var(--nav-g)]">
          <NavSlots slots={left} style={sideGrid(left.length)} />
          <NavSlots slots={right} style={sideGrid(right.length)} />
        </div>
      </div>
    </div>
  );
}

function HomeLink({ active }: { active: boolean }) {
  const t = useTranslations('system');
  const tn = useTranslations('nav');
  return (
    <Link
      href="/"
      aria-current={active ? 'page' : undefined}
      aria-label={`APEX — ${tn('home')}`}
      className={[
        'group flex flex-col items-center justify-center rounded-[var(--radius-chip)] border px-4 py-1 leading-none transition-colors duration-150',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent',
        active
          ? 'border-accent/50 bg-accent/15'
          : 'border-transparent hover:border-hairline hover:bg-surface-raised/60',
      ].join(' ')}
      style={{ width: LOGO_WIDTH }}
    >
      <span
        className={[
          'font-condensed text-2xl font-bold tracking-tight transition-colors duration-150',
          active ? 'text-accent' : 'text-text-hi group-hover:text-accent',
        ].join(' ')}
        style={{ fontFamily: 'var(--font-condensed)', fontWeight: 700 }}
      >
        APEX
      </span>
      <span className={['label-caps mt-0.5 text-[10px] tracking-[0.22em]', active ? 'text-text-hi' : 'text-text-mid'].join(' ')}>
        {t('archive')}
      </span>
    </Link>
  );
}

function NavSlots({ slots, style }: { slots: (NavItem | null)[]; style: CSSProperties }) {
  const pathname = usePathname();
  const t = useTranslations('nav');
  const router = useRouter();

  return (
    <ul className="grid h-full items-stretch" style={style}>
      {slots.map((item, i) =>
        item ? (
          <li key={item.href} className="min-w-0">
            <Link
              href={item.href}
              prefetch={false}
              onMouseEnter={() => router.prefetch(item.href)}
              aria-current={isNavItemActive(pathname, item.href) ? 'page' : undefined}
              className={[
                'label-caps group relative flex h-full w-full items-center justify-center whitespace-nowrap px-1 text-[11px] transition-colors duration-150',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-accent',
                isNavItemActive(pathname, item.href) ? 'text-accent' : 'text-text-mid hover:text-text-hi',
              ].join(' ')}
            >
              {item.key ? t(item.key) : item.label}
              <span
                aria-hidden
                className={[
                  'absolute inset-x-3 bottom-0 h-0.5 rounded-full transition-all duration-150',
                  isNavItemActive(pathname, item.href)
                    ? 'bg-accent opacity-100'
                    : 'bg-text-mid opacity-0 group-hover:opacity-40',
                ].join(' ')}
              />
            </Link>
          </li>
        ) : (
          <li key={`empty-${i}`} aria-hidden />
        ),
      )}
    </ul>
  );
}

/** Right edge column: language switcher, set apart from the pages by a hairline. */
function LanguageEdge() {
  return (
    <div className="flex h-full items-center justify-end gap-3">
      <span aria-hidden className="h-6 w-px bg-hairline" />
      <LocaleSwitcher />
    </div>
  );
}
