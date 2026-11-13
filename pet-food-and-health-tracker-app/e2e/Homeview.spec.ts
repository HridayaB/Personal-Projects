import { test, expect } from '@playwright/test'

test.describe('HomeView CSS & Layout', () => {
  test('tracker links align horizontally on a wide screen', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 })
    await page.goto('/')
    const links = page.locator('.tracker-links a')
    await expect(links).toHaveCount(5)
    const firstBox = await links.nth(0).boundingBox()
    expect(firstBox).not.toBeNull()
    for (let i = 1; i < 5; i++) {
      const box = await links.nth(i).boundingBox()
      expect(box?.y).toBeCloseTo(firstBox!.y, 1)
    }
  })

  test('tracker links have block styling and hover border effect', async ({ page }) => {
    await page.goto('/')
    const foodLink = page.locator('#daily-food-tracker-link')
    await expect(foodLink).toHaveCSS('background-color', 'rgb(255, 255, 255)')
    await expect(foodLink).toHaveCSS('border-radius', '10px')
    await expect(foodLink).toHaveCSS('border-color', 'rgb(209, 209, 209)')
    await foodLink.hover()
    await expect(foodLink).toHaveCSS('border-color', 'rgb(153, 54, 56)')
  })

  test('dark mode updates page and tracker block colors', async ({ page }) => {
    await page.goto('/')
    await page.locator('label[for="dark-mode-toggle"]').click()
    const main = page.locator('main.home-view')
    const foodLink = page.locator('#daily-food-tracker-link')
    await expect(main).toHaveCSS('background-color', 'rgb(36, 36, 36)')
    await expect(foodLink).toHaveCSS('background-color', 'rgb(51, 51, 51)')
    await page.addStyleTag({ content: '#daily-food-tracker-link { transition: none !important; }' })
    await foodLink.hover()
    await expect(foodLink).toHaveCSS('background-color', 'rgb(61, 61, 61)')
  })
})
