'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useCallback, useEffect, useId, useRef, useState } from 'react';
import { usePrefersReducedMotion } from '@/components/ui/usePrefersReducedMotion';

const leftLinks = [
  { href: '/anthology', label: 'Anthology' },
  { href: '/drivers', label: 'Drivers' },
  { href: '/teams', label: 'Teams' },
];

const rightLinks = [
  { href: '/season', label: 'Season' },
  { href: '/circuits', label: 'Circuits' },
];

const MOBILE_MENU_LINKS = [
  { href: '/drivers', label: 'Drivers' },
  { href: '/teams', label: 'Teams' },
  { href: '/news', label: 'News' },
  { href: '/tech-glossary', label: 'Glossary' },
] as const;

function isActive(pathname: string, href: string): boolean {
  if (href === '/') return pathname === '/';
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function SiteNav() {
  const pathname = usePathname() ?? '/';
  const reducedMotion = usePrefersReducedMotion();
  const menuId = useId();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const closeMenu = useCallback(() => setMenuOpen(false), []);

  useEffect(() => {
    const onScroll = (): void => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    closeMenu();
  }, [pathname, closeMenu]);

  useEffect(() => {
    if (!menuOpen) return;

    const onPointerDown = (event: MouseEvent | TouchEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        closeMenu();
      }
    };

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') closeMenu();
    };

    document.addEventListener('mousedown', onPointerDown);
    document.addEventListener('touchstart', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('mousedown', onPointerDown);
      document.removeEventListener('touchstart', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [menuOpen, closeMenu]);

  return (
    <header className={`site-nav ${scrolled ? 'scrolled' : ''}`}>
      <div className="site-nav-inner">
        <div className="site-nav-mobile-menu" ref={menuRef}>
          <button
            type="button"
            className="site-nav-menu-toggle"
            aria-expanded={menuOpen}
            aria-haspopup="menu"
            aria-controls={menuId}
            aria-label="Open menu"
            onClick={() => setMenuOpen((open) => !open)}
          >
            <span aria-hidden />
            <span aria-hidden />
            <span aria-hidden />
          </button>

          {menuOpen ? (
            <div
              id={menuId}
              role="menu"
              className={`site-nav-mobile-dropdown${reducedMotion ? ' instant' : ''}`}
            >
              {MOBILE_MENU_LINKS.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  role="menuitem"
                  className={`site-nav-mobile-dropdown-link${isActive(pathname, link.href) ? ' active' : ''}`}
                  onClick={closeMenu}
                >
                  {link.label}
                </Link>
              ))}
            </div>
          ) : null}
        </div>

        <nav className="nav-links nav-links-left" aria-label="Primary">
          {leftLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`nav-link ${isActive(pathname, link.href) ? 'active' : ''}`}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <Link href="/" className="brand" aria-label="Apex — Home">
          <svg
            className="brand-mark"
            width="14"
            height="18"
            viewBox="0 0 14 18"
            fill="none"
            aria-hidden="true"
          >
            <path
              d="M6,16 L14,9 L6,2"
              stroke="#ffffff"
              strokeOpacity="0.35"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M0,16 L8,9 L0,2"
              stroke="#ff1801"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          <span className="brand-main">APEX</span>
        </Link>

        <nav className="nav-links nav-links-right" aria-label="Primary">
          {rightLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`nav-link ${isActive(pathname, link.href) ? 'active' : ''}`}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <span className="site-nav-mobile-spacer" aria-hidden />
      </div>
    </header>
  );
}
