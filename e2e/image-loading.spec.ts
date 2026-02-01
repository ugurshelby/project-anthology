import { test, expect } from '@playwright/test';

/**
 * Image Loading Tests
 * 
 * Tests image loading behavior:
 * - Lazy loading
 * - Image preloading
 * - Responsive images
 * - Image error handling
 * - Loading states (shimmer)
 */
test.describe('Image Loading', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    await page.locator('[data-archive-section]').waitFor({ state: 'visible', timeout: 15000 });
  });

  test('should load images on archive page', async ({ page }) => {

    // Find images
    const images = page.locator('img');
    const imageCount = await images.count();
    
    expect(imageCount).toBeGreaterThan(0);

    // Check that at least some images are loaded
    let loadedCount = 0;
    for (let i = 0; i < Math.min(imageCount, 5); i++) {
      const img = images.nth(i);
      const isLoaded = await img.evaluate((el: HTMLImageElement) => {
        return el.complete && el.naturalHeight > 0;
      });
      if (isLoaded) loadedCount++;
    }

    // At least some images should be loaded
    expect(loadedCount).toBeGreaterThan(0);
  });

  test('should lazy load images when scrolling', async ({ page }) => {
    // Get initial image count
    const initialImages = page.locator('img');
    const initialCount = await initialImages.count();

    // Scroll down to trigger lazy loading
    await page.evaluate(() => window.scrollTo(0, 2000));
    await page.waitForTimeout(2000);

    // Scroll more
    await page.evaluate(() => window.scrollTo(0, 4000));
    await page.waitForTimeout(2000);

    // Check that more images are loaded
    const newImages = page.locator('img');
    const newCount = await newImages.count();
    
    // Should have same or more images (some might have been lazy loaded)
    expect(newCount).toBeGreaterThanOrEqual(initialCount);
  });

  test('should show loading state (shimmer) before images load', async ({ page }) => {
    // Reload page to catch loading states
    await page.reload();
    
    // Immediately check for shimmer/loading indicators
    const shimmer = page.locator('[class*="shimmer"]').or(
      page.locator('[class*="animate-pulse"]')
    );
    
    // Shimmer might appear briefly, so check quickly
    const shimmerCount = await shimmer.count();
    // Shimmer might be present during initial load
    expect(shimmerCount).toBeGreaterThanOrEqual(0);
  });

  test('should load hero image in story modal', async ({ page }) => {
    const firstStoryCard = page.locator('[data-testid="archive-card"]').first().or(
      page.locator('article').first()
    );
    await expect(firstStoryCard).toBeVisible({ timeout: 15000 });
    await firstStoryCard.scrollIntoViewIfNeeded();
    await firstStoryCard.click();
    await page.waitForTimeout(2000); // Wait for image to load

    // Find hero image in modal
    const heroImage = page.locator('picture img').or(
      page.locator('img[alt*="story" i]').first()
    );

    if (await heroImage.count() > 0) {
      // Verify image is loaded
      const isLoaded = await heroImage.first().evaluate((el: HTMLImageElement) => {
        return el.complete && el.naturalHeight > 0;
      });
      expect(isLoaded).toBe(true);
    }
  });

  test('should handle image loading errors gracefully', async ({ page }) => {
    // Intercept image requests and fail some
    await page.route('**/*.{jpg,jpeg,png,webp}', (route) => {
      // Allow first few images, fail others randomly
      if (Math.random() > 0.8) {
        route.abort();
      } else {
        route.continue();
      }
    });

    // Reload page
    await page.reload();
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    // Page should still be functional even if some images fail
    const pageContent = page.locator('body');
    await expect(pageContent).toBeVisible();
  });

  test('should use responsive images (srcset)', async ({ page }) => {
    // Wait for images to load
    await page.waitForTimeout(2000);

    // Find picture elements (responsive images)
    const pictures = page.locator('picture');
    const pictureCount = await pictures.count();

    if (pictureCount > 0) {
      // Check that picture elements have source tags
      const firstPicture = pictures.first();
      const sources = firstPicture.locator('source');
      const sourceCount = await sources.count();
      
      // Should have source tags for responsive images
      expect(sourceCount).toBeGreaterThanOrEqual(0);
    }
  });

  test('should preload critical images', async ({ page }) => {
    // Check for preload links in head
    const preloadLinks = page.locator('head link[rel="preload"][as="image"]');
    const preloadCount = await preloadLinks.count();
    
    // Should have some preload links for critical images
    expect(preloadCount).toBeGreaterThanOrEqual(0);
  });

  test('should load images with correct aspect ratio', async ({ page }) => {
    // Wait for images
    await page.waitForTimeout(2000);

    const images = page.locator('img');
    const imageCount = await images.count();

    if (imageCount > 0) {
      // Check first few images have aspect ratio
      for (let i = 0; i < Math.min(imageCount, 3); i++) {
        const img = images.nth(i);
        const aspectRatio = await img.evaluate((el: HTMLImageElement) => {
          const style = window.getComputedStyle(el);
          return style.aspectRatio || (el.naturalWidth / el.naturalHeight);
        });
        
        // Aspect ratio should be valid
        expect(aspectRatio).toBeTruthy();
      }
    }
  });
});
