'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const mobileLinks = [
  { href: '/', label: 'Home' },
  { href: '/season', label: 'Season' },
  { href: '/circuits', label: 'Circuits' },
  { href: '/news', label: 'More' },
];

function isActive(pathname: string, href: string): boolean {
  if (href === '/') return pathname === '/';
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function MobileBottomNav() {
  const pathname = usePathname() ?? '/';

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
