import { test, expect, type Page } from '@playwright/test'

test.describe('Get Started', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/Personal-Projects/#/get-started')
  })

  const registerOnePet = async (page: Page)=> {
    await page.locator('#choose-pet-button').click()
    await page.getByPlaceholder('Enter your pet number here').fill('1')
    await page.getByRole('button', { name: 'Submit' }).click()
    await page.getByRole('combobox').selectOption('Dog')
    await page.getByRole('button', { name: 'Submit' }).click()
    await page.getByPlaceholder("Enter your pet's name").fill('Buddy')
    await page.getByRole('button', { name: 'Submit' }).click()
    await page.getByPlaceholder('Enter in pounds(lbs)').fill('25')
    await page.getByRole('button', { name: 'Submit' }).click()
    await page.getByRole('button', { name: "I'm not sure" }).click()
    await page.locator('.modal-content input[type="number"]').fill('2')
    await page.getByRole('button', { name: 'Submit' }).click()
    await page.locator('.modal-content input[type="number"]').fill('1')
    await page.getByRole('button', { name: 'Submit' }).click()
    await page.locator('.modal-content input[type="number"]').fill('0')
    await page.getByRole('button', { name: 'Submit' }).click()
    await page.getByPlaceholder('Enter yes or no').fill('No')
    await page.getByRole('button', { name: 'Submit' }).click()
  }

  test('should display the get started page', async ({ page }) => {
    await expect(page).toHaveURL(/#\/get-started$/)
    await expect(page.locator('main.get-started')).toBeVisible()
    await expect(page.getByRole('heading', { name: 'Get Started' })).toBeVisible()
  })

  test('get started page should have a functioning dark mode toggle', async ({ page }) => {
    const darkModeToggle = page.locator('#dark-mode-toggle')
    const darkModeLabel = page.locator('label[for="dark-mode-toggle"]')
    const main = page.locator('main.get-started')
    await darkModeLabel.check()
    await expect(darkModeToggle).toBeChecked()
    await expect(main).toHaveClass(/dark-mode/)
    await expect(main).toHaveCSS('background-color', 'rgb(36, 36, 36)')
    await darkModeLabel.click()
    await expect(darkModeToggle).not.toBeChecked()
    await expect(main).not.toHaveClass(/dark-mode/)
    await expect(main).toHaveCSS('background-color', 'rgb(242, 242, 242)')
  })

  test('get started page should have icons on the link buttons', async ({ page }) => {
    await registerOnePet(page)
    const linkIds = [
      '#home-page-link',
      '#daily-food-tracker-link',
      '#daily-treat-tracker-link',
      '#daily-exercise-tracker-link',
      '#daily-medicine-tracker-link',
      '#daily-potty-tracker-link'
    ]
    const iconClasses = [
      'home-page-1',
      'pet-food-1',
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
  })

  test('get started page should have decorative icons for each tracker group', async ({ page }) => {
    await registerOnePet(page)
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

  test('the decorative icons for each tracker group should be initially transparent', async ({ page }) => {
    await registerOnePet(page)
    const foodIcons = page.locator('.pet-food-icons svg')
    await expect(foodIcons).toHaveCount(5)
    for (let i = 0; i < 5; i++) {
      await expect(foodIcons.nth(i)).toHaveCSS('opacity', '0')
    }
  })

   test('all five tracker groups contain five decorative icons', async ({ page }) => {
    await registerOnePet(page)
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
    await registerOnePet(page)
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
    await registerOnePet(page)
    const foodLink = page.locator('#daily-food-tracker-link')
    const foodIcons = page.locator('.pet-food-icons svg')
    await foodLink.hover()
    const expectedDelays = [0, 70, 140, 210, 280]
    for (let i = 0; i < expectedDelays.length; i++) {
      const delay = await foodIcons.nth(i).evaluate((svg) => {
        const transitionDelay = svg.ownerDocument.defaultView!.getComputedStyle(svg).transitionDelay
        return parseFloat(transitionDelay) * (transitionDelay.includes('ms') ? 1 : 1000)
      })
      expect(delay).toBe(expectedDelays[i])
    }
  })
})
