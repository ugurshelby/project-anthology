import { describe, it, expect, beforeEach, vi } from 'vitest';
import { 
  getOptimizedImagePath, 
  getMobileOptimizedImage, 
  getDesktopOptimizedImage,
  getResponsiveSrcSet,
  getResponsiveImageAttributes,
} from './optimizedImages';
import * as imageCDN from './imageCDN';

// Mock imageCDN
vi.mock('./imageCDN', () => ({
  isCDNEnabled: vi.fn(() => false),
  getCDNImageURL: vi.fn((path: string) => path),
}));

describe('optimizedImages', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getOptimizedImagePath', () => {
    it('should return correct path for known image', () => {
      const result = getOptimizedImagePath('/Ayrton_Senna_1988_Canada.jpg', 'hero');
      expect(result).toBe('/images/stories/Landscape 1280x720/1.png');
    });

    it('should return original path for unknown image', () => {
      const result = getOptimizedImagePath('/unknown-image.jpg', 'hero');
      expect(result).toBe('/unknown-image.jpg');
    });

    it('should use correct folder for portrait layout', () => {
      const result = getOptimizedImagePath('/Ayrton_Senna_1988_Canada.jpg', 'portrait');
      expect(result).toBe('/images/stories/Portrait 1280x1707/1.png');
    });

    it('should use correct folder for full layout', () => {
      const result = getOptimizedImagePath('/Ayrton_Senna_1988_Canada.jpg', 'full');
      expect(result).toBe('/images/stories/Full 1280x720/1.png');
    });
  });

  describe('getMobileOptimizedImage', () => {
    it('should return mobile optimized path', () => {
      const result = getMobileOptimizedImage('/Ayrton_Senna_1988_Canada.jpg', 'hero');
      expect(result).toBe('/images/stories/Landscape 1280x720/1.png');
    });
  });

  describe('getDesktopOptimizedImage', () => {
    it('should return desktop optimized path', () => {
      const result = getDesktopOptimizedImage('/Ayrton_Senna_1988_Canada.jpg', 'hero');
      expect(result).toBe('/images/stories/Landscape 1280x720/1.png');
    });
  });

  describe('getResponsiveSrcSet', () => {
    it('should return srcSet for known image', () => {
      const result = getResponsiveSrcSet('/Ayrton_Senna_1988_Canada.jpg', 'hero');
      expect(result).toBe('/images/stories/Landscape 1280x720/1.png 1280w');
    });

    it('should return empty string for unknown image', () => {
      const result = getResponsiveSrcSet('/unknown-image.jpg', 'hero');
      expect(result).toBe('');
    });
  });

  describe('getResponsiveImageAttributes', () => {
    it('should return correct attributes for hero layout', () => {
      const result = getResponsiveImageAttributes('/Ayrton_Senna_1988_Canada.jpg', 'hero');
      expect(result.src).toBe('/images/stories/Landscape 1280x720/1.png');
      expect(result.srcSet).toBe('/images/stories/Landscape 1280x720/1.png 1280w');
      expect(result.sizes).toContain('1280px');
    });

    it('should return correct sizes for portrait layout', () => {
      const result = getResponsiveImageAttributes('/Ayrton_Senna_1988_Canada.jpg', 'portrait');
      expect(result.sizes).toContain('33vw');
    });

    it('should return correct sizes for full layout', () => {
      const result = getResponsiveImageAttributes('/Ayrton_Senna_1988_Canada.jpg', 'full');
      expect(result.sizes).toBe('100vw');
    });
  });
});
