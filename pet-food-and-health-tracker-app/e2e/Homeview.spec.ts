import { test, expect } from '@playwright/test'

test.describe('HomeView CSS & Layout', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' })
  })

  test('tracker links align horizontally on a wide screen', async ({ page }) => {
    await page.setViewportSize({ width: 1920, height: 1080 })
    const links = page.locator('.tracker-links a')
    await expect(links).toHaveCount(5)
    const firstBox = await links.nth(0).boundingBox()
    expect(firstBox).not.toBeNull()
    for (let i = 1; i < 5; i++) {
      const box = await links.nth(i).boundingBox()
      expect(box).not.toBeNull()
      expect(Math.abs(box!.y - firstBox!.y)).toBeLessThan(2)
    }
  })

  test('dark mode updates page and tracker button colors', async ({ page }) => {
    const darkModeToggle = page.locator('#dark-mode-toggle')
    const darkModeLabel = page.locator('label[for="dark-mode-toggle"]')
    const main = page.locator('main.home-view')
    const foodLink = page.locator('#daily-food-tracker-link')
    await expect(darkModeLabel).toBeVisible()
    await darkModeLabel.click()
    await expect(darkModeToggle).toBeChecked()
    await expect(main).toHaveClass(/dark-mode/)
    await expect(main).toHaveCSS('background-color', 'rgb(36, 36, 36)')
    await expect(foodLink).toHaveCSS('background-color', 'rgb(51, 51, 51)')
  })

  test('each tracker button displays its main icon', async ({ page }) => {
    const links = page.locator('.tracker-links a')
    const icons = page.locator('.tracker-links a > svg')
    await expect(links).toHaveCount(5)
    await expect(icons).toHaveCount(5)
    await expect(icons.nth(0)).toHaveClass(/pet-food-1/)
    await expect(icons.nth(1)).toHaveClass(/pet-treat-1/)
    await expect(icons.nth(2)).toHaveClass(/pet-exercise-1/)
    await expect(icons.nth(3)).toHaveClass(/pet-medicine-1/)
    await expect(icons.nth(4)).toHaveClass(/pet-potty-1/)
    for (let i = 0; i < 5; i++) {
      await expect(icons.nth(i)).toBeVisible()
      await expect(icons.nth(i)).toHaveCSS('width', '30px')
      await expect(icons.nth(i)).toHaveCSS('height', '30px')
    }
  })

  test('food decorative icons are initially transparent', async ({ page }) => {
    const foodIcons = page.locator('.pet-food-icons svg')
    await expect(foodIcons).toHaveCount(5)
    for (let i = 0; i < 5; i++) {
      await expect(foodIcons.nth(i)).toHaveCSS('opacity', '0')
    }
  })

  test('food decorative icons appear when hovering over the food tracker', async ({ page }) => {
    const foodContainer = page.locator('.food-tracker-container')
    const foodIcons = page.locator('.pet-food-icons svg')
    await expect(foodContainer).toBeVisible()
    await expect(foodIcons).toHaveCount(5)
    await foodContainer.hover()
    await expect.poll(
      () => foodIcons.first().evaluate(element => {
        return Number.parseFloat(
          element.ownerDocument.defaultView!.getComputedStyle(element).opacity
        )
      })
    ).toBeGreaterThan(0)
  })

  test('all five tracker groups contain five decorative icons', async ({ page }) => {
    const trackerGroups = [
      '.pet-food-icons',
      '.pet-treat-icons',
      '.pet-exercise-icons',
      '.pet-medicine-icons',
      '.pet-potty-icons'
    ]
    for (const group of trackerGroups) {
      await expect(page.locator(`${group} svg`)).toHaveCount(5)
    }
  })

  test('hovering over one tracker does not reveal another tracker icons', async ({ page }) => {
    const foodContainer = page.locator('.food-tracker-container')
    const treatIcons = page.locator('.pet-treat-icons svg')
    await expect(foodContainer).toBeVisible()
    await expect(treatIcons).toHaveCount(5)
    await foodContainer.hover()
    for (let i = 0; i < 5; i++) {
      await expect(treatIcons.nth(i)).toHaveCSS('opacity', '0')
    }
  })

  test('get started link shows underline on hover', async ({ page }) => {
    const link = page.locator('#get-started-link')
    await expect(link).toBeVisible()
    await page.addStyleTag({content: `#get-started-link::after {transition: none !important;}`})
    await link.hover()
    await expect.poll(async () => {
      return await link.evaluate((element) => {
        const pseudo = element.ownerDocument.defaultView!.getComputedStyle(
          element,
          '::after'
        )
        return pseudo.transform
      })
    }).toBe('matrix(1, 0, 0, 1, 0, 0)')
  })
})
