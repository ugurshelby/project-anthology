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

  useEffect(() => {
    const root = document.documentElement;
    const entries = Object.entries(vars);
    for (const [k, value] of entries) {
      root.style.setProperty(k, value);
    }
    return () => {
      for (const [k] of entries) {
        root.style.removeProperty(k);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  return null;
}
