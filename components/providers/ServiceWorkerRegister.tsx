'use client';

import { useEffect } from 'react';

/**
 * Registers the PWA service worker (Faz 2). Renders nothing. Registration is
 * deferred to the `load` event so it never competes with first paint, and is
 * skipped in development to avoid stale-cache surprises during HMR.
 */
export function ServiceWorkerRegister() {
  useEffect(() => {
    if (process.env.NODE_ENV !== 'production') return;
    if (!('serviceWorker' in navigator)) return;

    const register = () => {
      navigator.serviceWorker.register('/sw.js').catch(() => {
        // Registration failures are non-fatal — the app still works online.
      });
    };

    if (document.readyState === 'complete') {
      register();
    } else {
      window.addEventListener('load', register, { once: true });
      return () => window.removeEventListener('load', register);
    }
  }, []);

  return null;
}
