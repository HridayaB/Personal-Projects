import { test, expect } from '@playwright/test'

test.describe('Daily Food Tracker CSS & Layout', () => {
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
          foodFrequency: '2',
          treatFrequency: '5',
        },
        {
          id: 'test-pet-2',
          type: 'Cat',
          name: 'Whiskers',
          weight: '12',
          breed: 'Domestic shorthair',
          foodFrequency: '3',
          treatFrequency: '2',
        },
      ]))
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
    await page.addStyleTag({content: `main.daily-food-tracker { transition: none !important; }`})
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

  test('there is a popup for each pet', async ({ page }) => {
    const pets = [
    { id: 'test-pet', name: 'Buddy' },
    { id: 'test-pet-2', name: 'Whiskers' },
    ]
    const petCards = page.locator('.pet-tracker')
    const popup = page.locator('.pet-modal-content')
    await expect(petCards).toHaveCount(pets.length)
    for (const pet of pets) {
      await page.locator(`[data-test="view-${pet.id}"]`).click()
      await expect(popup).toBeVisible()
      await expect(popup).toContainText(`${pet.name}'s Daily Food Tracker`)
      await expect(popup).toContainText(`Today's date:`)
      await page.getByRole('button', { name: 'Close pet tracker' }).click()
      await expect(popup).toBeHidden()
    }
  })

  test('pet cards and popup buttons are styled in light and dark mode', async ({ page }) => {
    const viewButtons = page.locator('.pet-tracker button')
    await expect(viewButtons).toHaveCount(2)
    for (let i = 0; i < await viewButtons.count(); i++) {
      const button = viewButtons.nth(i)
      await expect(button).toBeVisible()
      await expect(button).toHaveCSS('background-color', 'rgb(255, 255, 255)')
      await expect(button).toHaveCSS('color', 'rgb(26, 26, 26)')
      await expect(button).toHaveCSS('border-radius', '8px')
      await expect(button).toHaveCSS('padding-top', '10px')
      await expect(button).toHaveCSS('padding-left', '22px')
    }
    await page.locator('[data-test="view-test-pet"]').click()
    const popup = page.locator('.pet-modal-content')
    await expect(popup).toBeVisible()
    const popupButtons = popup.locator('.pet-modal-actions button')
    await expect(popupButtons).toHaveCount(4)
    for (let i = 0; i < await popupButtons.count(); i++) {
      const button = popupButtons.nth(i)
      await expect(button).toBeVisible()
      await expect(button).toHaveCSS('background-color', 'rgb(255, 255, 255)')
      await expect(button).toHaveCSS('color', 'rgb(26, 26, 26)')
      await expect(button).toHaveCSS('border-radius', '8px')
      await expect(button).toHaveCSS('padding-top', '10px')
      await expect(button).toHaveCSS('padding-left', '18px')
    }
    await page.getByRole('button', { name: 'Close pet tracker' }).click()
    await expect(popup).toBeHidden()
    await page.locator('label[for="dark-mode-toggle"]').click()
    await expect(page.locator('main.daily-food-tracker')).toHaveClass(/dark-mode/)
    for (let i = 0; i < await viewButtons.count(); i++) {
      const button = viewButtons.nth(i)
      await expect(button).toHaveCSS('background-color', 'rgb(51, 51, 51)')
      await expect(button).toHaveCSS('color', 'rgb(242, 242, 242)')
      await expect(button).toHaveCSS('border-color', 'rgb(85, 85, 85)')
    }
    for (let i = 0; i < await popupButtons.count(); i++) {
      const button = popupButtons.nth(i)
      await expect(button).toHaveCSS('background-color', 'rgb(51, 51, 51)')
      await expect(button).toHaveCSS('color', 'rgb(242, 242, 242)')
      await expect(button).toHaveCSS('border-color', 'rgb(85, 85, 85)')
    }
  })

  test('pet tracker popup has a centered position and blurred background', async ({ page }) => {
    await page.locator('[data-test="view-test-pet"]').click()
    const overlay = page.locator('.pet-modal-overlay')
    const popup = page.locator('.pet-modal-content')
    await expect(overlay).toBeVisible()
    await expect(popup).toBeVisible()
    await expect(overlay).toHaveCSS('position', 'fixed')
    await expect(overlay).toHaveCSS('backdrop-filter', 'blur(6px)')
    const overlayBox = await overlay.boundingBox()
    const popupBox = await popup.boundingBox()
    expect(overlayBox).not.toBeNull()
    expect(popupBox).not.toBeNull()
    const overlayCenterX = overlayBox!.x + overlayBox!.width / 2
    const popupCenterX = popupBox!.x + popupBox!.width / 2
    expect(Math.abs(overlayCenterX - popupCenterX)).toBeLessThan(12)
    const overlayCenterY = overlayBox!.y + overlayBox!.height / 2
    const popupCenterY = popupBox!.y + popupBox!.height / 2
    expect(Math.abs(overlayCenterY - popupCenterY)).toBeLessThan(12)
  })

  test('feeding buttons work correctly inside the pet popup', async ({ page }) => {
    await page.locator('[data-test="view-test-pet"]').click()
    const popup = page.locator('.pet-modal-content')
    const logButton = popup.locator('[data-test="log-test-pet"]')
    const removeLogButton = popup.locator('[data-test="remove-log-test-pet"]')
    const resetButton = popup.locator('[data-test="reset-test-pet"]')
    await expect(popup).toBeVisible()
    await expect(popup).toContainText('0 of 2 feedings given today.')
    await logButton.click()
    await expect(popup).toContainText('1 of 2 feedings given today.')
    await logButton.click()
    await expect(popup).toContainText('2 of 2 feedings given today.')
    await expect(logButton).toBeDisabled()
    await expect(logButton).toHaveCSS('opacity', '0.5')
    await expect(logButton).toHaveCSS('cursor', 'not-allowed')
    await removeLogButton.click()
    await expect(popup).toContainText('1 of 2 feedings given today.')
    await expect(logButton).toBeEnabled()
    await resetButton.click()
    await expect(popup).toContainText('0 of 2 feedings given today.')
  })

  test('checks that the progress bar exists', async ({ page }) => {
    await page.locator('[data-test="view-test-pet"]').click()
    const popup = page.locator('.pet-modal-content')
    const progressBar = popup.locator('progress.food-progress-bar')
    await expect(progressBar).toBeVisible()
    await expect(progressBar).toHaveAttribute('max', '2')
    await expect(progressBar).toHaveAttribute('value', '0')
    await expect(progressBar).toHaveAttribute('aria-label', 'Buddy daily feeding progress')
  })

  test('checks that the progress bar works correctly', async ({ page }) => {
    await page.locator('[data-test="view-test-pet"]').click()
    const popup = page.locator('.pet-modal-content')
    const progressBar = popup.locator('progress.food-progress-bar')
    const logButton = popup.locator('[data-test="log-test-pet"]')
    await expect(progressBar).toHaveAttribute('value', '0')
    await logButton.click()
    await expect(progressBar).toHaveAttribute('value', '1')
    await logButton.click()
    await expect(progressBar).toHaveAttribute('value', '2')
    await expect(progressBar).toHaveAttribute('aria-label', 'Buddy daily feeding progress')
  })

  test('checks if progress bar goes back properly',async ({ page }) => {
    await page.locator('[data-test="view-test-pet"]').click()
    const popup = page.locator('.pet-modal-content')
    const progressBar = popup.locator('progress.food-progress-bar')
    const logButton = popup.locator('[data-test="log-test-pet"]')
    const removeLogButton = popup.locator('[data-test="remove-log-test-pet"]')
    const resetButton = popup.locator('[data-test="reset-test-pet"]')
    await logButton.click()
    await logButton.click()
    await expect(progressBar).toHaveAttribute('value', '2')
    await removeLogButton.click()
    await expect(progressBar).toHaveAttribute('value', '1')
    await resetButton.click()
    await expect(progressBar).toHaveAttribute('value', '0')
  })
})
