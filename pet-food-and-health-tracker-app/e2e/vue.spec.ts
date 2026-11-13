import { test, expect } from '@playwright/test'

test('loads the home view and its default icon', async ({ page }) => {
  await page.goto('/')
  await expect(page.getByRole('heading', { name: 'Pet Food and Health Tracker' })).toBeVisible()
  await expect(page.locator('.sun-icon')).toBeVisible()
})
