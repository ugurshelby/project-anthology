import { expect, type Locator, type Page } from '@playwright/test';

export async function gotoHome(page: Page) {
  await page.goto('/');
  await expect(page.getByTestId('home-button')).toBeVisible();
}

export async function clickWhenReady(locator: Locator) {
  await expect(locator).toBeVisible();
  // Stabilize Framer Motion “actionability”: wait until it’s not animating opacity/transform changes
  // (Playwright already auto-waits for stable position, but this extra frame wait helps flakiness)
  await locator.scrollIntoViewIfNeeded();
  await locator.page().waitForTimeout(50);
  await locator.click();
}

