'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';

const links = [
  { href: '/', label: 'Home' },
  { href: '/news', label: 'News' },
  { href: '/circuits', label: 'Circuits' },
  { href: '/season', label: 'Season' },
  { href: '/radio', label: 'Radio' },
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
        <Link href="/" className="brand" aria-label="Project Anthology home">
          <div className="brand-top">FORMULA 1</div>
          <div className="brand-main">ANTHOLOGY</div>
        </Link>

        <nav className="nav-links" aria-label="Primary">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`nav-link ${isActive(pathname, link.href) ? 'active' : ''}`}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="menu-icon" aria-hidden>
          <span />
          <span />
          <span />
        </div>
      </div>
    </header>
  );
}

export function MobileBottomNav() {
  const pathname = usePathname() ?? '/';
  const mobileLinks = [
    { href: '/', label: 'Home' },
    { href: '/season', label: 'Season' },
    { href: '/circuits', label: 'Circuits' },
    { href: '/radio', label: 'Radio' },
    { href: '/news', label: 'More' },
  ];

  return (
    <nav className="mobile-bottom-nav" aria-label="Mobile">
      {mobileLinks.map((link) => (
        <Link
          key={link.href}
          href={link.href}
          className={isActive(pathname, link.href) ? 'active' : ''}
        >
          {link.label}
        </Link>
      ))}
    </nav>
  );
}
