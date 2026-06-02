/**
 * Image Preloader Utility
 * Preloads critical images for instant display
 */

interface PreloadOptions {
  priority?: 'high' | 'low' | 'auto';
  fetchPriority?: 'high' | 'low' | 'auto';
  as?: 'image' | 'fetch';
  crossorigin?: 'anonymous' | 'use-credentials';
}

class ImagePreloader {
  private preloadedImages = new Set<string>();
  private preloadLinks: HTMLLinkElement[] = [];

  /**
   * Preload a single image
   */
  preloadImage(src: string, options: PreloadOptions = {}): Promise<void> {
    return new Promise((resolve, reject) => {
      // Skip if already preloaded
      if (this.preloadedImages.has(src)) {
        resolve();
        return;
      }

      // Create link element for preloading
      const link = document.createElement('link');
      link.rel = 'preload';
      link.setAttribute('as', options.as || 'image');
      link.href = src;
      
      if (options.fetchPriority) {
        link.setAttribute('fetchpriority', options.fetchPriority);
      }
      
      if (options.crossorigin) {
        link.setAttribute('crossorigin', options.crossorigin);
      }

      // Also preload via Image object for browser cache
      const img = new Image();
      
      let resolved = false;
      const cleanup = () => {
        if (resolved) return; // Prevent double resolution
        resolved = true;
        this.preloadedImages.add(src);
        // Safely remove link if it's still in the DOM
        if (link.parentNode === document.head) {
          document.head.removeChild(link);
        }
        resolve();
      };

      link.onload = cleanup;
      link.onerror = () => {
        // Safely remove link if it's still in the DOM
        if (link.parentNode === document.head) {
          document.head.removeChild(link);
        }
        // Still resolve - image might load later
        resolve();
      };

      img.onload = cleanup;
      img.onerror = () => {
        // Still resolve - might be CORS or other issue
        resolve();
      };

      // Add to DOM
      document.head.appendChild(link);
      this.preloadLinks.push(link);
      
      // Start loading
      img.src = src;
    });
  }

  /**
   * Preload multiple images in parallel
   */
  async preloadImages(sources: string[], options: PreloadOptions = {}): Promise<void> {
    const promises = sources.map(src => this.preloadImage(src, options));
    await Promise.allSettled(promises);
  }

  /**
   * Preload critical above-the-fold images
   */
  preloadCriticalImages(sources: string[]): void {
    sources.forEach((src, index) => {
      this.preloadImage(src, {
        priority: 'high',
        fetchPriority: index < 3 ? 'high' : 'auto',
      });
    });
  }

  /**
   * Cleanup preload links
   */
  cleanup(): void {
    this.preloadLinks.forEach(link => {
      // Safely remove link if it's still in the DOM
      if (link.parentNode === document.head) {
        document.head.removeChild(link);
      }
    });
    this.preloadLinks = [];
  }
}

export const imagePreloader = new ImagePreloader();

/**
 * Preload hero images for stories
 */
export const preloadStoryHeroes = (heroImages: string[]): void => {
  // Preload first 3 hero images immediately (above-the-fold)
  const critical = heroImages.slice(0, 3);
  imagePreloader.preloadCriticalImages(critical);
  
  // Preload rest with lower priority
  const rest = heroImages.slice(3, 6);
  rest.forEach(src => {
    imagePreloader.preloadImage(src, { fetchPriority: 'low' });
  });
};

/**
 * Preload image when it enters viewport (Intersection Observer)
 */
export const preloadOnVisible = (
  element: HTMLElement,
  imageSrc: string,
  options: PreloadOptions = {}
): (() => void) => {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          imagePreloader.preloadImage(imageSrc, options);
          observer.disconnect();
        }
      });
    },
    {
      rootMargin: '200px', // Start loading 200px before visible
    }
  );

  observer.observe(element);
  
  return () => observer.disconnect();
};
