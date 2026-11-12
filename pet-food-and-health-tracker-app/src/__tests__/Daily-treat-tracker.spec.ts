import { it, describe, expect, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { createRouter, createWebHistory } from 'vue-router'
import DailyTreatTracker from '../Daily-treat-tracker.vue'
import { addPet } from '../pets.ts'

const makeRouter = () => createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/daily-treat-tracker', component: DailyTreatTracker },
    { path: '/get-started', component: { template: '<div>Get Started</div>' } },
    { path: '/homeView', component: { template: '<div>Home</div>' } },
    { path: '/daily-food-tracker', component: { template: '<div>Daily Food Tracker</div>' } },
    { path: '/daily-exercise-tracker', component: { template: '<div>Daily Exercise Tracker</div>' } },
    { path: '/daily-medicine-tracker', component: { template: '<div>Daily Medicine Tracker</div>' } },
    { path: '/daily-potty-tracker', component: { template: '<div>Daily Potty Tracker</div>' } },
  ],
})

const mountView = async () => {
  const router = makeRouter()
  router.push('/daily-treat-tracker')
  await router.isReady()
  const wrapper = mount(DailyTreatTracker, { global: { plugins: [router] } })
  return { wrapper, router}
}

const base = {
  type: 'Dog', name: 'Buddy', weight: '50', breed: 'Siberian Husky', foodFrequency: '2', treatFrequency: '5',
}

const seedPet = (overrides: Partial<typeof base> = {}) =>
  addPet({ ...base, ...overrides } as Parameters<typeof addPet>[0])

const todayDate = () => new Date().toLocaleDateString('en-US')

