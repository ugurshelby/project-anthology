'use client';

import { useEffect } from 'react';

/**
 * Propagates a team's theme CSS variables to <html> so elements outside the
 * page's <main> (SiteHeader, MobileNav) pick up the same accent — CSS custom
 * properties only cascade downward, and SiteHeader lives in the root layout
 * next to <main>, not inside it. Cleans up on unmount/navigation so leaving
 * a driver/team page restores the global Apex Red accent.
 */
export function PageThemeSync({ vars }: { vars: Record<string, string> }) {
  const key = JSON.stringify(vars);

  // Depend on the serialised value, not the object identity (a new object on
  // every render would re-apply the variables each time).
  useEffect(() => {
    const root = document.documentElement;
    const entries = Object.entries(JSON.parse(key) as Record<string, string>);
    for (const [k, value] of entries) {
      root.style.setProperty(k, value);
    }
    return () => {
      for (const [k] of entries) {
        root.style.removeProperty(k);
      }
    };
  }, [key]);

  return null;
}
