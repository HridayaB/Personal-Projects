import { test, expect } from '@playwright/test'

test.describe('Daily Potty Tracker CSS & Layout', () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      const storage = (globalThis as unknown as {
        localStorage: { setItem(key: string, value: string): void }
      }).localStorage
      storage.setItem('pets', JSON.stringify([
        {
          id: 'test-pet',
          type: 'Dog',
          name: 'Buddy',
          weight: '50',
          breed: 'Siberian Husky',
        },
        {
          id: 'test-pet-2',
          type: 'Cat',
          name: 'Whiskers',
          weight: '12',
          breed: 'Domestic shorthair',
        },
      ]))
    })
    await page.goto('/Personal-Projects/#/daily-potty-tracker', {waitUntil: 'domcontentloaded'})
  })

  test('should display the daily potty tracker page', async ({ page }) => {
    await expect(page).toHaveURL(/#\/daily-potty-tracker$/)
    await expect(page.locator('main.daily-potty-tracker')).toBeVisible()
    await expect(page.getByRole('heading', { name: 'Daily Potty Tracker' })).toBeVisible()
  })

  test('daily potty tracker page should have a functioning dark mode toggle', async ({ page }) => {
    const darkModeToggle = page.locator('#dark-mode-toggle')
    const darkModeLabel = page.locator('label[for="dark-mode-toggle"]')
    const main = page.locator('main.daily-potty-tracker')
    await darkModeLabel.check()
    await expect(darkModeToggle).toBeChecked()
    await expect(main).toHaveClass(/dark-mode/)
    await page.addStyleTag({content: `main.daily-potty-tracker {transition: none !important;}`})
    await expect(main).toHaveCSS('background-color', 'rgb(36, 36, 36)')
    await darkModeLabel.click()
    await expect(darkModeToggle).not.toBeChecked()
    await expect(main).not.toHaveClass(/dark-mode/)
    await expect(main).toHaveCSS('background-color', 'rgb(242, 242, 242)')
  })

  test('daily potty tracker page should have icons on the link buttons', async ({ page }) => {
    const linkIds = [
      '#home-page-link',
      '#get-started-link',
      '#daily-food-tracker-link',
      '#daily-treat-tracker-link',
      '#daily-exercise-tracker-link',
      '#daily-medicine-tracker-link'
    ]
    const iconClasses = [
      'home-page-1',
      'get-started-1',
      'pet-food-1',
      'pet-treat-1',
      'pet-exercise-1',
      'pet-medicine-1'
    ]
    for (let i = 0; i < linkIds.length; i++) {
      const link = page.locator(linkIds[i])
      const icon = link.locator('svg')
      await expect(link).toBeVisible()
      await expect(icon).toBeVisible()
      await expect(icon).toHaveClass(new RegExp(iconClasses[i]))
      await expect(icon).toHaveCSS('width', '30px')
      await expect(icon).toHaveCSS('height', '30px')
    }
    const homePageDecorativeIcon = page.locator('.home-page-icons svg.home-page-2')
    await expect(homePageDecorativeIcon).toHaveCSS('width', '30px')
    await expect(homePageDecorativeIcon).toHaveCSS('height', '30px')
  })

  test('daily potty tracker page should have decorative icons for each tracker group', async ({ page }) => {
    await page.addStyleTag({content: `#get-started-link, #get-started-link:hover {transform: none !important; transition: none !important;} .get-started-icons svg, .pet-food-icons svg {transition: none !important;}`})
    const getStartedContainer = page.locator('.get-started-container')
    const getStartedIcons = page.locator('.get-started-icons svg')
    const foodIcons = page.locator('.pet-food-icons svg')
    await expect(getStartedIcons).toHaveCount(5)
    await expect(foodIcons).toHaveCount(5)
    await getStartedContainer.hover()
    for (let i = 0; i < 5; i++) {
      await expect(getStartedIcons.nth(i)).toHaveCSS('opacity', '1')
      await expect(foodIcons.nth(i)).toHaveCSS('opacity', '0')
    }
  })

  test('the decorative icons for each tracker group should be initially transparent', async ({ page }) => {
    const getStartedIcons = page.locator('.get-started-icons svg')
    await expect(getStartedIcons).toHaveCount(5)
    for (let i = 0; i < 5; i++) {
      await expect(getStartedIcons.nth(i)).toHaveCSS('opacity', '0')
    }
  })

  test('all five tracker groups contain five decorative icons', async ({ page }) => {
    const trackerGroups = [
      '.get-started-icons',
      '.pet-food-icons',
      '.pet-treat-icons',
      '.pet-exercise-icons',
      '.pet-medicine-icons'
    ]
    for (const group of trackerGroups) {
      await expect(page.locator(`${group} svg`)).toHaveCount(5)
    }
  })
})
