import { it, describe, expect, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { createRouter, createWebHistory } from 'vue-router'
import DailyMedicineTracker from '../Daily-medicine-tracker.vue'
import { addPet } from '../pets.ts'

const makeRouter = () => createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/daily-medicine-tracker', component: DailyMedicineTracker },
    { path: '/get-started', component: { template: '<div>Get Started</div>' } },
    { path: '/homeView', component: { template: '<div>Home</div>' } },
    { path: '/daily-food-tracker', component: { template: '<div>Daily Food Tracker</div>' } },
    { path: '/daily-treat-tracker', component: { template: '<div>Daily Treat Tracker</div>' } },
    { path: '/daily-exercise-tracker', component: { template: '<div>Daily Exercise Tracker</div>' } },
    { path: '/daily-potty-tracker', component: { template: '<div>Daily Potty Tracker</div>' } },
  ],
})

const mountView = async () => {
  const router = makeRouter()
  router.push('/daily-medicine-tracker')
  await router.isReady()
  const wrapper = mount(DailyMedicineTracker, { global: { plugins: [router] } })
  return { wrapper, router }
}

const base = {
  type: 'Dog', name: 'Buddy', weight: '50', breed: 'Siberian Husky', foodFrequency: '2', treatFrequency: '1', medicineIntake: 'yes', medicineFrequency: '2', medicineTypes: '2', medicineLabels: [] as string[],
}

const seedPet = (overrides: Partial<typeof base> = {}) =>
  addPet({ ...base, ...overrides } as Parameters<typeof addPet>[0])

const todayDate = () => new Date().toLocaleDateString('en-US')

