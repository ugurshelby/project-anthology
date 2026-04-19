import { test, expect } from '@playwright/test';
import { clickWhenReady, gotoHome } from './_helpers';

test('menu opens and navigates to News', async ({ page }) => {
  await gotoHome(page);

  const menuButton = page.getByTestId('menu-button');
  await expect(menuButton).toBeVisible();
  await clickWhenReady(menuButton);

  // Menu panel should appear
  const newsButton = page.getByRole('button', { name: /^news$/i });
  await expect(newsButton).toBeVisible();
  await clickWhenReady(newsButton);

  // News page header
  await expect(page.getByRole('heading', { name: /f1\s+news/i })).toBeVisible();
});

