import { it, describe, expect, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { createRouter, createWebHistory } from 'vue-router'
import DailyPottyTracker from '../Daily-potty-tracker.vue'
import { addPet } from '../pets.ts'

const makeRouter = () => createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/daily-potty-tracker', component: DailyPottyTracker },
    { path: '/get-started', component: { template: '<div>Get Started</div>' } },
    { path: '/homeView', component: { template: '<div>Home</div>' } },
    { path: '/daily-food-tracker', component: { template: '<div>Daily Food Tracker</div>' } },
    { path: '/daily-treat-tracker', component: { template: '<div>Daily Treat Tracker</div>' } },
    { path: '/daily-exercise-tracker', component: { template: '<div>Daily Exercise Tracker</div>' } },
    { path: '/daily-medicine-tracker', component: { template: '<div>Daily Medicine Tracker</div>' } },
  ]
})

const mountView = async () => {
  const router = makeRouter()
  router.push('/daily-potty-tracker')
  await router.isReady()
  const wrapper = mount(DailyPottyTracker, { global: { plugins: [router] } })
  return { wrapper, router }
}

const base = {
  type: 'Dog', name: 'Buddy', weight: '50', breed: 'Siberian Husky',
}

const seedPet = (overrides: Partial<typeof base> = {}) =>
  addPet({ ...base, ...overrides } as Parameters<typeof addPet>[0])

const todayDate = () => new Date().toLocaleDateString('en-US')

