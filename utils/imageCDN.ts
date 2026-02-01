/**
 * Image CDN Utility
 * Provides Cloudinary integration for optimized image delivery
 * Falls back to local images if CDN is not configured
 */

interface ImageCDNOptions {
  width?: number;
  height?: number;
  quality?: number;
  format?: 'auto' | 'webp' | 'avif' | 'jpg' | 'png';
  crop?: 'fill' | 'fit' | 'scale' | 'limit';
  gravity?: 'auto' | 'face' | 'center' | 'north' | 'south' | 'east' | 'west';
  fetchFormat?: 'auto' | 'webp' | 'avif';
  dpr?: number; // Device pixel ratio
}

// Cloudinary configuration (from environment variables)
const CLOUDINARY_CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || '';
const CLOUDINARY_ENABLED = Boolean(CLOUDINARY_CLOUD_NAME);
const CLOUDINARY_BASE_URL = `https://res.cloudinary.com/${CLOUDINARY_CLOUD_NAME}/image/upload`;

/**
 * Check if Cloudinary is configured
 */
export const isCDNEnabled = (): boolean => {
  return CLOUDINARY_ENABLED;
};

/**
 * Build Cloudinary transformation URL
 */
function buildCloudinaryURL(
  imagePath: string,
  options: ImageCDNOptions = {}
): string {
  if (!CLOUDINARY_ENABLED) {
    return imagePath; // Return original path if CDN not enabled
  }

  // Extract image path from local path (e.g., /images/Landscape 1280x720/1.png)
  // Cloudinary folder structure should mirror local structure
  const cloudinaryPath = imagePath.replace(/^\//, ''); // Remove leading slash

  const transformations: string[] = [];

  // Quality (default: auto, max 90 for good compression)
  const quality = options.quality || 80;
  transformations.push(`q_${quality}`);

  // Format optimization
  const format = options.format || 'auto';
  if (format === 'auto') {
    transformations.push('f_auto'); // Auto format (WebP/AVIF based on browser)
  } else {
    transformations.push(`f_${format}`);
  }

  // Fetch format (for better compression)
  if (options.fetchFormat) {
    transformations.push(`fl_${options.fetchFormat}`);
  }

  // Width and height
  if (options.width) {
    transformations.push(`w_${options.width}`);
  }
  if (options.height) {
    transformations.push(`h_${options.height}`);
  }

  // Crop mode
  if (options.crop) {
    transformations.push(`c_${options.crop}`);
  }

  // Gravity (for cropping)
  if (options.gravity) {
    transformations.push(`g_${options.gravity}`);
  }

  // DPR (device pixel ratio) for retina displays
  if (options.dpr) {
    transformations.push(`dpr_${options.dpr}`);
  }

  const transformationString = transformations.join(',');
  return `${CLOUDINARY_BASE_URL}/${transformationString}/${cloudinaryPath}`;
}

/**
 * Get optimized image URL from CDN or local fallback
 * @param localPath Local image path (e.g., '/images/Landscape 1280x720/1.png')
 * @param options CDN transformation options
 * @returns CDN URL if enabled, otherwise local path
 */
export function getCDNImageURL(
  localPath: string,
  options: ImageCDNOptions = {}
): string {
  if (!CLOUDINARY_ENABLED) {
    return localPath; // Fallback to local images
  }

  return buildCloudinaryURL(localPath, options);
}

/**
 * Get responsive image srcSet for different screen sizes
 * @param localPath Local image path
 * @param options Base CDN options
 * @returns srcSet string for <img srcSet>
 */
export function getResponsiveSrcSet(
  localPath: string,
  options: ImageCDNOptions = {}
): string {
  if (!CLOUDINARY_ENABLED) {
    return ''; // No srcSet if CDN not enabled
  }

  const widths = [480, 768, 1024, 1280, 1920];
  const srcSetParts = widths.map((width) => {
    const url = buildCloudinaryURL(localPath, {
      ...options,
      width,
      format: 'auto',
    });
    return `${url} ${width}w`;
  });

  return srcSetParts.join(', ');
}

/**
 * Get responsive sizes attribute for <img>
 * @returns sizes string
 */
export function getResponsiveSizes(): string {
  return '(max-width: 480px) 100vw, (max-width: 768px) 100vw, (max-width: 1024px) 100vw, 1280px';
}

/**
 * Get optimized image URL with responsive attributes
 * @param localPath Local image path
 * @param options CDN options
 * @returns Object with src, srcSet, and sizes
 */
export function getResponsiveImage(
  localPath: string,
  options: ImageCDNOptions = {}
): {
  src: string;
  srcSet?: string;
  sizes?: string;
} {
  const src = getCDNImageURL(localPath, {
    ...options,
    width: options.width || 1280, // Default width
    format: 'auto',
  });

  if (!CLOUDINARY_ENABLED) {
    return { src: localPath };
  }

  return {
    src,
    srcSet: getResponsiveSrcSet(localPath, options),
    sizes: getResponsiveSizes(),
  };
}

/**
 * Preload image via CDN
 * @param localPath Local image path
 * @param options CDN options
 */
export function preloadCDNImage(
  localPath: string,
  options: ImageCDNOptions = {}
): void {
  if (!CLOUDINARY_ENABLED) {
    return; // Skip preload if CDN not enabled
  }

  const url = getCDNImageURL(localPath, {
    ...options,
    width: options.width || 1280,
    format: 'auto',
  });

  const link = document.createElement('link');
  link.rel = 'preload';
  link.as = 'image';
  link.href = url;
  if (options.fetchFormat) {
    link.setAttribute('fetchpriority', 'high');
  }
  document.head.appendChild(link);
}
