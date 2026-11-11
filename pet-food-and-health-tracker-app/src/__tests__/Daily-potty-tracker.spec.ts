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
})
