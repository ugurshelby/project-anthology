import React from 'react';
// Self-hosted fonts via @fontsource. Order matters for LCP: display fonts first,
// then the body face, then secondary weights.
import '@fontsource/bebas-neue/400.css';
import '@fontsource/barlow-condensed/500.css';
import '@fontsource/barlow-condensed/700.css';
import '@fontsource/dm-sans/300.css';
import '@fontsource/dm-sans/400.css';
import '@fontsource/ibm-plex-mono/400.css';
import '@fontsource/ibm-plex-mono/600.css';
import './index.css';
import ReactDOM from 'react-dom/client';
import App from './App';
import { BrowserRouter } from 'react-router-dom';
import { SpeedInsights } from '@vercel/speed-insights/react';
import { Analytics } from '@vercel/analytics/react';
import { performanceMonitor } from './utils/performanceMonitor';

// PWA removed: proactively unregister any previously-installed service worker.
if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
  navigator.serviceWorker.getRegistrations()
    .then((regs) => Promise.allSettled(regs.map((r) => r.unregister())))
    .catch(() => {});

  // Clean up any caches created by the old Workbox/PWA setup.
  if ('caches' in window) {
    caches.keys()
      .then((keys) =>
        Promise.allSettled(
          keys
            .filter((k) => k.startsWith('workbox-') || k === 'news-api' || k === 'cloudinary-images' || k === 'external-images')
            .map((k) => caches.delete(k)),
        ),
      )
      .catch(() => {});
  }
}

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
const isProduction = import.meta.env.PROD && typeof window !== 'undefined' && window.location.hostname !== 'localhost' && !/^10\./.test(window.location.hostname) && window.location.hostname !== '127.0.0.1';

root.render(
  <BrowserRouter
    future={{
      v7_startTransition: true,
      v7_relativeSplatPath: true,
    }}
  >
    <App />
    {isProduction && <SpeedInsights />}
    {isProduction && <Analytics />}
  </BrowserRouter>
);

if (typeof window !== 'undefined') {
  performanceMonitor.mark('app-init-start');
  performanceMonitor.mark('app-init-end');
  performanceMonitor.measure('app-init', 'app-init-start', 'app-init-end');
}
