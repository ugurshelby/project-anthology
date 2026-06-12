'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useCallback, useEffect, useId, useRef, useState } from 'react';
import { usePrefersReducedMotion } from '@/components/ui/usePrefersReducedMotion';

const PRIMARY_LINKS = [
  { href: '/', label: 'Home', match: (path: string) => path === '/' },
  { href: '/season', label: 'Season', match: (path: string) => path === '/season' || path.startsWith('/season/') },
  { href: '/circuits', label: 'Circuits', match: (path: string) => path === '/circuits' || path.startsWith('/circuits/') },
  {
    href: '/anthology',
    label: 'Anthology',
    match: (path: string) => path === '/anthology' || path.startsWith('/anthology/'),
  },
] as const;

const MORE_LINKS = [
  { href: '/news', label: 'News' },
  { href: '/tech-glossary', label: 'Glossary' },
] as const;

function isMoreActive(pathname: string): boolean {
  return MORE_LINKS.some(
    (link) => pathname === link.href || pathname.startsWith(`${link.href}/`),
  );
}

function NavIcon({ label }: { label: string }) {
  const common = {
    width: 18,
    height: 18,
    viewBox: '0 0 18 18',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 1.5,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
    'aria-hidden': true as const,
  };

  switch (label) {
    case 'Home':
      return (
        <svg {...common}>
          <path d="M3 8.5 9 3l6 5.5V15a1 1 0 0 1-1 1h-4v-5H8v5H4a1 1 0 0 1-1-1V8.5Z" />
        </svg>
      );
    case 'Season':
      return (
        <svg {...common}>
          <circle cx="9" cy="9" r="6.5" />
          <path d="M9 5.5V9l2.5 1.5" />
        </svg>
      );
    case 'Circuits':
      return (
        <svg {...common}>
          <path d="M3.5 12.5c2-4 9-4 11 0" />
          <circle cx="6" cy="7" r="1.25" fill="currentColor" stroke="none" />
          <circle cx="12" cy="7" r="1.25" fill="currentColor" stroke="none" />
        </svg>
      );
    case 'Anthology':
      return (
        <svg {...common}>
          <path d="M4 4.5h10v9H4z" />
          <path d="M7 4.5V13.5M11 4.5V13.5" />
        </svg>
      );
    default:
      return (
        <svg {...common}>
          <circle cx="4.5" cy="9" r="1.25" fill="currentColor" stroke="none" />
          <circle cx="9" cy="9" r="1.25" fill="currentColor" stroke="none" />
          <circle cx="13.5" cy="9" r="1.25" fill="currentColor" stroke="none" />
        </svg>
      );
  }
}

export function MobileBottomNav() {
  const pathname = usePathname() ?? '/';
  const reducedMotion = usePrefersReducedMotion();
  const moreMenuId = useId();
  const [moreOpen, setMoreOpen] = useState(false);
  const moreRef = useRef<HTMLDivElement>(null);

  const closeMore = useCallback(() => setMoreOpen(false), []);

  useEffect(() => {
    closeMore();
  }, [pathname, closeMore]);

  useEffect(() => {
    if (!moreOpen) return;

    const onPointerDown = (event: MouseEvent | TouchEvent) => {
      if (moreRef.current && !moreRef.current.contains(event.target as Node)) {
        closeMore();
      }
    };

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') closeMore();
    };

    document.addEventListener('mousedown', onPointerDown);
    document.addEventListener('touchstart', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('mousedown', onPointerDown);
      document.removeEventListener('touchstart', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [moreOpen, closeMore]);

  const moreActive = isMoreActive(pathname);

  return (
    <nav className="mobile-bottom-nav" aria-label="Mobile primary">
      {PRIMARY_LINKS.map((link) => {
        const active = link.match(pathname);
        return (
          <Link
            key={link.href}
            href={link.href}
            className={`mobile-bottom-nav-item${active ? ' active' : ''}`}
            aria-current={active ? 'page' : undefined}
          >
            {active ? <span className="mobile-bottom-nav-dot" aria-hidden /> : null}
            <NavIcon label={link.label} />
            <span>{link.label}</span>
          </Link>
        );
      })}

      <div className="mobile-bottom-nav-more" ref={moreRef}>
        {moreOpen ? (
          <div
            id={moreMenuId}
            role="menu"
            className={`mobile-bottom-nav-drawer${reducedMotion ? ' instant' : ''}`}
          >
            {MORE_LINKS.map((link) => {
              const active = pathname === link.href || pathname.startsWith(`${link.href}/`);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  role="menuitem"
                  className={`mobile-bottom-nav-drawer-link${active ? ' active' : ''}`}
                  onClick={closeMore}
                >
                  {link.label}
                </Link>
              );
            })}
          </div>
        ) : null}

        <button
          type="button"
          className={`mobile-bottom-nav-item mobile-bottom-nav-more-btn${moreActive ? ' active' : ''}`}
          aria-expanded={moreOpen}
          aria-haspopup="menu"
          aria-controls={moreMenuId}
          onClick={() => setMoreOpen((open) => !open)}
        >
          {moreActive ? <span className="mobile-bottom-nav-dot" aria-hidden /> : null}
          <NavIcon label="More" />
          <span>More</span>
        </button>
      </div>
    </nav>
  );
}
