import { it, describe, expect, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { createRouter, createMemoryHistory } from 'vue-router'
import DailyFoodTracker from '../Daily-food-tracker.vue'
import { addPet } from '../pets'

const makeRouter = () => createRouter({
  history: createMemoryHistory(),
  routes: [
    { path: '/daily-food-tracker', component: DailyFoodTracker },
    { path: '/get-started', component: { template: '<div>Get Started</div>' } },
    { path: '/homeView', component: { template: '<div>Home</div>' } },
    { path: '/daily-treat-tracker', component: { template: '<div>Daily Treat Tracker</div>' } },
    { path: '/daily-exercise-tracker', component: { template: '<div>Daily Exercise Tracker</div>' } },
    { path: '/daily-medicine-tracker', component: { template: '<div>Daily Medicine Tracker</div>' } },
    { path: '/daily-potty-tracker', component: { template: '<div>Daily Potty Tracker</div>' } },
  ],
})

const mountView = async () => {
  const router = makeRouter()
  router.push('/daily-food-tracker')
  await router.isReady()
  const wrapper = mount(DailyFoodTracker, { global: { plugins: [router] } })
  return { wrapper, router }
}

const base = {
  type: 'Dog', name: 'Buddy', weight: '50', breed: 'Siberian Husky', foodFrequency: '2', treatFrequency: '5',
}

const seedPet = (overrides: Partial<typeof base> = {}) =>
  addPet({ ...base, ...overrides } as Parameters<typeof addPet>[0])

const todayDate = () => new Date().toLocaleDateString('en-US')

describe('DailyFoodTracker', () => {
  beforeEach(() => localStorage.clear())

  it('shows a setup prompt when there are no pets', async () => {
    const { wrapper } = await mountView()
    expect(wrapper.text()).toContain("It looks like you haven't set up your pet's information yet.")
    expect(wrapper.find('button').exists()).toBe(false)
  })

  it('reads pet info from storage', async () => {
    seedPet({ name: 'Rex', foodFrequency: '3' })
    const { wrapper } = await mountView()
    expect(wrapper.text()).toContain('Rex')
    expect(wrapper.text()).toContain('0 of 3 feedings given today.')
  })

  it('increments the feed count and persists under the pet id', async () => {
    const pet = seedPet({ name: 'Cat', foodFrequency: '2' })
    const { wrapper } = await mountView()
    await wrapper.find(`[data-test="log-${pet.id}"]`).trigger('click')
    expect(wrapper.text()).toContain('1 of 2 feedings given today.')
    expect(localStorage.getItem(`foodLog:${pet.id}:${todayDate()}`)).toBe('1')
  })

  it("restores the feed count from today's saved log", async () => {
    const pet = seedPet({ name: 'Bird', foodFrequency: '3' })
    localStorage.setItem(`foodLog:${pet.id}:${todayDate()}`, '2')
    const { wrapper } = await mountView()
    expect(wrapper.text()).toContain('2 of 3 feedings given today.')
  })

  it('does not allow feed count to exceed the daily limit', async () => {
    const pet = seedPet({ name: 'Rabbit', foodFrequency: '1' })
    const { wrapper } = await mountView()
    const logBtn = () => wrapper.find(`[data-test="log-${pet.id}"]`)
    await logBtn().trigger('click')
    expect(wrapper.text()).toContain('1 of 1 feedings given today.')
    expect(logBtn().attributes('disabled')).toBeDefined()
  })

  it("resets today's feed count", async () => {
    const pet = seedPet({ name: 'Fish', foodFrequency: '2' })
    localStorage.setItem(`foodLog:${pet.id}:${todayDate()}`, '1')
    const { wrapper } = await mountView()
    await wrapper.find(`[data-test="reset-${pet.id}"]`).trigger('click')
    expect(wrapper.text()).toContain('0 of 2 feedings given today.')
    expect(localStorage.getItem(`foodLog:${pet.id}:${todayDate()}`)).toBeNull()
  })

  it('renders one tracker per registered pet', async () => {
    seedPet({ name: 'Buddy' })
    seedPet({ name: 'Whiskers', type: 'Cat', foodFrequency: '3' })
    const { wrapper } = await mountView()
    expect(wrapper.findAll('.pet-tracker')).toHaveLength(2)
    expect(wrapper.text()).toContain('Buddy')
    expect(wrapper.text()).toContain('Whiskers')
  })

  it('logs a feeding for the correct pet', async () => {
    const buddy = seedPet({ name: 'Buddy', foodFrequency: '2' })
    const whiskers = seedPet({ name: 'Whiskers', type: 'Cat', foodFrequency: '3' })
    const { wrapper } = await mountView()
    await wrapper.find(`[data-test="log-${whiskers.id}"]`).trigger('click')
    expect(wrapper.text()).toContain('1 of 3 feedings given today.')
    expect(wrapper.text()).toContain('0 of 2 feedings given today.')
    expect(localStorage.getItem(`foodLog:${buddy.id}:${todayDate()}`)).toBeNull()
  })

  it("writes each pet's log under its own key", async () => {
    const pet = seedPet({ name: 'Buddy', foodFrequency: '2' })
    const { wrapper } = await mountView()
    await wrapper.find(`[data-test="log-${pet.id}"]`).trigger('click')
    expect(localStorage.getItem(`foodLog:${pet.id}:${todayDate()}`)).toBe('1')
  })

  it('keeps separate logs for different pets', async () => {
    seedPet({ name: 'Buddy', foodFrequency: '2' })
    const whiskers = seedPet({ name: 'Whiskers', type: 'Cat', foodFrequency: '3' })
    const { wrapper } = await mountView()
    const logWhiskers = () => wrapper.find(`[data-test="log-${whiskers.id}"]`)
    await logWhiskers().trigger('click')
    await logWhiskers().trigger('click')
    expect(wrapper.text()).toContain('2 of 3 feedings given today.')
    expect(wrapper.text()).toContain('0 of 2 feedings given today.')
  })

  it('links to the home page', async () => {
    seedPet({ name: 'Buddy', foodFrequency: '2' })
    const router = makeRouter()
    const wrapper = mount(DailyFoodTracker, { global: { plugins: [router] } })
    await router.isReady()
    const link = wrapper.find("a[href='/']")
    expect(link.exists()).toBe(true)
    expect(link.text()).toContain('Home')
  })

  it('links to the get-started page', async () => {
    seedPet({ name: 'Buddy', foodFrequency: '2' })
    const router = makeRouter()
    const wrapper = mount(DailyFoodTracker, { global: { plugins: [router] } })
    await router.isReady()
    const link = wrapper.find("a[href='/get-started']")
    expect(link.exists()).toBe(true)
    expect(link.text()).toContain('Get Started')
  })

  it('links to the daily treat tracker page', async () => {
    seedPet({ name: 'Buddy', foodFrequency: '2' })
    const router = makeRouter()
    const wrapper = mount(DailyFoodTracker, { global: { plugins: [router] } })
    await router.isReady()
    const link = wrapper.find("a[href='/daily-treat-tracker']")
    expect(link.exists()).toBe(true)
    expect(link.text()).toContain('Daily Treat Tracker')
  })

  it('links to the daily exercise tracker page', async () => {
    seedPet({ name: 'Buddy', foodFrequency: '2' })
    const router = makeRouter()
    const wrapper = mount(DailyFoodTracker, { global: { plugins: [router] } })
    await router.isReady()
    const link = wrapper.find("a[href='/daily-exercise-tracker']")
    expect(link.exists()).toBe(true)
    expect(link.text()).toContain('Daily Exercise Tracker')
  })

  it('links to the daily medicine tracker page', async () => {
    seedPet({ name: 'Buddy', foodFrequency: '2' })
    const router = makeRouter()
    const wrapper = mount(DailyFoodTracker, { global: { plugins: [router] } })
    await router.isReady()
    const link = wrapper.find("a[href='/daily-medicine-tracker']")
    expect(link.exists()).toBe(true)
    expect(link.text()).toContain('Daily Medicine Tracker')
  })

  it('links to the daily potty tracker page', async () => {
    seedPet({ name: 'Buddy', foodFrequency: '2' })
    const router = makeRouter()
    const wrapper = mount(DailyFoodTracker, { global: { plugins: [router] } })
    await router.isReady()
    const link = wrapper.find("a[href='/daily-potty-tracker']")
    expect(link.exists()).toBe(true)
    expect(link.text()).toContain('Daily Potty Tracker')
  })

  it('removes a log from the feed count', async () => {
    const pet = seedPet({ name: 'Buddy', foodFrequency: '2' })
    const { wrapper } = await mountView()
    await wrapper.find(`[data-test="log-${pet.id}"]`).trigger('click')
    expect(wrapper.text()).toContain('1 of 2 feedings given today.')
    expect(localStorage.getItem(`foodLog:${pet.id}:${todayDate()}`)).toBe('1')
    await wrapper.find(`[data-test="remove-log-${pet.id}"]`).trigger('click')
    expect(wrapper.text()).toContain('0 of 2 feedings given today.')
    expect(localStorage.getItem(`foodLog:${pet.id}:${todayDate()}`)).toBe('0')
  })

  it('removes a log from the feed count for the correct pet', async () => {
    const buddy = seedPet({ name: 'Buddy', foodFrequency: '2' })
    const whiskers = seedPet({ name: 'Whiskers', foodFrequency: '3' })
    const { wrapper } = await mountView()
    await wrapper.find(`[data-test="log-${whiskers.id}"]`).trigger('click')
    await wrapper.find(`[data-test="log-${whiskers.id}"]`).trigger('click')
    await wrapper.find(`[data-test="log-${buddy.id}"]`).trigger('click')
    expect(wrapper.text()).toContain('1 of 2 feedings given today.')
    expect(wrapper.text()).toContain('2 of 3 feedings given today.')
    await wrapper.find(`[data-test="remove-log-${whiskers.id}"]`).trigger('click')
    expect(wrapper.text()).toContain('1 of 3 feedings given today.')
    expect(wrapper.text()).toContain('1 of 2 feedings given today.')
    expect(localStorage.getItem(`foodLog:${whiskers.id}:${todayDate()}`)).toBe('1')
    expect(localStorage.getItem(`foodLog:${buddy.id}:${todayDate()}`)).toBe('1')
  })

  it('removes a pet', async () => {
    const pet = seedPet({ name: 'Buddy', foodFrequency: '2' })
    const { wrapper } = await mountView()
    await wrapper.find(`[data-test="remove-pet-${pet.id}"]`).trigger('click')
    expect(wrapper.text()).not.toContain('Buddy')
    expect(wrapper.find(`[data-test="log-${pet.id}"]`).exists()).toBe(false)
  })

  it('removes the correct pet', async () => {
    const buddy = seedPet({ name: 'Buddy', foodFrequency: '2' })
    const whiskers = seedPet({ name: 'Whiskers', foodFrequency: '3' })
    const { wrapper } = await mountView()
    await wrapper.find(`[data-test="remove-pet-${buddy.id}"]`).trigger('click')
    expect(wrapper.text()).not.toContain('Buddy')
    expect(wrapper.text()).toContain('Whiskers')
    expect(wrapper.find(`[data-test="log-${buddy.id}"]`).exists()).toBe(false)
    expect(wrapper.find(`[data-test="log-${whiskers.id}"]`).exists()).toBe(true)
  })
})

