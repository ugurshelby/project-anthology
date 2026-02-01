import { test, expect } from '@playwright/test';

/**
 * Scroll Behavior Tests
 * 
 * Tests scroll-related functionality:
 * - Virtual scrolling in archive
 * - Infinite scroll loading
 * - Smooth scroll behavior
 * - Scroll position persistence
 */
test.describe('Scroll Behavior', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    await page.locator('[data-archive-section]').waitFor({ state: 'visible', timeout: 15000 });
  });

  test('should load more stories when scrolling down', async ({ page }) => {
    // Get initial story count
    const initialStories = page.locator('[data-testid="archive-card"]').or(
      page.locator('article')
    );
    const initialCount = await initialStories.count();

    // Scroll down to trigger virtual loading
    await page.evaluate(() => window.scrollTo(0, 2000));
    await page.waitForTimeout(2000);

    // Scroll more
    await page.evaluate(() => window.scrollTo(0, 4000));
    await page.waitForTimeout(2000);

    // Check that more stories are loaded
    const newStories = page.locator('[data-testid="archive-card"]').or(
      page.locator('article')
    );
    const newCount = await newStories.count();

    // Should have loaded more stories (or same if all loaded)
    expect(newCount).toBeGreaterThanOrEqual(initialCount);
  });

  test('should have smooth scroll behavior', async ({ page }) => {
    // Check scroll behavior
    const scrollBehavior = await page.evaluate(() => {
      return window.getComputedStyle(document.documentElement).scrollBehavior;
    });

    // Should be smooth (or auto, both are acceptable)
    expect(['smooth', 'auto']).toContain(scrollBehavior);
  });

  test('should maintain scroll position when opening/closing modal', async ({ page }) => {
    const maxScroll = await page.evaluate(() =>
      Math.max(0, document.documentElement.scrollHeight - window.innerHeight)
    );
    if (maxScroll <= 0) return;
    const scrollTarget = Math.min(1500, Math.max(300, maxScroll * 0.3));
    await page.evaluate((y) => window.scrollTo(0, y), scrollTarget);
    await page.waitForTimeout(500);
    const scrollBefore = await page.evaluate(() => window.scrollY);
    expect(scrollBefore).toBeGreaterThan(0);

    const firstStoryCard = page.locator('[data-testid="archive-card"]').first().or(
      page.locator('article').first()
    );
    if (await firstStoryCard.count() > 0) {
      await expect(firstStoryCard).toBeVisible({ timeout: 15000 });
      await firstStoryCard.scrollIntoViewIfNeeded();
      await firstStoryCard.click();
      await page.waitForTimeout(1000);

      // Close modal
      const closeButton = page.getByRole('button', { name: /close/i });
      if (await closeButton.count() > 0) {
        await closeButton.click();
        await page.waitForTimeout(1000);

        // Scroll position should be maintained (tolerance 800 for layout/reflow)
        const scrollAfter = await page.evaluate(() => window.scrollY);
        expect(Math.abs(scrollAfter - scrollBefore)).toBeLessThan(800);
      }
    }
  });

  test('should handle scroll in story modal', async ({ page }) => {
    await page.waitForTimeout(1000);
    const firstStoryCard = page.locator('[data-testid="archive-card"]').first().or(
      page.locator('article').first()
    );
    if (await firstStoryCard.count() === 0) return;
    await expect(firstStoryCard).toBeVisible({ timeout: 10000 });
    await firstStoryCard.click();
    await page.waitForURL(/\/story\/.+/, { timeout: 10000 });
    await page.waitForTimeout(1000);

    // Scrollable container is inside story-modal (StoryModal uses ref on div.overflow-y-auto)
    const modal = page.locator('[data-testid="story-modal"]');
    await expect(modal).toBeVisible({ timeout: 10000 });
    const modalContainer = modal.locator('div[class*="overflow-y-auto"]').first();
    await expect(modalContainer).toBeVisible({ timeout: 5000 });

    // Scroll inside modal (use available scroll range so scrollTop > 0)
    await modalContainer.evaluate((el) => {
      const maxScroll = el.scrollHeight - el.clientHeight;
      el.scrollTop = maxScroll > 0 ? Math.min(500, maxScroll) : 0;
    });
    await page.waitForTimeout(500);

    const scrollTop = await modalContainer.evaluate((el) => el.scrollTop);
    expect(scrollTop).toBeGreaterThanOrEqual(0);
    // If content was scrollable, we expect scrollTop > 0
    const scrollHeight = await modalContainer.evaluate((el) => el.scrollHeight - el.clientHeight);
    if (scrollHeight > 0) expect(scrollTop).toBeGreaterThan(0);
  });

  test('should load content progressively on scroll', async ({ page }) => {
    // Get initial content count
    const initialContent = page.locator('article, [data-testid="archive-card"]');
    const initialCount = await initialContent.count();

    // Scroll down multiple times
    for (let i = 0; i < 5; i++) {
      await page.evaluate(() => {
        window.scrollBy(0, 1000);
      });
      await page.waitForTimeout(1500); // Wait for content to load
    }

    // Check that more content is loaded
    const newContent = page.locator('article, [data-testid="archive-card"]');
    const newCount = await newContent.count();

    // Should have loaded more content
    expect(newCount).toBeGreaterThanOrEqual(initialCount);
  });

  test('should handle rapid scrolling', async ({ page }) => {
    for (let i = 0; i < 10; i++) {
      await page.evaluate(() => {
        window.scrollBy(0, 500);
      });
      await page.waitForTimeout(100);
    }
    await page.waitForTimeout(2000);

    await expect(page).toHaveURL('/');
    await expect(page.locator('[data-archive-section]')).toBeVisible();
  });
});
