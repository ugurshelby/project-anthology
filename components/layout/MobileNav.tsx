'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { MOBILE_MORE_HREFS, MOBILE_MORE_ITEMS, MOBILE_NAV_ITEMS } from './nav-items';
import { NavIcon } from './NavIcons';

/**
 * Floating mobile dock — portaled to document.body so ancestor
 * transform/filter/contain never traps `position: fixed` mid-page.
 */
export function MobileNav() {
  const pathname = usePathname();
  const router = useRouter();
  const [moreOpen, setMoreOpen] = useState(false);
  const [navHidden, setNavHidden] = useState(false);
  const lastScrollY = useRef(0);
  const [lastPathname, setLastPathname] = useState(pathname);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Hide floating dock while scrolling down; reveal on scroll up (reading mode).
  useEffect(() => {
    lastScrollY.current = window.scrollY;
    let ticking = false;
    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      window.requestAnimationFrame(() => {
        const y = window.scrollY;
        const delta = y - lastScrollY.current;
        if (y < 24) {
          setNavHidden(false);
        } else if (delta > 8) {
          setNavHidden(true);
          setMoreOpen(false);
        } else if (delta < -8) {
          setNavHidden(false);
        }
        lastScrollY.current = y;
        ticking = false;
      });
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);


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

  useEffect(() => {
    if (!moreOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, [moreOpen]);

  if (!mounted) return null;

  return createPortal(
    <>
      {moreOpen ? (
        <div
          role="menu"
          aria-label="More"
          className="fixed inset-0 z-[60] flex flex-col justify-end bg-bg/90 backdrop-blur-2xl md:hidden animate-[fadeIn_180ms_ease-out]"
        >
          <button
            type="button"
            aria-label="Close menu"
            className="absolute inset-0"
            onClick={() => setMoreOpen(false)}
          />
          <div className="relative z-10 grid grid-cols-2 gap-3 px-5 pb-36">
            {MOBILE_MORE_ITEMS.map((item, i) => {
              const active =
                pathname === item.href || pathname.startsWith(item.href + '/');
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  prefetch={false}
                  onTouchStart={() => router.prefetch(item.href)}
                  role="menuitem"
                  aria-current={active ? 'page' : undefined}
                  className={[
                    'touch-target group flex min-h-28 flex-col items-center justify-center gap-2.5 rounded-[var(--radius-lg)] border transition-colors',
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
        className={[
          'pointer-events-none fixed bottom-6 left-1/2 z-50 w-[min(100%-1.5rem,28rem)] -translate-x-1/2 transition-transform duration-300 ease-out md:hidden',
          navHidden && !moreOpen ? 'translate-y-[calc(100%+2rem)]' : 'translate-y-0',
        ].join(' ')}
        style={{
          paddingBottom: 'env(safe-area-inset-bottom, 0px)',
        }}
        aria-label="Primary"
      >
        <ul className="pointer-events-auto flex items-center justify-between gap-0.5 rounded-full border border-white/10 bg-black/70 px-1.5 py-1.5 shadow-[0_12px_40px_-8px_rgba(0,0,0,0.65)] backdrop-blur-md">
          {MOBILE_NAV_ITEMS.map((item) => {
            const active =
              item.href === '/'
                ? pathname === '/'
                : pathname === item.href || pathname.startsWith(item.href + '/');
            return (
              <li key={item.href} className="flex-1">
                <Link
                  href={item.href}
                  prefetch={false}
                  onTouchStart={() => router.prefetch(item.href)}
                  aria-current={active ? 'page' : undefined}
                  className={[
                    'touch-target label-caps mx-auto flex min-h-11 w-full max-w-[4.75rem] flex-col items-center justify-center gap-0.5 rounded-full px-1.5 transition-all duration-150 active:scale-95',
                    active ? 'bg-accent text-text-hi' : 'text-text-mid',
                  ].join(' ')}
                >
                  <NavIcon icon={item.icon!} className="h-4 w-4" />
                  <span className="text-[11px] leading-none tracking-wide">{item.label}</span>
                </Link>
              </li>
            );
          })}
          <li className="flex shrink-0 items-center justify-center px-0.5">
            <button
              type="button"
              aria-expanded={moreOpen}
              aria-haspopup="menu"
              aria-label={moreOpen ? 'Close menu' : 'More'}
              onClick={() => setMoreOpen((o) => !o)}
              className="touch-target flex h-11 w-11 items-center justify-center rounded-full text-text-hi transition-all duration-200 active:scale-95"
              style={{
                background:
                  moreActive || moreOpen
                    ? 'linear-gradient(180deg, var(--accent), color-mix(in srgb, var(--accent) 80%, black))'
                    : 'linear-gradient(180deg, var(--surface-raised), var(--surface))',
                boxShadow:
                  moreActive || moreOpen
                    ? '0 4px 16px -2px color-mix(in srgb, var(--accent) 50%, transparent)'
                    : '0 2px 8px -2px rgba(0,0,0,0.4)',
              }}
            >
              <PlusIcon open={moreOpen} />
            </button>
          </li>
        </ul>
      </nav>
    </>,
    document.body,
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
        style={{
          transition: 'transform 220ms cubic-bezier(0.32,0.72,0,1)',
          transform: open ? 'rotate(45deg)' : 'rotate(0deg)',
          transformOrigin: 'center',
        }}
      />
      <path
        d="M5 12h14"
        style={{
          transition: 'transform 220ms cubic-bezier(0.32,0.72,0,1)',
          transform: open ? 'rotate(45deg)' : 'rotate(0deg)',
          transformOrigin: 'center',
        }}
      />
    </svg>
  );
}
