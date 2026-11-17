import { test, expect, type Page } from '@playwright/test'

test.describe('Get Started', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/Personal-Projects/#/get-started', {waitUntil: 'domcontentloaded'})
  })

  const submitCurrentStep = async (page: Page) => {
    const submitButton = page.getByRole('button', { name: 'Submit' })
    await clickButtonForFirefox(page, submitButton)
  }

  const startRegistration = async (page: Page, petCount = 1) => {
    const choosePetButton = page.locator('#choose-pet-button')
    await clickButtonForFirefox(page, choosePetButton)
    await page
      .getByPlaceholder('Enter your pet number here')
      .fill(String(petCount))
    await submitCurrentStep(page)
  }

  const completePetWithNoExercise = async (page: Page, petType: string, petName: string) => {
    await page.getByRole('combobox').selectOption(petType)
    await submitCurrentStep(page)
    await page.getByPlaceholder("Enter your pet's name").fill(petName)
    await submitCurrentStep(page)
    await page.getByPlaceholder('Enter in pounds(lbs)').fill('25')
    await submitCurrentStep(page)
    await page.getByRole('button', { name: "I'm not sure" }).click()
    await page.locator('.modal-content input[type="number"]').fill('2')
    await submitCurrentStep(page)
    await page.locator('.modal-content input[type="number"]').fill('1')
    await submitCurrentStep(page)
    await page.locator('.modal-content input[type="number"]').fill('0')
    await submitCurrentStep(page)
    await page.getByPlaceholder('Enter yes or no').fill('No')
    await submitCurrentStep(page)
  }

  const registerOnePet = async (page: Page) => {
    await startRegistration(page)
    await completePetWithNoExercise(page, 'Dog', 'Buddy')
  }

  const goToFoodFrequencyStep = async (page: Page) => {
    await startRegistration(page)
    await page.getByRole('combobox').selectOption('Dog')
    await submitCurrentStep(page)
    await page.getByPlaceholder("Enter your pet's name").fill('Buddy')
    await submitCurrentStep(page)
    await page.getByPlaceholder('Enter in pounds(lbs)').fill('25')
    await submitCurrentStep(page)
    await page.getByRole('button', { name: "I'm not sure" }).click()
  }

  const clickButtonForFirefox = async (page: Page, locator: ReturnType<Page['locator']>) => {
    if (page.context().browser()?.browserType().name() === 'firefox') {
      await locator.dispatchEvent('click')
    } else {
      await locator.click()
    }
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
    const homePageDecorativeIcon = page.locator('.home-page-icons svg.home-page-2')
    await expect(homePageDecorativeIcon).toHaveCSS('width', '30px')
    await expect(homePageDecorativeIcon).toHaveCSS('height', '30px')
  })

  test('get started page should have decorative icons for each tracker group', async ({ page }) => {
    await registerOnePet(page)
    await page.addStyleTag({
      content: '.pet-food-icons svg, .pet-treat-icons svg { transition: none !important; }'
    })
    const foodContainer = page.locator('.food-tracker-container')
    const foodIcons = page.locator('.pet-food-icons svg')
    const treatIcons = page.locator('.pet-treat-icons svg')
    await foodContainer.hover()
    await expect(foodIcons).toHaveCount(5)
    await expect(treatIcons).toHaveCount(5)
    for (let i = 0; i < 5; i++) {
      await expect(foodIcons.nth(i)).toHaveCSS('opacity', '1')
      await expect(treatIcons.nth(i)).toHaveCSS('opacity', '0')
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

  test('click choose your pet button and confirm that the popup appears centered', async ({ page }) => {
    await clickButtonForFirefox(page, page.locator('#choose-pet-button'))
    const overlay = page.locator('.modal-overlay')
    const modal = page.locator('.modal-content')
    await expect(modal).toBeVisible()
    await expect(overlay).toHaveCSS('display', 'flex')
    const viewport = page.viewportSize()
    expect(viewport).not.toBeNull()
    await expect.poll(async () => {
      const box = await modal.boundingBox()
      if (!box || !viewport) return Number.POSITIVE_INFINITY
      return Math.max(
        Math.abs(box.x + box.width / 2 - viewport.width / 2),
        Math.abs(box.y + box.height / 2 - viewport.height / 2),
      )
    }).toBeLessThan(12)
  })

  test('confirm that the background behind the popup is blurred and darkened', async ({ page }) => {
    await clickButtonForFirefox(page, page.locator('#choose-pet-button'))
    const overlay = page.locator('.modal-overlay')
    await expect(overlay).toHaveCSS('background-color', 'rgba(0, 0, 0, 0.45)')
    await expect(overlay).toHaveCSS('backdrop-filter', 'blur(6px)')
  })

  test('confirm that the popup is readable', async ({ page }) => {
    await clickButtonForFirefox(page, page.locator('#choose-pet-button'))
    const modal = page.locator('.modal-content')
    const heading = modal.getByRole('heading', { level: 3 })
    const input = page.getByPlaceholder('Enter your pet number here')
    await expect(modal).toBeVisible()
    await expect(heading).toBeVisible()
    await expect(input).toBeVisible()
    await expect(modal.getByRole('button', { name: 'Submit' })).toBeVisible()
    const fontSize = Number.parseFloat(await heading.evaluate(element => element.ownerDocument.defaultView!.getComputedStyle(element).fontSize))
    expect(fontSize).toBeGreaterThanOrEqual(20)
  })

  test('check that all registration steps are displayed correctly', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' })
    await startRegistration(page)
    await expect(page.getByRole('heading', { name: 'What type of pet do you have?' })).toBeVisible()
    await page.getByRole('combobox').selectOption('Dog')
    await submitCurrentStep(page)

    await expect(page.getByRole('heading', { name: "What is your dog's name?" })).toBeVisible()
    await page.getByPlaceholder("Enter your pet's name").fill('Buddy')
    await submitCurrentStep(page)

    await expect(page.getByRole('heading', { name: "What is your dog's weight?" })).toBeVisible()
    await page.getByPlaceholder('Enter in pounds(lbs)').fill('25')
    await submitCurrentStep(page)

    await expect(page.getByRole('heading', { name: "Enter your dog's breed" })).toBeVisible()
    await clickButtonForFirefox(page, page.getByRole('button', { name: "I'm not sure" }))

    await expect(page.getByRole('heading', { name: 'How many times are you planning to feed your dog in a single day?' })).toBeVisible()
    await page.locator('.modal-content input[type="number"]').fill('2')
    await submitCurrentStep(page)

    await expect(page.getByRole('heading', { name: 'How many treats are you planning to give your dog in a single day?' })).toBeVisible()
    await page.locator('.modal-content input[type="number"]').fill('1')
    await submitCurrentStep(page)

    await expect(page.getByRole('heading', { name: 'How many times does your dog exercise in a single day?' })).toBeVisible()
    await page.locator('.modal-content input[type="number"]').fill('1')
    await submitCurrentStep(page)

    await expect(page.getByRole('heading', { name: 'How long does your dog exercise each session?' })).toBeVisible()
    await page.getByPlaceholder('Enter in minutes').fill('30')
    await submitCurrentStep(page)

    await expect(page.getByRole('heading', { name: 'How many types of exercise does your dog do?' })).toBeVisible()
    await page.locator('.modal-content input[type="number"]').fill('1')
    await submitCurrentStep(page)

    await expect(page.getByRole('heading', { name: 'Would you like to label the exercises?' })).toBeVisible()
    await page.getByPlaceholder('Enter yes or no').fill('No')
    await submitCurrentStep(page)

    await expect(page.getByRole('heading', { name: 'Does your dog take any medicine?' })).toBeVisible()
    await page.getByPlaceholder('Enter yes or no').fill('No')
    await submitCurrentStep(page)
    await expect(page.locator('.modal-overlay')).toBeHidden()
  })

  test('check that text, inputs, dropdowns, and buttons are visible', async ({ page }) => {
    const choosePetButton = page.locator('#choose-pet-button')
    await clickButtonForFirefox(page, choosePetButton)
    const modal = page.locator('.modal-content')
    const petCountInput = page.getByPlaceholder('Enter your pet number here')
    await expect(modal.getByRole('heading', { level: 3 })).toBeVisible()
    await expect(petCountInput).toBeVisible()
    await expect(petCountInput).toHaveCSS('visibility', 'visible')
    await expect(modal.getByRole('button', { name: 'Submit' })).toBeVisible()
    await expect(modal.getByRole('button', { name: 'Cancel' })).toBeVisible()
    await petCountInput.fill('1')
    await submitCurrentStep(page)
    const petType = page.getByRole('combobox')
    await expect(petType).toBeVisible()
    await petType.selectOption('Dog')
    await submitCurrentStep(page)
    await expect(page.getByPlaceholder("Enter your pet's name")).toBeVisible()
  })

  test('go to the food frequency step and check for scrollability', async ({ browser }) => {
    const context = await browser.newContext({viewport: { width: 390, height: 480 }})
    const page = await context.newPage()
    await page.goto('/Personal-Projects/#/get-started', {waitUntil: 'domcontentloaded'})
    await goToFoodFrequencyStep(page)
    const modal = page.locator('.modal-content')
    await expect(modal).toHaveCSS('overflow-y', 'auto')
    await context.close()
  })

  test('checks that the popup works on a smaller window', async ({ page }) => {
    await page.setViewportSize({ width: 360, height: 640 })
    await clickButtonForFirefox(page, page.locator('#choose-pet-button'))
    const modal = page.locator('.modal-content')
    await expect(modal).toBeVisible()
    const box = await modal.boundingBox()
    expect(box).not.toBeNull()
    expect(box!.x).toBeGreaterThanOrEqual(0)
    expect(box!.y).toBeGreaterThanOrEqual(0)
    expect(box!.x + box!.width).toBeLessThanOrEqual(360)
    expect(box!.y + box!.height).toBeLessThanOrEqual(640)
    await expect(page.getByPlaceholder('Enter your pet number here')).toBeVisible()
  })

  test('the popup in light mode', async ({ page }) => {
    await clickButtonForFirefox(page, page.locator('#choose-pet-button'))
    await expect(page.locator('.modal-content')).toHaveCSS('background-color', 'rgb(255, 255, 255)')
    await expect(page.locator('.modal-content')).toHaveCSS('color', 'rgb(26, 26, 26)')
  })

  test('the popup in dark mode', async ({ page }) => {
    await page.locator('label[for="dark-mode-toggle"]').click()
    await expect(page.locator('main.get-started')).toHaveClass(/dark-mode/)
    await clickButtonForFirefox(page, page.locator('#choose-pet-button'))
    const modal = page.locator('.modal-content')
    await expect(modal).toHaveCSS('background-color', 'rgb(51, 51, 51)')
    await expect(modal).toHaveCSS('color', 'rgb(242, 242, 242)')
    await expect(page.getByPlaceholder('Enter your pet number here')).toHaveCSS('background-color', 'rgb(36, 36, 36)')
  })

  test('use only the keyboard to navigate the page', async ({ page }) => {
    await page.keyboard.press('Tab')
    await expect(page.locator('#choose-pet-button')).toBeFocused()
    await page.keyboard.press('Enter')

    const petCountInput = page.getByPlaceholder('Enter your pet number here')
    await page.keyboard.press('Tab')
    await expect(petCountInput).toBeFocused()
    await page.keyboard.insertText('1')
    await page.keyboard.press('Tab')
    const submitButton = page.locator('.modal-content').getByRole('button', { name: 'Submit' })
    await expect(submitButton).toBeFocused()
    await page.keyboard.press('Enter')
    await expect(page.getByRole('combobox')).toBeVisible()
  })

  test('check that the focus outline is visible', async ({ page }) => {
    await page.keyboard.press('Tab')
    const choosePetButton = page.locator('#choose-pet-button')
    await expect(choosePetButton).toBeFocused()
    await expect(choosePetButton).toHaveCSS('outline-style', 'solid')
    const outlineWidth = Number.parseFloat(await choosePetButton.evaluate(element => element.ownerDocument.defaultView!.getComputedStyle(element).outlineWidth))
    const outlineOffset = Number.parseFloat(await choosePetButton.evaluate(element => element.ownerDocument.defaultView!.getComputedStyle(element).outlineOffset))
    expect(outlineWidth).toBeGreaterThan(0)
    expect(outlineOffset).toBeGreaterThan(0)
  })

  test('check the popup with reduced motion enabled', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' })
    await clickButtonForFirefox(page, page.locator('#choose-pet-button'))
    await expect(page.locator('.modal-content')).toHaveCSS('animation-name', 'none')
  })

  test('register one pet and confirm that it is saved', async ({ page }) => {
    await registerOnePet(page)
    const savedPet = await page.evaluate(() => {
      const storage = (globalThis as typeof globalThis & {
        localStorage: { getItem(key: string): string | null }
      }).localStorage
      const pets = JSON.parse(storage.getItem('pets') ?? '[]')
      return {
        pet: pets[0],
        count: pets.length,
        activePet: storage.getItem('activePet'),
      }
    })
    expect(savedPet.count).toBe(1)
    expect(savedPet.pet).toMatchObject({
      type: 'Dog',
      name: 'Buddy',
      weight: 25,
      breed: '',
      foodFrequency: 2,
      treatFrequency: 1,
      exerciseFrequency: 0,
      medicineIntake: 'No',
    })
    expect(savedPet.activePet).toBe(savedPet.pet.id)
  })

  test('register multiple pets', async ({ page }) => {
    await startRegistration(page, 2)
    await completePetWithNoExercise(page, 'Dog', 'Buddy')
    await expect(page.getByRole('combobox')).toBeVisible()
    await completePetWithNoExercise(page, 'Cat', 'Whiskers')

    const pets = await page.evaluate(() => {
      const storage = (globalThis as typeof globalThis & {
        localStorage: { getItem(key: string): string | null }
      }).localStorage
      return JSON.parse(storage.getItem('pets') ?? '[]')
    })
    expect(pets).toHaveLength(2)
    expect(pets.map((pet: { name: string }) => pet.name)).toEqual(['Buddy', 'Whiskers'])
    expect(pets.map((pet: { type: string }) => pet.type)).toEqual(['Dog', 'Cat'])
  })

  test('check if popup can be closed before finishing the registration of a pet', async ({ page }) => {
    await clickButtonForFirefox(page, page.locator('#choose-pet-button'))
    await page.getByPlaceholder('Enter your pet number here').fill('1')
    await page.getByRole('button', { name: 'Cancel' }).click()
    await expect(page.locator('.modal-overlay')).toBeHidden()
    await expect(page.locator('#home-page-link')).toHaveCount(0)
    expect(await page.evaluate(() => {
      const storage = (globalThis as typeof globalThis & {
        localStorage: { getItem(key: string): string | null }
      }).localStorage
      return storage.getItem('pets')
    })).toBeNull()
  })

  test('confirm that the tracker links appear after pet registration', async ({ page }) => {
    await registerOnePet(page)
    const expectedLinks = [
      ['#home-page-link', /#\/$/],
      ['#daily-food-tracker-link', /#\/daily-food-tracker$/],
      ['#daily-treat-tracker-link', /#\/daily-treat-tracker$/],
      ['#daily-exercise-tracker-link', /#\/daily-exercise-tracker$/],
      ['#daily-medicine-tracker-link', /#\/daily-medicine-tracker$/],
      ['#daily-potty-tracker-link', /#\/daily-potty-tracker$/],
    ] as const

    for (const [selector, href] of expectedLinks) {
      const link = page.locator(selector)
      await expect(link).toBeVisible()
      await expect(link).toHaveAttribute('href', href)
    }
  })
})
