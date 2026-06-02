/**
 * Logger utility for production-safe logging
 * In production, only errors are logged unless DEBUG mode is enabled
 */

import { errorTracker } from './errorTracker';

const isDevelopment = import.meta.env.DEV;
const isDebugMode = import.meta.env.VITE_DEBUG === 'true';

export const logger = {
  log: (...args: unknown[]) => {
    if (isDevelopment || isDebugMode) {
      console.log(...args);
    }
  },
  
  warn: (...args: unknown[]) => {
    if (isDevelopment || isDebugMode) {
      console.warn(...args);
    }
  },
  
  error: (...args: unknown[]) => {
    // Always log errors, even in production
    console.error(...args);
    
    // Track errors in production
    if (import.meta.env.PROD && args[0] instanceof Error) {
      errorTracker.captureError(args[0], {
        additionalArgs: args.slice(1),
        timestamp: new Date().toISOString(),
        url: typeof window !== 'undefined' ? window.location.href : undefined,
      });
    } else if (import.meta.env.PROD && typeof args[0] === 'string') {
      errorTracker.captureMessage(args[0], 'error', {
        additionalArgs: args.slice(1),
        timestamp: new Date().toISOString(),
        url: typeof window !== 'undefined' ? window.location.href : undefined,
      });
    }
  },
  
  info: (...args: unknown[]) => {
    if (isDevelopment || isDebugMode) {
      console.info(...args);
    }
  },
};
