'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';

// The brand in the center links Home, so the nav is split into two flanks
// around it: this gives the "logo centered, pages either side" layout that
// holds on both desktop and mobile (no hamburger, all routes always visible).
const leftLinks = [
  { href: '/anthology', label: 'Anthology' },
  { href: '/news', label: 'News' },
  { href: '/circuits', label: 'Circuits' },
];

const rightLinks = [
  { href: '/season', label: 'Season' },
  { href: '/tech-glossary', label: 'Glossary' },
];

function isActive(pathname: string, href: string): boolean {
  if (href === '/') return pathname === '/';
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function SiteNav() {
  const pathname = usePathname() ?? '/';
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = (): void => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <header className={`site-nav ${scrolled ? 'scrolled' : ''}`}>
      <div className="site-nav-inner">
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

        <Link href="/" className="brand" aria-label="Home">
          <span className="brand-top">FORMULA 1</span>
          <span className="brand-main">HOME</span>
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
      </div>
    </header>
  );
}
