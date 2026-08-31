'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { MOBILE_MORE_HREFS, MOBILE_MORE_ITEMS, MOBILE_NAV_ITEMS } from './nav-items';
import { NavIcon } from './NavIcons';

/**
 * Poster Dense mobile tab-bar — 4 primary tabs + a centre "+" that expands
 * into a full-screen grid for the remaining routes (Teams, Circuits, News,
 * Glossary), instead of a cramped list sheet.
 */
export function MobileNav() {
  const pathname = usePathname();
  const [moreOpen, setMoreOpen] = useState(false);
  const [lastPathname, setLastPathname] = useState(pathname);

  // Close the menu on navigation — derived during render (React's recommended
  // pattern) rather than in an effect, since it only reacts to a prop change.
  if (pathname !== lastPathname) {
    setLastPathname(pathname);
    if (moreOpen) setMoreOpen(false);
  }

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

  // Prevent background scroll while the full-screen more menu is open.
  useEffect(() => {
    if (!moreOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, [moreOpen]);

  return (
    <>
      {moreOpen ? (
        <div
          role="menu"
          aria-label="More"
          className="fixed inset-0 z-40 flex flex-col justify-end bg-bg/90 backdrop-blur-2xl md:hidden animate-[fadeIn_180ms_ease-out]"
        >
          <button
            type="button"
            aria-label="Close menu"
            className="absolute inset-0"
            onClick={() => setMoreOpen(false)}
          />
          <div className="relative z-10 grid grid-cols-2 gap-3 px-5 pb-32">
            {MOBILE_MORE_ITEMS.map((item, i) => {
              const active = pathname === item.href || pathname.startsWith(item.href + '/');
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  role="menuitem"
                  aria-current={active ? 'page' : undefined}
                  className={[
                    'group flex aspect-square flex-col items-center justify-center gap-2.5 rounded-[var(--radius-lg)] border transition-colors',
                    active
                      ? 'border-accent/40 bg-accent/15 text-text-hi'
                      : 'border-hairline bg-surface text-text-mid hover:bg-surface-raised hover:text-text-hi',
                  ].join(' ')}
                  style={{
                    animation: `moreItemIn 260ms cubic-bezier(0.32,0.72,0,1) both`,
                    animationDelay: `${i * 45}ms`,
                  }}
                >
                  <NavIcon icon={item.icon!} className="h-7 w-7" />
                  <span className="label-caps">{item.label}</span>
                </Link>
              );
            })}
          </div>
        </div>
      ) : null}

      <nav
        className="fixed inset-x-0 bottom-0 z-50 border-t border-white/[0.06] bg-bg/80 backdrop-blur-2xl md:hidden"
        style={{
          paddingBottom: 'max(10px, env(safe-area-inset-bottom))',
          boxShadow: '0 -1px 0 rgba(255,255,255,0.04), 0 -12px 32px -8px rgba(0,0,0,0.5)',
        }}
        aria-label="Primary"
      >
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
                  aria-current={active ? 'page' : undefined}
                  className={[
                    'label-caps mx-auto flex h-11 max-w-[4.5rem] flex-col items-center justify-center gap-0.5 rounded-full px-2 transition-all duration-150 active:scale-90',
                    active ? 'text-text-hi' : 'text-text-mid',
                  ].join(' ')}
                  style={
                    active
                      ? { background: 'linear-gradient(180deg, var(--accent), color-mix(in srgb, var(--accent) 80%, black))' }
                      : undefined
                  }
                >
                  <NavIcon icon={item.icon!} className="h-4.5 w-4.5" />
                  <span className="text-[10px]">{item.label}</span>
                </Link>
              </li>
            );
          })}
          <li className="flex-1">
            <button
              type="button"
              aria-expanded={moreOpen}
              aria-haspopup="menu"
              aria-label={moreOpen ? 'Close menu' : 'More'}
              onClick={() => setMoreOpen((o) => !o)}
              className="mx-auto flex h-12 w-12 items-center justify-center rounded-full text-text-hi shadow-lg transition-all duration-200 active:scale-90"
              style={{
                background: moreActive || moreOpen
                  ? 'linear-gradient(180deg, var(--accent), color-mix(in srgb, var(--accent) 80%, black))'
                  : 'linear-gradient(180deg, var(--surface-raised), var(--surface))',
                boxShadow: moreActive || moreOpen
                  ? '0 4px 16px -2px color-mix(in srgb, var(--accent) 50%, transparent)'
                  : '0 2px 8px -2px rgba(0,0,0,0.4)',
                transform: 'translateY(-4px)',
              }}
            >
              <PlusIcon open={moreOpen} />
            </button>
          </li>
        </ul>
      </nav>
    </>
  );
}

function PlusIcon({ open }: { open: boolean }) {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      aria-hidden
    >
      <path
        d="M12 5v14"
        style={{ transition: 'transform 220ms cubic-bezier(0.32,0.72,0,1)', transform: open ? 'rotate(45deg)' : 'rotate(0deg)', transformOrigin: 'center' }}
      />
      <path
        d="M5 12h14"
        style={{ transition: 'transform 220ms cubic-bezier(0.32,0.72,0,1)', transform: open ? 'rotate(45deg)' : 'rotate(0deg)', transformOrigin: 'center' }}
      />
    </svg>
  );
}