describe('DailyMedicineTracker', () => {
  beforeEach(() => localStorage.clear())

  it('shows a setup prompt when there are no pets', async () => {
    const { wrapper } = await mountView()
    expect(wrapper.text()).toContain("It looks like you haven't set up your pet's information yet.")
    expect(wrapper.find('button').exists()).toBe(false)
  })

  it('reads pet info from storage', async () => {
    seedPet({ name: 'Rex', medicineIntake: 'yes', medicineFrequency: '2', medicineTypes: '2', medicineLabels: ['Antibiotic', 'Vitamin'] })
    const { wrapper } = await mountView()
    expect(wrapper.text()).toContain('Rex')
    expect(wrapper.text()).toContain('0 of 2 medicine doses given today.')
  })

  it('increments the medicine count and persists under the pet id', async () => {
    const pet = seedPet({ name: 'Cat', medicineIntake: 'yes', medicineFrequency: '2', medicineTypes: '2', medicineLabels: ['Antibiotic', 'Vitamin'] })
    const { wrapper } = await mountView()
    await wrapper.find(`[data-test="log-${pet.id}"]`).trigger('click')
    expect(wrapper.text()).toContain('1 of 2 medicine doses given today.')
    expect(localStorage.getItem(`medicineLog:${pet.id}:${todayDate()}`)).toBe('1')
  })

  it('restores the medicine count from today\'s saved log', async () => {
    const pet = seedPet({ name: 'Bird', medicineIntake: 'yes', medicineFrequency: '2', medicineTypes: '2', medicineLabels: ['Antibiotic', 'Vitamin'] })
    localStorage.setItem(`medicineLog:${pet.id}:${todayDate()}`, '1')
    const { wrapper } = await mountView()
    expect(wrapper.text()).toContain('1 of 2 medicine doses given today.')
  })

  it('does not allow medicine count to exceed the daily limit', async () => {
    const pet = seedPet({ name: 'Rabbit', medicineIntake: 'yes', medicineFrequency: '1', medicineTypes: '2', medicineLabels: ['Antibiotic', 'Vitamin'] })
    const { wrapper } = await mountView()
    const logBtn = () => wrapper.find(`[data-test="log-${pet.id}"]`)
    await logBtn().trigger('click')
    expect(wrapper.text()).toContain('1 of 1 medicine doses given today.')
    expect(logBtn().attributes('disabled')).toBeDefined()
  })

  it('resets today\'s medicine count', async () => {
    const pet = seedPet({ name: 'Fish', medicineIntake: 'yes', medicineFrequency: '1', medicineTypes: '2', medicineLabels: ['Antibiotic', 'Vitamin'] })
    localStorage.setItem(`medicineLog:${pet.id}:${todayDate()}`, '1')
    const { wrapper } = await mountView()
    await wrapper.find(`[data-test="reset-${pet.id}"]`).trigger('click')
    expect(wrapper.text()).toContain('0 of 1 medicine doses given today.')
    expect(localStorage.getItem(`medicineLog:${pet.id}:${todayDate()}`)).toBeNull()
  })

  it('renders one tracker per registered pet', async () => {
    seedPet({ name: 'Buddy' })
    seedPet({ name: 'Whiskers', type: 'Cat', medicineIntake: 'yes', medicineFrequency: '2', medicineTypes: '2', medicineLabels: ['Antibiotic', 'Vitamin'] })
    const { wrapper } = await mountView()
    expect(wrapper.findAll('.pet-tracker')).toHaveLength(2)
    expect(wrapper.text()).toContain('Buddy')
    expect(wrapper.text()).toContain('Whiskers')
  })

  it('logs medicine for the correct pet', async () => {
    const buddy = seedPet({ name: 'Buddy', medicineIntake: 'yes', medicineFrequency: '2', medicineTypes: '2', medicineLabels: ['Antibiotic', 'Vitamin'] })
    const whiskers = seedPet({ name: 'Whiskers', medicineIntake: 'yes', medicineFrequency: '3', medicineTypes: '2', medicineLabels: ['Antibiotic', 'Vitamin'] })
    const { wrapper } = await mountView()
    await wrapper.find(`[data-test="log-${whiskers.id}"]`).trigger('click')
    expect(wrapper.text()).toContain('1 of 3 medicine doses given today.')
    expect(wrapper.text()).toContain('0 of 2 medicine doses given today.')
    expect(localStorage.getItem(`medicineLog:${buddy.id}:${todayDate()}`)).toBeNull()
  })

  it('writes each pet\'s log under its own key', async () => {
    const pet = seedPet({ name: 'Buddy', medicineIntake: 'yes', medicineFrequency: '2', medicineTypes: '2', medicineLabels: ['Antibiotic', 'Vitamin'] })
    const { wrapper } = await mountView()
    await wrapper.find(`[data-test="log-${pet.id}"]`).trigger('click')
    expect(localStorage.getItem(`medicineLog:${pet.id}:${todayDate()}`)).toBe('1')
  })

  it('keeps seperate logs for different pets', async () => {
    seedPet({ name: 'Buddy', medicineIntake: 'yes', medicineFrequency: '2', medicineTypes: '2', medicineLabels: ['Antibiotic', 'Vitamin'] })
    const whiskers = seedPet({ name: 'Whiskers', medicineIntake: 'yes', medicineFrequency: '3', medicineTypes: '2', medicineLabels: ['Antibiotic', 'Vitamin'] })
    const { wrapper } = await mountView()
    const logWhiskers = wrapper.find(`[data-test="log-${whiskers.id}"]`)
    await logWhiskers.trigger('click')
    await logWhiskers.trigger('click')
    expect(wrapper.text()).toContain('2 of 3 medicine doses given today.')
    expect(wrapper.text()).toContain('0 of 2 medicine doses given today.')
  })

  it('checks if the different labels are displayed as buttons', async () => {
    const pet = seedPet({ name: 'Buddy', medicineIntake: 'yes', medicineFrequency: '2', medicineTypes: '2', medicineLabels: ['Antibiotic', 'Vitamin'] })
    const { wrapper } = await mountView()
    expect(wrapper.find(`[data-test="medicine-label-${pet.id}-Antibiotic"]`).exists()).toBe(true)
    expect(wrapper.find(`[data-test="medicine-label-${pet.id}-Vitamin"]`).exists()).toBe(true)
  })

  it('checks if label can be selected', async () => {
    const pet = seedPet({ name: 'Buddy', medicineIntake: 'yes', medicineFrequency: '2', medicineTypes: '2', medicineLabels: ['Antibiotic', 'Vitamin'] })
    const { wrapper } = await mountView()
    await wrapper.find(`[data-test="medicine-label-${pet.id}-Antibiotic"]`).trigger('click')
    expect(wrapper.find(`[data-test="medicine-label-${pet.id}-Antibiotic"]`).classes()).toContain('selected')
  })

  it('links to the home page', async () => {
    seedPet({ name: 'Buddy', medicineFrequency: '2' })
    const router = makeRouter()
    const wrapper = mount(DailyMedicineTracker, { global: { plugins: [router] } })
    await router.isReady()
    const link = wrapper.find("a[href='/']")
    expect(link.exists()).toBe(true)
    expect(link.text()).toContain('Home')
  })

  it('links to the get-started page', async () => {
    seedPet({ name: 'Buddy', medicineFrequency: '2' })
    const router = makeRouter()
    const wrapper = mount(DailyMedicineTracker, { global: { plugins: [router] } })
    await router.isReady()
    const link = wrapper.find("a[href='/get-started']")
    expect(link.exists()).toBe(true)
    expect(link.text()).toContain('Get Started')
  })

  it('links to the daily food tracker page', async () => {
    seedPet({ name: 'Buddy', medicineFrequency: '2' })
    const router = makeRouter()
    const wrapper = mount(DailyMedicineTracker, { global: { plugins: [router] } })
    await router.isReady()
    const link = wrapper.find("a[href='/daily-food-tracker']")
    expect(link.exists()).toBe(true)
    expect(link.text()).toContain('Daily Food Tracker')
  })

  it('links to the daily treat tracker page', async () => {
    seedPet({ name: 'Buddy', medicineFrequency: '2' })
    const router = makeRouter()
    const wrapper = mount(DailyMedicineTracker, { global: { plugins: [router] } })
    await router.isReady()
    const link = wrapper.find("a[href='/daily-treat-tracker']")
    expect(link.exists()).toBe(true)
    expect(link.text()).toContain('Daily Treat Tracker')
  })

  it('links to the daily exercise tracker page', async () => {
    seedPet({ name: 'Buddy', medicineFrequency: '2' })
    const router = makeRouter()
    const wrapper = mount(DailyMedicineTracker, { global: { plugins: [router] } })
    await router.isReady()
    const link = wrapper.find("a[href='/daily-exercise-tracker']")
    expect(link.exists()).toBe(true)
    expect(link.text()).toContain('Daily Exercise Tracker')
  })

  it('links to the daily potty tracker page', async () => {
    seedPet({ name: 'Buddy', medicineFrequency: '2' })
    const router = makeRouter()
    const wrapper = mount(DailyMedicineTracker, { global: { plugins: [router] } })
    await router.isReady()
    const link = wrapper.find("a[href='/daily-potty-tracker']")
    expect(link.exists()).toBe(true)
    expect(link.text()).toContain('Daily Potty Tracker')
  })

  it('removes a log from the medicine count', async () => {
    const pet = seedPet({ name: 'Buddy', medicineFrequency: '2' })
    const { wrapper } = await mountView()
    await wrapper.find(`[data-test="log-${pet.id}"]`).trigger('click')
    expect(wrapper.text()).toContain('1 of 2 medicine doses given today.')
    expect(localStorage.getItem(`medicineLog:${pet.id}:${todayDate()}`)).toBe('1')
    await wrapper.find(`[data-test="remove-log-${pet.id}"]`).trigger('click')
    expect(wrapper.text()).toContain('0 of 2 medicine doses given today.')
    expect(localStorage.getItem(`medicineLog:${pet.id}:${todayDate()}`)).toBe('0')
  })

  it('removes a log from the medicine count for the correct pet', async () => {
    const buddy = seedPet({ name: 'Buddy', medicineFrequency: '2' })
    const whiskers = seedPet({ name: 'Whiskers', medicineFrequency: '3' })
    const { wrapper } = await mountView()
    await wrapper.find(`[data-test="log-${whiskers.id}"]`).trigger('click')
    await wrapper.find(`[data-test="log-${whiskers.id}"]`).trigger('click')
    await wrapper.find(`[data-test="log-${buddy.id}"]`).trigger('click')
    expect(wrapper.text()).toContain('1 of 2 medicine doses given today.')
    expect(wrapper.text()).toContain('2 of 3 medicine doses given today.')
    await wrapper.find(`[data-test="remove-log-${whiskers.id}"]`).trigger('click')
    expect(wrapper.text()).toContain('1 of 3 medicine doses given today.')
    expect(wrapper.text()).toContain('1 of 2 medicine doses given today.')
    expect(localStorage.getItem(`medicineLog:${whiskers.id}:${todayDate()}`)).toBe('1')
    expect(localStorage.getItem(`medicineLog:${buddy.id}:${todayDate()}`)).toBe('1')
  })

  it('removes a pet from this tracker only', async () => {
    const pet = seedPet({ name: 'Buddy', medicineFrequency: '2' })
    const { wrapper } = await mountView()
    await wrapper.find(`[data-test="remove-pet-${pet.id}"]`).trigger('click')
    expect(wrapper.text()).toContain('Buddy')
    expect(wrapper.text()).toContain('Remove from this tracker')
    await wrapper.findAll('button').find(button => button.text() === 'Remove from this tracker')!.trigger('click')
    expect(wrapper.text()).not.toContain('Buddy')
    expect(wrapper.find(`[data-test="log-${pet.id}"]`).exists()).toBe(false)
    expect(JSON.parse(localStorage.getItem('pets') || '[]')).toHaveLength(1)
  })

  it('removes the correct pet from this tracker only', async () => {
    const buddy = seedPet({ name: 'Buddy', medicineFrequency: '2' })
    const whiskers = seedPet({ name: 'Whiskers', medicineFrequency: '3' })
    const { wrapper } = await mountView()
    await wrapper.find(`[data-test="remove-pet-${buddy.id}"]`).trigger('click')
    await wrapper.findAll('button').find(button => button.text() === 'Remove from this tracker')!.trigger('click')
    expect(wrapper.text()).not.toContain('Buddy')
    expect(wrapper.text()).toContain('Whiskers')
    expect(wrapper.find(`[data-test="log-${buddy.id}"]`).exists()).toBe(false)
    expect(wrapper.find(`[data-test="log-${whiskers.id}"]`).exists()).toBe(true)
  })

  it('removes a pet from all trackers', async () => {
    const pet = seedPet({ name: 'Buddy', medicineFrequency: '2' })
    const { wrapper } = await mountView()
    await wrapper.find(`[data-test="remove-pet-${pet.id}"]`).trigger('click')
    await wrapper.findAll('button').find(button => button.text() === 'Remove from all trackers')!.trigger('click')
    expect(wrapper.text()).not.toContain('Buddy')
    expect(wrapper.find(`[data-test="log-${pet.id}"]`).exists()).toBe(false)
    const savedPets = JSON.parse(localStorage.getItem('pets') || '[]')
    expect(savedPets).toHaveLength(0)
  })
})
