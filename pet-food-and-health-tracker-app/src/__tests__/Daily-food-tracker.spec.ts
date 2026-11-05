import { it, describe, expect, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { createRouter, createMemoryHistory } from 'vue-router'
import DailyFoodTracker from '../Daily-food-tracker.vue'

const makeRouter = () =>
  createRouter({
    history: createMemoryHistory(),
    routes: [
      { path: '/daily-food-tracker', component: DailyFoodTracker },
      { path: '/get-started', component: { template: '<div>Get Started</div>' } },
    ],
  })

const mountView = async () => {
  const router = makeRouter()
  router.push('/daily-food-tracker')
  await router.isReady()
  const wrapper = mount(DailyFoodTracker, { global: { plugins: [router] } })
  return { wrapper, router }
}

const seedSetup = (pet = 'Dog', frequency = '2') => {
  localStorage.setItem('userPet', pet)
  localStorage.setItem('userPetFoodFrequency', frequency)
}

describe('DailyFoodTracker', () => {
  beforeEach(() => localStorage.clear())

  it('shows a setup prompt when there is no pet info in localStorage', async () => {
    const { wrapper } = await mountView()
    expect(wrapper.text()).toContain('It looks like you haven\'t set up your pet\'s information yet.')
    expect(wrapper.find('button').exists()).toBe(false)
  })

  it('reads pet info from localStorage', async () => {
    seedSetup('Dog', '3')
    const { wrapper } = await mountView()
    expect(wrapper.text()).toContain('Dog')
    expect(wrapper.text()).toContain('0 of 3 feedings given today.')
  })

  it('increments the feed count for the day', async () => {
    seedSetup('Cat', '2')
    const { wrapper } = await mountView()
    await wrapper.findAll('button').find(b => b.text() === 'Log feeding')!.trigger('click')
    expect(wrapper.text()).toContain('1 of 2 feedings given today.')
    const todayDate = new Date().toLocaleDateString('en-CA')
    expect(localStorage.getItem(`foodLog:${todayDate}`)).toBe('1')
  })

  it('restores the feed count from today\'s saved log', async () => {
    seedSetup('Bird', '3')
    const todayDate = new Date().toLocaleDateString('en-CA')
    localStorage.setItem(`foodLog:${todayDate}`, '2')
    const { wrapper } = await mountView()
    expect(wrapper.text()).toContain('2 of 3 feedings given today.')
  })

  it('does not allow feed count to exceed the daily limit', async () => {
    seedSetup('Rabbit', '1')
    const { wrapper } = await mountView()
    await wrapper.findAll('button').find(b => b.text() === 'Log feeding')!.trigger('click')
    expect(wrapper.text()).toContain('1 of 1 feedings given today.')
    await wrapper.findAll('button').find(b => b.text() === 'Log feeding')!.trigger('click')
    expect(wrapper.text()).toContain('1 of 1 feedings given today.')
    expect(wrapper.findAll('button').find(b => b.text() === 'Log feeding')!.attributes('disabled')).toBeDefined()
  })

  it('resets today\'s feed count', async () => {
    seedSetup('Fish', '2')
    const todayDate = new Date().toLocaleDateString('en-CA')
    localStorage.setItem(`foodLog:${todayDate}`, '1')
    const { wrapper } = await mountView()
    await wrapper.findAll('button').find(b => b.text() === 'Reset feed count')!.trigger('click')
    expect(wrapper.text()).toContain('0 of 2 feedings given today.')
    expect(localStorage.getItem(`foodLog:${todayDate}`)).toBeNull()
  })
})