describe('DailyTreatTracker', () => {
  beforeEach(() => localStorage.clear())

  it('shows a setup prompt when there are no pets', async () => {
    const { wrapper } = await mountView()
    expect(wrapper.text()).toContain("It looks like you haven't set up your pet's information yet.")
    expect(wrapper.find('button').exists()).toBe(false)
  })

  it('reads pet info from storage', async () => {
    seedPet({ name: 'Rex', treatFrequency: '3' })
    const { wrapper } = await mountView()
    expect(wrapper.text()).toContain('Rex')
    expect(wrapper.text()).toContain('0 of 3 treats given today.')
  })

  it('increments the treat count and persists under the pet id', async () => {
    const pet = seedPet({ name: 'Cat', treatFrequency: '2' })
    const { wrapper } = await mountView()
    await wrapper.find(`[data-test="log-${pet.id}"]`).trigger('click')
    expect(wrapper.text()).toContain('1 of 2 treats given today.')
    expect(localStorage.getItem(`treatLog:${pet.id}:${todayDate()}`)).toBe('1')
  })

  it('restores the treat count from today\'s saved log', async () => {
    const pet = seedPet({ name: 'Bird', treatFrequency: '3' })
    localStorage.setItem(`treatLog:${pet.id}:${todayDate()}`, '2')
    const { wrapper } = await mountView()
    expect(wrapper.text()).toContain('2 of 3 treats given today.')
  })

  it('does not allow treat count to exceed the daily limit', async () => {
    const pet = seedPet({ name: 'Rabbit', treatFrequency: '1' })
    const { wrapper } = await mountView()
    const logBtn = () => wrapper.find(`[data-test="log-${pet.id}"]`)
    await logBtn().trigger('click')
    expect(wrapper.text()).toContain('1 of 1 treats given today.')
    expect(logBtn().attributes('disabled')).toBeDefined()
  })

  it('resets today\'s treat count', async () => {
    const pet = seedPet({ name: 'Fish', treatFrequency: '2' })
    localStorage.setItem(`treatLog:${pet.id}:${todayDate()}`, '1')
    const { wrapper } = await mountView()
    await wrapper.find(`[data-test="reset-${pet.id}"]`).trigger('click')
    expect(wrapper.text()).toContain('0 of 2 treats given today.')
    expect(localStorage.getItem(`treatLog:${pet.id}:${todayDate()}`)).toBeNull()
  })

  it('renders one tracker per registered pet', async () => {
    seedPet({ name: 'Buddy' })
    seedPet({ name: 'Whiskers', type: 'Cat', treatFrequency: '3' })
    const { wrapper } = await mountView()
    expect(wrapper.findAll('.pet-tracker')).toHaveLength(2)
    expect(wrapper.text()).toContain('Buddy')
    expect(wrapper.text()).toContain('Whiskers')
  })

  it('logs a treat for the correct pet', async () => {
    const buddy = seedPet({ name: 'Buddy', treatFrequency: '2' })
    const whiskers = seedPet({ name: 'Whiskers', type: 'Cat', treatFrequency: '3' })
    const { wrapper } = await mountView()
    await wrapper.find(`[data-test="log-${whiskers.id}"]`).trigger('click')
    expect(wrapper.text()).toContain('1 of 3 treats given today.')
    expect(wrapper.text()).toContain('0 of 2 treats given today.')
    expect(localStorage.getItem(`treatLog:${buddy.id}:${todayDate()}`)).toBeNull()
  })

  it('writes each pet\'s log under its own key', async () => {
    const pet = seedPet({ name: 'Buddy', treatFrequency: '2' })
    const { wrapper } = await mountView()
    await wrapper.find(`[data-test="log-${pet.id}"]`).trigger('click')
    expect(localStorage.getItem(`treatLog:${pet.id}:${todayDate()}`)).toBe('1')
  })

  it('keeps separate logs for different pets', async () => {
    seedPet({ name: 'Buddy', treatFrequency: '2' })
    const whiskers = seedPet({ name: 'Whiskers', type: 'Cat', treatFrequency: '3' })
    const { wrapper } = await mountView()
    const logWhiskers = () => wrapper.find(`[data-test="log-${whiskers.id}"]`)
    await logWhiskers().trigger('click')
    await logWhiskers().trigger('click')
    expect(wrapper.text()).toContain('2 of 3 treats given today.')
    expect(wrapper.text()).toContain('0 of 2 treats given today.')
  })

  it('links to the home page', async () => {
    seedPet({ name: 'Buddy', treatFrequency: '2' })
    const router = makeRouter()
    const wrapper = mount(DailyTreatTracker, { global: { plugins: [router] } })
    await router.isReady()
    const link = wrapper.find("a[href='/']")
    expect(link.exists()).toBe(true)
    expect(link.text()).toContain('Home')
  })

  it('links to the get-started page', async () => {
    seedPet({ name: 'Buddy', treatFrequency: '2' })
    const router = makeRouter()
    const wrapper = mount(DailyTreatTracker, { global: { plugins: [router] } })
    await router.isReady()
    const link = wrapper.find("a[href='/get-started']")
    expect(link.exists()).toBe(true)
    expect(link.text()).toContain('Get Started')
  })

  it('links to the daily food tracker page', async () => {
    seedPet({ name: 'Buddy', treatFrequency: '2' })
    const router = makeRouter()
    const wrapper = mount(DailyTreatTracker, { global: { plugins: [router] } })
    await router.isReady()
    const link = wrapper.find("a[href='/daily-food-tracker']")
    expect(link.exists()).toBe(true)
    expect(link.text()).toContain('Daily Food Tracker')
  })

  it('links to the daily exercise tracker page', async () => {
    seedPet({ name: 'Buddy', treatFrequency: '2' })
    const router = makeRouter()
    const wrapper = mount(DailyTreatTracker, { global: { plugins: [router] } })
    await router.isReady()
    const link = wrapper.find("a[href='/daily-exercise-tracker']")
    expect(link.exists()).toBe(true)
    expect(link.text()).toContain('Daily Exercise Tracker')
  })

  it('links to the daily medicine tracker page', async () => {
    seedPet({ name: 'Buddy', treatFrequency: '2' })
    const router = makeRouter()
    const wrapper = mount(DailyTreatTracker, { global: { plugins: [router] } })
    await router.isReady()
    const link = wrapper.find("a[href='/daily-medicine-tracker']")
    expect(link.exists()).toBe(true)
    expect(link.text()).toContain('Daily Medicine Tracker')
  })

  it('links to the daily potty tracker page', async () => {
    seedPet({ name: 'Buddy', treatFrequency: '2' })
    const router = makeRouter()
    const wrapper = mount(DailyTreatTracker, { global: { plugins: [router] } })
    await router.isReady()
    const link = wrapper.find("a[href='/daily-potty-tracker']")
    expect(link.exists()).toBe(true)
    expect(link.text()).toContain('Daily Potty Tracker')
  })

  it('removes a log from the treat count', async () => {
    const pet = seedPet({ name: 'Buddy', treatFrequency: '2' })
    const { wrapper } = await mountView()
    await wrapper.find(`[data-test="log-${pet.id}"]`).trigger('click')
    expect(wrapper.text()).toContain('1 of 2 treats given today.')
    expect(localStorage.getItem(`treatLog:${pet.id}:${todayDate()}`)).toBe('1')
    await wrapper.find(`[data-test="remove-log-${pet.id}"]`).trigger('click')
    expect(wrapper.text()).toContain('0 of 2 treats given today.')
    expect(localStorage.getItem(`treatLog:${pet.id}:${todayDate()}`)).toBe('0')
  })

  it('removes a log from the treat count for the correct pet', async () => {
    const buddy = seedPet({ name: 'Buddy', treatFrequency: '2' })
    const whiskers = seedPet({ name: 'Whiskers', treatFrequency: '3' })
    const { wrapper } = await mountView()
    await wrapper.find(`[data-test="log-${whiskers.id}"]`).trigger('click')
    await wrapper.find(`[data-test="log-${whiskers.id}"]`).trigger('click')
    await wrapper.find(`[data-test="log-${buddy.id}"]`).trigger('click')
    expect(wrapper.text()).toContain('1 of 2 treats given today.')
    expect(wrapper.text()).toContain('2 of 3 treats given today.')
    await wrapper.find(`[data-test="remove-log-${whiskers.id}"]`).trigger('click')
    expect(wrapper.text()).toContain('1 of 3 treats given today.')
    expect(wrapper.text()).toContain('1 of 2 treats given today.')
    expect(localStorage.getItem(`treatLog:${whiskers.id}:${todayDate()}`)).toBe('1')
    expect(localStorage.getItem(`treatLog:${buddy.id}:${todayDate()}`)).toBe('1')
  })

  it('removes a pet from this tracker only', async () => {
    const pet = seedPet({ name: 'Buddy', treatFrequency: '2' })
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
    const buddy = seedPet({ name: 'Buddy', treatFrequency: '2' })
    const whiskers = seedPet({ name: 'Whiskers', treatFrequency: '3' })
    const { wrapper } = await mountView()
    await wrapper.find(`[data-test="remove-pet-${buddy.id}"]`).trigger('click')
    await wrapper.findAll('button').find(button => button.text() === 'Remove from this tracker')!.trigger('click')
    expect(wrapper.text()).not.toContain('Buddy')
    expect(wrapper.text()).toContain('Whiskers')
    expect(wrapper.find(`[data-test="log-${buddy.id}"]`).exists()).toBe(false)
    expect(wrapper.find(`[data-test="log-${whiskers.id}"]`).exists()).toBe(true)
  })

  it('removes a pet from all trackers', async () => {
    const pet = seedPet({ name: 'Buddy', treatFrequency: '2' })
    const { wrapper } = await mountView()
    await wrapper.find(`[data-test="remove-pet-${pet.id}"]`).trigger('click')
    await wrapper.findAll('button').find(button => button.text() === 'Remove from all trackers')!.trigger('click')
    expect(wrapper.text()).not.toContain('Buddy')
    expect(wrapper.find(`[data-test="log-${pet.id}"]`).exists()).toBe(false)
    const savedPets = JSON.parse(localStorage.getItem('pets') || '[]')
    expect(savedPets).toHaveLength(0)
  })
})
