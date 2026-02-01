/**
 * Performance Monitoring Utility
 * Tracks Web Vitals and custom performance metrics
 */

interface WebVitals {
  lcp?: number; // Largest Contentful Paint
  fid?: number; // First Input Delay
  cls?: number; // Cumulative Layout Shift
  fcp?: number; // First Contentful Paint
  ttfb?: number; // Time to First Byte
}

class PerformanceMonitor {
  private vitals: WebVitals = {};
  private marks: Map<string, number> = new Map();
  private measures: Map<string, number> = new Map();

  constructor() {
    if (typeof window === 'undefined' || !window.performance) {
      return;
    }

    this.initWebVitals();
    this.initCustomMetrics();
  }

  private initWebVitals(): void {
    // LCP - Largest Contentful Paint
    if ('PerformanceObserver' in window) {
      try {
        const lcpObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          const lastEntry = entries[entries.length - 1] as PerformanceEntry & { renderTime?: number; loadTime?: number };
          this.vitals.lcp = lastEntry.renderTime || lastEntry.loadTime || 0;
          this.reportVital('LCP', this.vitals.lcp);
        });
        lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });
      } catch (e) {
        // LCP not supported
      }

      // FID - First Input Delay
      try {
        const fidObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          entries.forEach((entry) => {
            if (entry instanceof PerformanceEventTiming) {
              this.vitals.fid = entry.processingStart - entry.startTime;
              this.reportVital('FID', this.vitals.fid);
              fidObserver.disconnect();
            }
          });
        });
        fidObserver.observe({ entryTypes: ['first-input'] });
      } catch (e) {
        // FID not supported
      }

      // CLS - Cumulative Layout Shift
      try {
        let clsValue = 0;
        const clsObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          entries.forEach((entry) => {
            // Type guard for LayoutShift entry
            if ('hadRecentInput' in entry && 'value' in entry) {
              const layoutShiftEntry = entry as { hadRecentInput: boolean; value: number };
              if (!layoutShiftEntry.hadRecentInput) {
                clsValue += layoutShiftEntry.value;
              }
            }
          });
          this.vitals.cls = clsValue;
          this.reportVital('CLS', this.vitals.cls);
        });
        clsObserver.observe({ entryTypes: ['layout-shift'] });
      } catch (e) {
        // CLS not supported
      }

      // FCP - First Contentful Paint
      try {
        const fcpObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          entries.forEach((entry) => {
            if (entry.name === 'first-contentful-paint') {
              this.vitals.fcp = entry.startTime;
              this.reportVital('FCP', this.vitals.fcp);
              fcpObserver.disconnect();
            }
          });
        });
        fcpObserver.observe({ entryTypes: ['paint'] });
      } catch (e) {
        // FCP not supported
      }

      // TTFB - Time to First Byte
      try {
        const navigationEntry = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
        if (navigationEntry) {
          this.vitals.ttfb = navigationEntry.responseStart - navigationEntry.requestStart;
          this.reportVital('TTFB', this.vitals.ttfb);
        }
      } catch (e) {
        // TTFB not available
      }
    }
  }

  private initCustomMetrics(): void {
    // Mark page load start
    this.mark('page-load-start');
    
    // Measure page load time
    window.addEventListener('load', () => {
      this.mark('page-load-end');
      this.measure('page-load', 'page-load-start', 'page-load-end');
    });
  }

  /**
   * Mark a performance point
   */
  mark(name: string): void {
    if (typeof window === 'undefined' || !window.performance) return;
    
    try {
      performance.mark(name);
      this.marks.set(name, performance.now());
    } catch (e) {
      // Mark failed
    }
  }

  /**
   * Measure between two marks
   */
  measure(name: string, startMark: string, endMark: string): void {
    if (typeof window === 'undefined' || !window.performance) return;
    
    try {
      performance.measure(name, startMark, endMark);
      const measure = performance.getEntriesByName(name, 'measure')[0];
      if (measure) {
        this.measures.set(name, measure.duration);
        this.reportMeasure(name, measure.duration);
      }
    } catch (e) {
      // Measure failed
    }
  }

  /**
   * Get all Web Vitals
   */
  getVitals(): WebVitals {
    return { ...this.vitals };
  }

  /**
   * Get all measures
   */
  getMeasures(): Record<string, number> {
    const result: Record<string, number> = {};
    this.measures.forEach((value, key) => {
      result[key] = value;
    });
    return result;
  }

  /**
   * Report vital to analytics (Vercel Analytics)
   */
  private reportVital(name: string, value: number): void {
    // Only report in production
    if (!import.meta.env.PROD) return;

    // Report to Vercel Analytics if available
    if (typeof window !== 'undefined') {
      const va = (window as { va?: (method: string, event: string, data?: Record<string, unknown>) => void }).va;
      if (va) {
        va('track', `web-vital-${name.toLowerCase()}`, { value });
      }
    }

    // Log for debugging (development only)
    if (import.meta.env.DEV) {
      console.log(`[Performance] ${name}: ${value.toFixed(2)}ms`);
    }
  }

  /**
   * Report custom measure
   */
  private reportMeasure(name: string, duration: number): void {
    // Only report in production
    if (!import.meta.env.PROD) return;

    // Report to Vercel Analytics if available
    if (typeof window !== 'undefined') {
      const va = (window as { va?: (method: string, event: string, data?: Record<string, unknown>) => void }).va;
      if (va) {
        va('track', `performance-${name}`, { duration });
      }
    }

    // Log for debugging (development only)
    if (import.meta.env.DEV) {
      console.log(`[Performance] ${name}: ${duration.toFixed(2)}ms`);
    }
  }
}

export const performanceMonitor = new PerformanceMonitor();
