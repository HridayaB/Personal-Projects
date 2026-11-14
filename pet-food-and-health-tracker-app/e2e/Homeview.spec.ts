import { test, expect } from '@playwright/test'

test.describe('HomeView CSS & Layout', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
  })

  test('tracker links align horizontally on a wide screen', async ({ page }) => {
    await page.setViewportSize({ width: 1920, height: 1080 })
    const links = page.locator('.tracker-links a')
    await expect(links).toHaveCount(5)
    const firstBox = await links.nth(0).boundingBox()
    expect(firstBox).not.toBeNull()
    for (let i = 1; i < 5; i++) {
      const box = await links.nth(i).boundingBox()
      expect(box?.y).toBeCloseTo(firstBox!.y, 1)
    }
  })

  test('tracker links have the correct styling and hover border effect', async ({ page }) => {
    const foodLink = page.locator('#daily-food-tracker-link')
    await expect(foodLink).toHaveCSS('background-color', 'rgb(255, 255, 255)')
    await expect(foodLink).toHaveCSS('border-radius', '10px')
    await expect(foodLink).toHaveCSS('border-color', 'rgb(209, 209, 209)')
    await foodLink.hover()
    await expect(foodLink).toHaveCSS('border-color', 'rgb(153, 54, 56)')
  })

  test('dark mode updates page and tracker button colors', async ({ page }) => {
    await page.locator('label[for="dark-mode-toggle"]').click()
    const main = page.locator('main.home-view')
    const foodLink = page.locator('#daily-food-tracker-link')
    await expect(main).toHaveCSS('background-color', 'rgb(36, 36, 36)')
    await expect(foodLink).toHaveCSS('background-color', 'rgb(51, 51, 51)')
    await page.addStyleTag({
      content: '#daily-food-tracker-link { transition: none !important; }'
    })
    await foodLink.hover()
    await expect(foodLink).toHaveCSS('background-color', 'rgb(61, 61, 61)')
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
    await page.addStyleTag({
      content: '.pet-food-icons svg { transition: none !important; }'
    })
    const foodLink = page.locator('#daily-food-tracker-link')
    const foodIcons = page.locator('.pet-food-icons svg')
    await foodLink.hover()
    await expect(foodIcons).toHaveCount(5)
    for (let i = 0; i < 5; i++) {
      await expect(foodIcons.nth(i)).toHaveCSS('opacity', '1')
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


  test('food decorative icons have staggered animation delays', async ({ page }) => {
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
