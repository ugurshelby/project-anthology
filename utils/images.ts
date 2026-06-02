import { getMobileOptimizedImage, getDesktopOptimizedImage } from './optimizedImages';

// Generate mobile-optimized image path (now uses optimized PNG files)
export const mobileWebpOf = (src: string, layout: 'full' | 'landscape' | 'portrait' | 'hero' = 'landscape') => {
  if (!src) return '';
  // Use optimized PNG images from layout-specific folders
  return getMobileOptimizedImage(src, layout);
};

export const defaultSizes = {
  archive: '100vw',
  modal: '100vw'
};

export const aspectForLayout = (layout: 'full' | 'portrait' | 'landscape') => {
  if (layout === 'portrait') return { width: 1200, height: 1600 };
  return { width: 1600, height: 900 };
};