describe('DailyPottyTracker', () => {
  beforeEach(() => localStorage.clear())

  it('shows a setup prompt when there are no pets', async () => {
    const { wrapper } = await mountView()
    expect(wrapper.text()).toContain("It looks like you haven't set up your pet's information yet.")
    expect(wrapper.find('button').exists()).toBe(false)
  })

  it('reads  pet info from storage', async () => {
    seedPet({ name: 'Rex'})
    const { wrapper } = await mountView()
    expect(wrapper.text()).toContain('Rex')
    expect(wrapper.text()).toContain('0 potty breaks logged today.')
  })

  it('logs a potty break and persists the timestamp under the pet id', async () => {
    const pet = seedPet({ name: 'Cat' })
    const { wrapper } = await mountView()
    await wrapper.find(`[data-test="log-${pet.id}"]`).trigger('click')
    expect(wrapper.text()).toContain('1 potty break logged today.')
    const saved = localStorage.getItem(`pottyLog:${pet.id}:${todayDate()}`)
    expect(saved).not.toBeNull()
    const pottyBreaks = JSON.parse(saved!)
    expect(pottyBreaks).toHaveLength(1)
    expect(pottyBreaks[0]).toMatch(/\d{1,2}:\d{2} (AM|PM)/)
  })

  it('restores today\'s saved potty breaks', async () => {
    const pet = seedPet({ name: 'Bird' })
    localStorage.setItem(`pottyLog:${pet.id}:${todayDate()}`, JSON.stringify(['7:30 AM', '11:45 AM']))
    const { wrapper } = await mountView()
    expect(wrapper.text()).toContain('2 potty breaks logged today.')
    expect(wrapper.text()).toContain('7:30 AM')
    expect(wrapper.text()).toContain('11:45 AM')
  })

  it('resets today\'s potty break history', async () => {
    const pet = seedPet({ name: 'Fish' })
    localStorage.setItem(`pottyLog:${pet.id}:${todayDate()}`, JSON.stringify(['7:30 AM', '11:45 AM']))
    const { wrapper } = await mountView()
    await wrapper.find(`[data-test="reset-${pet.id}"]`).trigger('click')
    expect(wrapper.text()).toContain('0 potty breaks logged today.')
    expect(wrapper.text()).not.toContain('7:30 AM')
    expect(wrapper.text()).not.toContain('11:45 AM')
    expect(localStorage.getItem(`pottyLog:${pet.id}:${todayDate()}`)).toBeNull()
  })

  it('renders one tracker per registered pet', async () => {
    seedPet({ name: 'Buddy' })
    seedPet({ name: 'Whiskers' })
    const { wrapper } = await mountView()
    expect(wrapper.findAll('.pet-tracker')).toHaveLength(2)
    expect(wrapper.text()).toContain('Buddy')
    expect(wrapper.text()).toContain('Whiskers')
  })

  it('logs potty break for the correct pet', async () => {
    const buddy = seedPet({ name: 'Buddy' })
    const whiskers = seedPet({ name: 'Whiskers' })
    const { wrapper } = await mountView()
    await wrapper.find(`[data-test="log-${whiskers.id}"]`).trigger('click')
    expect(wrapper.text()).toContain('1 potty break logged today.')
    expect(wrapper.text()).toContain('0 potty breaks logged today.')
    expect(localStorage.getItem(`pottyLog:${buddy.id}:${todayDate()}`)).toBeNull()
  })

  it('keeps separate logs for different pets', async () => {
    seedPet({ name: 'Buddy' })
    const whiskers = seedPet({ name: 'Whiskers' })
    const { wrapper } = await mountView()
    const logWhiskers = wrapper.find(`[data-test="log-${whiskers.id}"]`)
    await logWhiskers.trigger('click')
    await logWhiskers.trigger('click')
    expect(wrapper.text()).toContain('2 potty breaks logged today.')
    expect(wrapper.text()).toContain('0 potty breaks logged today.')
  })

  it('logs multiple potty breaks for the same pet', async () => {
    const pet = seedPet({ name: 'Buddy' })
    const { wrapper } = await mountView()
    const button = wrapper.find(`[data-test="log-${pet.id}"]`)
    await button.trigger('click')
    await button.trigger('click')
    await button.trigger('click')
    expect(wrapper.text()).toContain('3 potty breaks logged today.')
    const saved = localStorage.getItem(`pottyLog:${pet.id}:${todayDate()}`)
    const pottyBreaks = JSON.parse(saved!)
    expect(pottyBreaks).toHaveLength(3)
  })

  it('links to the home page', async () => {
    seedPet({ name: 'Buddy' })
    const router = makeRouter()
    const wrapper = mount(DailyPottyTracker, { global: { plugins: [router] } })
    await router.isReady()
    const link = wrapper.find("a[href='/']")
    expect(link.exists()).toBe(true)
    expect(link.text()).toContain('Home')
  })

  it('links to the get-started page', async () => {
    seedPet({ name: 'Buddy' })
    const router = makeRouter()
    const wrapper = mount(DailyPottyTracker, { global: { plugins: [router] } })
    await router.isReady()
    const link = wrapper.find("a[href='/get-started']")
    expect(link.exists()).toBe(true)
    expect(link.text()).toContain('Get Started')
  })

  it('links to the daily food tracker page', async () => {
    seedPet({ name: 'Buddy' })
    const router = makeRouter()
    const wrapper = mount(DailyPottyTracker, { global: { plugins: [router] } })
    await router.isReady()
    const link = wrapper.find("a[href='/daily-food-tracker']")
    expect(link.exists()).toBe(true)
    expect(link.text()).toContain('Daily Food Tracker')
  })

  it('links to the daily treat tracker page', async () => {
    seedPet({ name: 'Buddy' })
    const router = makeRouter()
    const wrapper = mount(DailyPottyTracker, { global: { plugins: [router] } })
    await router.isReady()
    const link = wrapper.find("a[href='/daily-treat-tracker']")
    expect(link.exists()).toBe(true)
    expect(link.text()).toContain('Daily Treat Tracker')
  })

  it('links to the daily exercise tracker page', async () => {
    seedPet({ name: 'Buddy' })
    const router = makeRouter()
    const wrapper = mount(DailyPottyTracker, { global: { plugins: [router] } })
    await router.isReady()
    const link = wrapper.find("a[href='/daily-exercise-tracker']")
    expect(link.exists()).toBe(true)
    expect(link.text()).toContain('Daily Exercise Tracker')
  })

  it('links to the daily medicine tracker page', async () => {
    seedPet({ name: 'Buddy' })
    const router = makeRouter()
    const wrapper = mount(DailyPottyTracker, { global: { plugins: [router] } })
    await router.isReady()
    const link = wrapper.find("a[href='/daily-medicine-tracker']")
    expect(link.exists()).toBe(true)
    expect(link.text()).toContain('Daily Medicine Tracker')
  })

  it('removes a log from the potty count', async () => {
    const pet = seedPet({ name: 'Buddy' })
    const { wrapper } = await mountView()
    await wrapper.find(`[data-test="log-${pet.id}"]`).trigger('click')
    expect(wrapper.text()).toContain('1 potty break logged today.')
    await wrapper.find(`[data-test="remove-log-${pet.id}"]`).trigger('click')
    expect(wrapper.text()).toContain('0 potty breaks logged today.')
  })

  it('removes a log from the potty count for the correct pet', async () => {
    const buddy = seedPet({ name: 'Buddy' })
    const whiskers = seedPet({ name: 'Whiskers' })
    const { wrapper } = await mountView()
    await wrapper.find(`[data-test="log-${whiskers.id}"]`).trigger('click')
    await wrapper.find(`[data-test="log-${whiskers.id}"]`).trigger('click')
    await wrapper.find(`[data-test="log-${buddy.id}"]`).trigger('click')
    expect(wrapper.text()).toContain('1 potty break logged today.')
    expect(wrapper.text()).toContain('2 potty breaks logged today.')
    await wrapper.find(`[data-test="remove-log-${whiskers.id}"]`).trigger('click')
    expect(wrapper.text()).toContain('1 potty break logged today.')
    expect(wrapper.text()).toContain('1 potty break logged today.')
  })

  it('removes a pet from this tracker only', async () => {
    const pet = seedPet({ name: 'Buddy' })
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
    const buddy = seedPet({ name: 'Buddy' })
    const whiskers = seedPet({ name: 'Whiskers' })
    const { wrapper } = await mountView()
    await wrapper.find(`[data-test="remove-pet-${buddy.id}"]`).trigger('click')
    await wrapper.findAll('button').find(button => button.text() === 'Remove from this tracker')!.trigger('click')
    expect(wrapper.text()).not.toContain('Buddy')
    expect(wrapper.text()).toContain('Whiskers')
    expect(wrapper.find(`[data-test="log-${buddy.id}"]`).exists()).toBe(false)
    expect(wrapper.find(`[data-test="log-${whiskers.id}"]`).exists()).toBe(true)
  })

  it('removes a pet from all trackers', async () => {
    const pet = seedPet({ name: 'Buddy' })
    const { wrapper } = await mountView()
    await wrapper.find(`[data-test="remove-pet-${pet.id}"]`).trigger('click')
    await wrapper.findAll('button').find(button => button.text() === 'Remove from all trackers')!.trigger('click')
    expect(wrapper.text()).not.toContain('Buddy')
    expect(wrapper.find(`[data-test="log-${pet.id}"]`).exists()).toBe(false)
    const savedPets = JSON.parse(localStorage.getItem('pets') || '[]')
    expect(savedPets).toHaveLength(0)
  })

  it('has a dark mode toggle', async () => {
    const router = makeRouter()
    const wrapper = mount(DailyPottyTracker, { global: { plugins: [router] } })
    const toggle = wrapper.find('#dark-mode-toggle')
    expect(toggle.exists()).toBe(true)
    expect(toggle.element.getAttribute('type')).toBe('checkbox')
  })

  it('changes the page background when dark mode is toggled', async () => {
    const router = makeRouter()
    const wrapper = mount(DailyPottyTracker, { global: { plugins: [router] } })
    expect(wrapper.find('.sun-icon').exists()).toBe(true)
    expect(wrapper.find('.moon-icon').exists()).toBe(false)
    await wrapper.find('#dark-mode-toggle').setValue(true)
    expect(wrapper.find('main').classes()).toContain('dark-mode')
    expect(wrapper.find('.sun-icon').exists()).toBe(false)
    expect(wrapper.find('.moon-icon').exists()).toBe(true)
    await wrapper.find('#dark-mode-toggle').setValue(false)
    expect(wrapper.find('main').classes()).not.toContain('dark-mode')
    expect(wrapper.find('.sun-icon').exists()).toBe(true)
    expect(wrapper.find('.moon-icon').exists()).toBe(false)
  })
})
