import { test, expect } from '@playwright/test';
import { clickWhenReady, gotoHome } from './_helpers';

test('archive card opens story modal and menu button closes it', async ({ page }) => {
  await gotoHome(page);

  const firstCard = page.getByTestId('archive-card').first();
  await clickWhenReady(firstCard);

  const modal = page.getByTestId('story-modal');
  await expect(modal).toBeVisible();

  const menuButton = page.getByTestId('story-modal-menu-button');
  await expect(menuButton).toBeVisible();
  await clickWhenReady(menuButton);

  await expect(modal).toBeHidden();
});

