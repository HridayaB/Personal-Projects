import { test, expect } from '@playwright/test'

test.describe('Get Started', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/get-started')
  })

  test('should display the get started page', async ({ page }) => {
    await expect(page).toHaveURL('/get-started')
  })

  test('get started page should have a functioning dark mode toggle', async ({ page }) => {
    const darkModeToggle = page.locator('#dark-mode-toggle')
    await darkModeToggle.check()
    await expect(darkModeToggle).toBeChecked()
    await expect(page.locator('get-started-page')).toHaveCSS('background-color', 'rgb(0, 0, 0)')
    await darkModeToggle.uncheck()
    await expect(darkModeToggle).not.toBeChecked()
    await expect(page.locator('get-started-page')).toHaveCSS('background-color', 'rgb(255, 255, 255)')
  })

  test('get started page should have icons on the link buttons', async ({ page }) => {
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

  test('get started page should have decorative icons for each tracker group', async ({ page }) => {
    await page.addStyleTag({
      content: '.pet-food-icons svg { transition: none !important; }'
    })
    const foodLink = page.locator('#get-started-link')
    const foodIcons = page.locator('.pet-food-icons svg')
    await foodLink.hover()
    await expect(foodIcons).toHaveCount(5)
    for (let i = 0; i < 5; i++) {
      await expect(foodIcons.nth(i)).toHaveCSS('opacity', '1')
    }
  })

  test('the decorative icons for each tracker group should be initially transparent', async ({ page }) => {
    const foodIcons = page.locator('.pet-food-icons svg')
    await expect(foodIcons).toHaveCount(5)
    for (let i = 0; i < 5; i++) {
      await expect(foodIcons.nth(i)).toHaveCSS('opacity', '0')
    }
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
    await page.addStyleTag({
      content: `.pet-food-icons svg, .pet-treat-icons svg {transition: none !important;}`
    })
    const foodLink = page.locator('#daily-food-tracker-link')
    const foodIcons = page.locator('.pet-food-icons svg')
    const treatIcons = page.locator('.pet-treat-icons svg')
    await foodLink.hover()
    for (let i = 0; i < 5; i++) {
      await expect(foodIcons.nth(i)).toHaveCSS('opacity', '1')
      await expect(treatIcons.nth(i)).toHaveCSS('opacity', '0')
    }
  })


  test('decorative icons have staggered animation delays', async ({ page }) => {
    const foodContainer = page.locator('.food-tracker-container')
    const foodIcons = page.locator('.pet-food-icons svg')
    await foodContainer.hover()
    const expectedDelays = [0, 70, 140, 210, 280]
    for (let i = 0; i < expectedDelays.length; i++) {
      const delay = await foodIcons.nth(i).evaluate((svg) => {
        const transitionDelay = svg.ownerDocument.defaultView!.getComputedStyle(svg).transitionDelay
        return parseFloat(transitionDelay) * (
          transitionDelay.includes('ms') ? 1 : 1000
        )
      })
      expect(delay).toBe(expectedDelays[i])
    }
  })
})
