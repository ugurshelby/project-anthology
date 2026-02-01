import React from 'react';
// Critical fonts - loaded first for LCP optimization
// Order matters: most critical fonts first
import '@fontsource/playfair-display/400.css';
import '@fontsource/playfair-display/700.css';
import '@fontsource/ibm-plex-mono/400.css';
import '@fontsource/inter/400.css';
// Secondary fonts - loaded after critical content
import '@fontsource/inter/300.css';
import '@fontsource/inter/600.css';
import '@fontsource/inter/900.css';
import '@fontsource/ibm-plex-mono/600.css';
import '@fontsource/playfair-display/400-italic.css';
import './index.css';
import ReactDOM from 'react-dom/client';
import App from './App';
import { BrowserRouter } from 'react-router-dom';
import { SpeedInsights } from '@vercel/speed-insights/react';
import { Analytics } from '@vercel/analytics/react';
import { performanceMonitor } from './utils/performanceMonitor';

// Service Worker is automatically registered by VitePWA plugin

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

// Mark app initialization complete
if (typeof window !== 'undefined') {
  performanceMonitor.mark('app-init-start');
  performanceMonitor.mark('app-init-end');
  performanceMonitor.measure('app-init', 'app-init-start', 'app-init-end');
}
