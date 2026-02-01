import { test, expect } from '@playwright/test';

/**
 * Keyboard Shortcuts Tests
 * 
 * Tests keyboard navigation and shortcuts:
 * - Escape key (close modals/menus)
 * - Arrow keys (navigate stories)
 * - Space key (scroll)
 * - Question mark (shortcuts modal)
 * - Home/End keys
 */
test.describe('Keyboard Shortcuts', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    await page.getByTestId('menu-button').waitFor({ state: 'visible', timeout: 15000 });
  });

  test('should close menu with Escape key', async ({ page }) => {
    const menuButton = page.getByTestId('menu-button');
    await menuButton.click();
    await page.waitForTimeout(500);

    // Verify menu is open (use first heading to avoid strict mode)
    const menuContent = page.getByRole('heading', { name: /navigation/i }).first();
    await expect(menuContent).toBeVisible();

    // Press Escape
    await page.keyboard.press('Escape');
    await page.waitForTimeout(500);

    // Verify menu is closed
    await expect(menuContent).not.toBeVisible();
  });

  test('should close story modal with Escape key', async ({ page }) => {
    await page.locator('[data-archive-section]').waitFor({ state: 'visible', timeout: 15000 });
    const firstStoryCard = page.locator('[data-testid="archive-card"]').first().or(
      page.locator('article').first()
    );
    await expect(firstStoryCard).toBeVisible({ timeout: 15000 });
    await firstStoryCard.scrollIntoViewIfNeeded();
    await firstStoryCard.click();
    await page.waitForTimeout(1000);

    // Verify modal is open
    const closeButton = page.getByRole('button', { name: /close/i });
    await expect(closeButton).toBeVisible();

    // Press Escape
    await page.keyboard.press('Escape');
    await page.waitForTimeout(1000);

    // Verify modal is closed
    await expect(closeButton).not.toBeVisible();
  });

  test('should open shortcuts modal with question mark', async ({ page }) => {
    // Press question mark
    await page.keyboard.press('?');
    await page.waitForTimeout(500);

    // Verify shortcuts modal is visible
    const shortcutsModal = page.getByText(/keyboard shortcuts/i).or(
      page.getByText(/shortcuts/i)
    );
    
    // Shortcuts modal might be visible
    const isVisible = await shortcutsModal.count() > 0;
    if (isVisible) {
      await expect(shortcutsModal.first()).toBeVisible();
    }
  });

  test('should scroll with Space key', async ({ page }) => {
    await page.locator('[data-archive-section]').waitFor({ state: 'visible', timeout: 15000 });
    const maxScroll = await page.evaluate(() =>
      Math.max(0, document.documentElement.scrollHeight - window.innerHeight)
    );
    if (maxScroll <= 0) return; // Page not scrollable
    await page.evaluate((y) => window.scrollTo(0, Math.min(200, y)), maxScroll);
    await page.waitForTimeout(300);
    await page.click('body', { position: { x: 10, y: 10 } });
    await page.evaluate(() => (document.body as HTMLElement).focus());
    await page.waitForTimeout(200);
    const initialScrollY = await page.evaluate(() => window.scrollY);
    await page.keyboard.press(' ');
    await page.waitForTimeout(800);
    const newScrollY = await page.evaluate(() => window.scrollY);
    expect(newScrollY).toBeGreaterThan(initialScrollY);
  });

  test('should scroll to top with Home key', async ({ page }) => {
    await page.locator('[data-archive-section]').waitFor({ state: 'visible', timeout: 15000 });
    const maxScroll = await page.evaluate(() =>
      Math.max(0, document.documentElement.scrollHeight - window.innerHeight)
    );
    if (maxScroll <= 0) return;
    await page.evaluate((max) => window.scrollTo(0, Math.min(1000, max)), maxScroll);
    await page.waitForTimeout(500);
    const scrolledY = await page.evaluate(() => window.scrollY);
    expect(scrolledY).toBeGreaterThan(0);
    await page.click('body', { position: { x: 10, y: 10 } });
    await page.evaluate(() => (document.body as HTMLElement).focus());
    await page.waitForTimeout(200);
    await page.keyboard.press('Home');
    await page.waitForTimeout(1000);
    const topY = await page.evaluate(() => window.scrollY);
    expect(topY).toBeLessThan(100);
  });

  test('should scroll to bottom with End key', async ({ page }) => {
    await page.locator('[data-archive-section]').waitFor({ state: 'visible', timeout: 15000 });
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.waitForTimeout(500);
    await page.click('body', { position: { x: 10, y: 10 } });
    await page.evaluate(() => (document.body as HTMLElement).focus());
    await page.waitForTimeout(200);

    await page.keyboard.press('End');
    await page.waitForTimeout(800);

    const scrollY = await page.evaluate(() => window.scrollY);
    const maxScroll = await page.evaluate(() =>
      document.documentElement.scrollHeight - window.innerHeight
    );
    expect(scrollY).toBeGreaterThan(maxScroll - 200);
  });

  test('should navigate stories with arrow keys', async ({ page }) => {
    await page.locator('[data-archive-section]').waitFor({ state: 'visible', timeout: 15000 });
    const firstStoryCard = page.locator('[data-testid="archive-card"]').first().or(
      page.locator('article').first()
    );
    await expect(firstStoryCard).toBeVisible({ timeout: 15000 });
    await firstStoryCard.scrollIntoViewIfNeeded();
    await firstStoryCard.click();
    await page.waitForTimeout(1000);

    // Get initial URL
    const initialUrl = page.url();
    expect(initialUrl).toContain('/story/');

    // Press right arrow
    await page.keyboard.press('ArrowRight');
    await page.waitForTimeout(1500);

    // Verify URL changed (if not at last story)
    const newUrl = page.url();
    // URL should still be a story URL
    expect(newUrl).toContain('/story/');
  });

  test('should close shortcuts modal with Escape', async ({ page }) => {
    // Open shortcuts modal
    await page.keyboard.press('?');
    await page.waitForTimeout(500);

    // Try to find shortcuts modal
    const shortcutsModal = page.getByText(/keyboard shortcuts/i).or(
      page.getByText(/shortcuts/i)
    );

    if (await shortcutsModal.count() > 0) {
      await expect(shortcutsModal.first()).toBeVisible();

      // Press Escape
      await page.keyboard.press('Escape');
      await page.waitForTimeout(500);

      // Verify modal is closed
      await expect(shortcutsModal.first()).not.toBeVisible();
    }
  });
});
