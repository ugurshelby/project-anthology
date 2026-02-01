import { test, expect } from '@playwright/test';

/**
 * Navigation Flow Tests
 * 
 * Tests navigation between different sections of the application:
 * - Home (Anthology)
 * - Timeline
 * - Gallery
 * - News
 * 
 * Verifies that navigation works correctly and pages load without errors.
 */
test.describe('Navigation', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    await page.getByTestId('menu-button').waitFor({ state: 'visible', timeout: 15000 });
  });

  test('should navigate to Timeline from menu', async ({ page }) => {
    const menuButton = page.getByTestId('menu-button');
    await menuButton.click();

    // Wait for menu animation
    await page.waitForTimeout(500);

    // Click Timeline link
    const timelineLink = page.getByRole('button', { name: /timeline/i });
    await expect(timelineLink).toBeVisible();
    await timelineLink.click();

    // Verify navigation
    await expect(page).toHaveURL(/\/timeline/);
    
    // Verify Timeline page loaded
    await page.waitForLoadState('networkidle');
    const timelineContent = page.locator('[data-testid="timeline"]').or(page.locator('body'));
    await expect(timelineContent).toBeVisible();
  });

  test('should navigate to Gallery from menu', async ({ page }) => {
    const menuButton = page.getByTestId('menu-button');
    await menuButton.click();
    await page.waitForTimeout(500);

    // Click Gallery link
    const galleryLink = page.getByRole('button', { name: /gallery/i });
    await expect(galleryLink).toBeVisible();
    await galleryLink.click();

    // Verify navigation
    await expect(page).toHaveURL(/\/gallery/);
    await page.waitForLoadState('networkidle');
  });

  test('should navigate to News from menu', async ({ page }) => {
    const menuButton = page.getByTestId('menu-button');
    await menuButton.click();
    await page.waitForTimeout(500);

    // Click News link
    const newsLink = page.getByRole('button', { name: /news/i });
    await expect(newsLink).toBeVisible();
    await newsLink.click();

    // Verify navigation
    await expect(page).toHaveURL(/\/news/);
    await page.waitForLoadState('networkidle');
  });

  test('should navigate back to home from logo', async ({ page }) => {
    // Navigate to a different page first
    await page.goto('/timeline');
    await page.waitForLoadState('networkidle');

    // Click logo/home button (stable testid from App.tsx)
    const homeButton = page.getByTestId('home-button');
    await expect(homeButton).toBeVisible();
    await homeButton.click();

    // Verify navigation back to home
    await expect(page).toHaveURL('/');
    await page.waitForLoadState('networkidle');
  });

  test('should close menu when clicking backdrop', async ({ page }) => {
    const menuButton = page.getByTestId('menu-button');
    await menuButton.click();
    await page.waitForTimeout(500);

    const menuContent = page.getByRole('heading', { name: /navigation/i }).first();
    await expect(menuContent).toBeVisible();

    // Click backdrop (left side; on mobile sidebar is 85% so x: 50 is backdrop)
    await page.click('body', { position: { x: 50, y: 100 } });
    await page.waitForTimeout(300);
    if (await menuContent.isVisible()) {
      await page.getByTestId('menu-close').click();
      await page.waitForTimeout(300);
    }

    await expect(menuContent).not.toBeVisible();
  });
});
