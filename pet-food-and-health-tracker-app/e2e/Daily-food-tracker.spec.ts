import { test, expect } from '@playwright/test'

test.describe('Daily Food Tracker CSS & Layout', () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      const storage = (globalThis as unknown as {
        localStorage: { setItem(key: string, value: string): void }
      }).localStorage
      storage.setItem('pets', JSON.stringify([{
        id: 'test-pet',
        type: 'Dog',
        name: 'Buddy',
        weight: '50',
        breed: 'Siberian Husky',
        foodFrequency: '2',
        treatFrequency: '5',
      }]))
    })
    await page.goto('/Personal-Projects/#/daily-food-tracker', {waitUntil: 'domcontentloaded'})
  })

  test('should display the daily food tracker page', async ({ page }) => {
    await expect(page).toHaveURL(/#\/daily-food-tracker$/)
    await expect(page.locator('main.daily-food-tracker')).toBeVisible()
    await expect(page.getByRole('heading', { name: 'Daily Food Tracker' })).toBeVisible()
  })

  test('daily food tracker page should have a functioning dark mode toggle', async ({ page }) => {
    const darkModeToggle = page.locator('#dark-mode-toggle')
    const darkModeLabel = page.locator('label[for="dark-mode-toggle"]')
    const main = page.locator('main.daily-food-tracker')
    await darkModeLabel.check()
    await expect(darkModeToggle).toBeChecked()
    await expect(main).toHaveClass(/dark-mode/)
    await expect(main).toHaveCSS('background-color', 'rgb(36, 36, 36)')
    await darkModeLabel.click()
    await expect(darkModeToggle).not.toBeChecked()
    await expect(main).not.toHaveClass(/dark-mode/)
    await expect(main).toHaveCSS('background-color', 'rgb(242, 242, 242)')
  })

  test('daily food tracker page should have icons on the link buttons', async ({ page }) => {
    const linkIds = [
      '#home-page-link',
      '#get-started-link',
      '#daily-treat-tracker-link',
      '#daily-exercise-tracker-link',
      '#daily-medicine-tracker-link',
      '#daily-potty-tracker-link'
    ]
    const iconClasses = [
      'home-page-1',
      'get-started-1',
      'pet-treat-1',
      'pet-exercise-1',
      'pet-medicine-1',
      'pet-potty-1'
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

  test('daily food tracker page should have decorative icons for each tracker group', async ({ page }) => {
    await page.addStyleTag({content: `#get-started-link, #get-started-link:hover {transform: none !important; transition: none !important;}.get-started-icons svg, .pet-treat-icons svg {transition: none !important;}`})
    const getStartedContainer = page.locator('.get-started-container')
    const getStartedIcons = page.locator('.get-started-icons svg')
    const treatIcons = page.locator('.pet-treat-icons svg')
    await page.addStyleTag({content: `.get-started-icons svg, .pet-treat-icons svg {transition: none !important;}`})
    await getStartedContainer.hover()
    await expect.poll(() => getStartedContainer.evaluate(element => element.matches(':hover'))).toBe(true)
    await expect(getStartedIcons).toHaveCount(5)
    await expect(treatIcons).toHaveCount(5)
    for (let i = 0; i < 5; i++) {
      await expect(getStartedIcons.nth(i)).toHaveCSS('opacity', '1')
      await expect(treatIcons.nth(i)).toHaveCSS('opacity', '0')
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
      '.pet-treat-icons',
      '.pet-exercise-icons',
      '.pet-medicine-icons',
      '.pet-potty-icons'
    ]
    for (const group of trackerGroups) {
      await expect(page.locator(`${group} svg`)).toHaveCount(5)
    }
  })
})
