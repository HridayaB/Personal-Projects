import { it, describe, expect, beforeEach, afterEach, vi } from 'vitest'
import { nextTick } from 'vue'
import { mount } from '@vue/test-utils'
import { createRouter, createWebHistory } from 'vue-router'
import DailyExerciseTracker from '../Daily-exercise-tracker.vue'
import { addPet } from '../pets.ts'

const makeRouter = () => createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/daily-exercise-tracker', component: DailyExerciseTracker },
    { path: '/get-started', component: { template: '<div>Get Started</div>' }},
  ],
})

const mountView = async () => {
  const router = makeRouter()
  router.push('/daily-exercise-tracker')
  await router.isReady()
  const wrapper = mount(DailyExerciseTracker, { global: { plugins: [router] } })
  return { wrapper, router }
}

const base = {
  type: 'Dog', name: 'Buddy', weight: '50', breed: 'Siberian Husky', foodFrequency: '2', treatFrequency: '5', exerciseFrequency: '3', exerciseDuration: '30', exerciseTypes: '2', exerciseLabels: [] as string[],
}

const seedPet = (overrides: Partial<typeof base> = {}) =>
  addPet({ ...base, ...overrides } as Parameters<typeof addPet>[0])

const todayDate = () => new Date().toLocaleDateString('en-US')

describe('DailyExerciseTracker', () => {
  beforeEach(() => localStorage.clear())
  afterEach(() => {
    vi.clearAllTimers()
    vi.useRealTimers()
  })

  it('shows a setup prompt when there are no pets', async () => {
    const { wrapper } = await mountView()
    expect(wrapper.text()).toContain("It looks like you haven't set up your pet's information yet.")
    expect(wrapper.find('button').exists()).toBe(false)
  })

  it('reads pet info from storage', async () => {
    seedPet({ name: 'Rex', exerciseFrequency: '3', exerciseDuration: '30', exerciseTypes: '2', exerciseLabels: ['walk', 'run'], })
    const { wrapper } = await mountView()
    expect(wrapper.text()).toContain('Rex')
    expect(wrapper.text()).toContain('0 of 3 exercise sessions done today.')
  })

  it('increments the exercise count and persists under the pet id', async () => {
    const pet = seedPet({ name: 'Cat', exerciseFrequency: '3', exerciseDuration: '30', exerciseTypes: '2', exerciseLabels: ['walk', 'run'], })
    const { wrapper } = await mountView()
    await wrapper.find(`[data-test="log-${pet.id}"]`).trigger('click')
    expect(wrapper.text()).toContain('1 of 3 exercise sessions done today.')
    expect(localStorage.getItem(`exerciseLog:${pet.id}:${todayDate()}`)).toBe('1')
  })

  it('restores the exercise count from today\'s saved log', async () => {
    const pet = seedPet({ name: 'Bird', exerciseFrequency: '3', exerciseDuration: '30', exerciseTypes: '2', exerciseLabels: ['walk', 'run'], })
    localStorage.setItem(`exerciseLog:${pet.id}:${todayDate()}`, '2')
    const { wrapper } = await mountView()
    expect(wrapper.text()).toContain('2 of 3 exercise sessions done today.')
  })

  it('does not allow exercise count to exceed the daily limit', async () => {
    const pet = seedPet({ name: 'Rabbit', exerciseFrequency: '1', exerciseDuration: '15', exerciseTypes: '1', exerciseLabels: ['wheel'], })
    const { wrapper } = await mountView()
    const logBtn = () => wrapper.find(`[data-test="log-${pet.id}"]`)
    await logBtn().trigger('click')
    expect(wrapper.text()).toContain('1 of 1 exercise sessions done today.')
    expect(logBtn().attributes('disabled')).toBeDefined()
  })

  it('resets today\'s exercise count', async () => {
    const pet = seedPet({ name: 'Fish', exerciseFrequency: '1', exerciseDuration: '10', exerciseTypes: '1', exerciseLabels: ['swim'], })
    localStorage.setItem(`exerciseLog:${pet.id}:${todayDate()}`, '1')
    const { wrapper } = await mountView()
    await wrapper.find(`[data-test="reset-${pet.id}"]`).trigger('click')
    expect(wrapper.text()).toContain('0 of 1 exercise sessions done today.')
    expect(localStorage.getItem(`exerciseLog:${pet.id}:${todayDate()}`)).toBeNull()
 })

  it('renders one tracker per registered pet', async () => {
    seedPet({ name: 'Buddy' })
    seedPet({ name: 'Whiskers', type: 'Cat', exerciseFrequency: '3', exerciseDuration: '30', exerciseTypes: '2', exerciseLabels: ['walk', 'run'], })
    const { wrapper } = await mountView()
    expect(wrapper.findAll('.pet-tracker')).toHaveLength(2)
    expect(wrapper.text()).toContain('Buddy')
    expect(wrapper.text()).toContain('Whiskers')
  })

  it('logs exercise for the correct pet', async () => {
    const buddy = seedPet({ name: 'Buddy', exerciseFrequency: '2', exerciseDuration: '30', exerciseTypes: '2', exerciseLabels: ['walk', 'run'], })
    const whiskers = seedPet({ name: 'Whiskers', exerciseFrequency: '3', exerciseDuration: '30', exerciseTypes: '2', exerciseLabels: ['walk', 'run'], })
    const { wrapper } = await mountView()
    await wrapper.find(`[data-test="log-${whiskers.id}"]`).trigger('click')
    expect(wrapper.text()).toContain('1 of 3 exercise sessions done today.')
    expect(wrapper.text()).toContain('0 of 2 exercise sessions done today.')
    expect(localStorage.getItem(`exerciseLog:${buddy.id}:${todayDate()}`)).toBeNull()
  })

  it('writes each pet\'s log under its own key', async () => {
    const pet = seedPet({ name: 'Buddy', exerciseFrequency: '2', exerciseDuration: '30', exerciseTypes: '2', exerciseLabels: ['walk', 'run'], })
    const { wrapper } = await mountView()
    await wrapper.find(`[data-test="log-${pet.id}"]`).trigger('click')
    expect(localStorage.getItem(`exerciseLog:${pet.id}:${todayDate()}`)).toBe('1')
  })

  it('keeps seperate logs for different pets', async () => {
    seedPet({ name: 'Buddy', exerciseFrequency: '2', exerciseDuration: '30', exerciseTypes: '2', exerciseLabels: ['walk', 'run'], })
    const whiskers = seedPet({ name: 'Whiskers', type: 'Cat', exerciseFrequency: '3', exerciseDuration: '30', exerciseTypes: '2', exerciseLabels: ['walk', 'run'], })
    const { wrapper } = await mountView()
    const logWhiskers = () => wrapper.find(`[data-test="log-${whiskers.id}"]`)
    await logWhiskers().trigger('click')
    await logWhiskers().trigger('click')
    expect(wrapper.text()).toContain('2 of 3 exercise sessions done today.')
    expect(wrapper.text()).toContain('0 of 2 exercise sessions done today.')
  })

  it('checks if there is a timer for the exercises', async () => {
    const pet = seedPet({ name: 'Buddy', exerciseFrequency: '2', exerciseDuration: '30', exerciseTypes: '2', exerciseLabels: ['walk', 'run'], })
    const { wrapper } = await mountView()
    expect(wrapper.find(`[data-test="timer-${pet.id}"]`).exists()).toBe(true)
    expect(wrapper.text()).toContain('Would you like to set a timer for the exercise duration of 30 minutes as your pet exercises?')
  })

  it('checks if timer works', async () => {
    const pet = seedPet({ name: 'Buddy', exerciseFrequency: '2', exerciseDuration: '30', exerciseTypes: '2', exerciseLabels: ['walk', 'run'], })
    const { wrapper } = await mountView()
    const timer = wrapper.find(`[data-test="timer-${pet.id}"]`)
    expect(timer.text()).toBe('30:00')
  })

  it('checks if timer can be started', async () => {
    vi.useFakeTimers()
    const pet = seedPet({ name: 'Buddy', exerciseFrequency: '2', exerciseDuration: '30', exerciseTypes: '2', exerciseLabels: ['walk', 'run'], })
    const { wrapper } = await mountView()
    const timer = wrapper.find(`[data-test="timer-${pet.id}"]`)
    expect(timer.text()).toBe('30:00')
    await wrapper.find(`[data-test="start-timer-${pet.id}"]`).trigger('click')
    await vi.advanceTimersByTimeAsync(1000)
    await nextTick()
    expect(timer.text()).toBe('29:59')
    wrapper.unmount()
  })

  it('checks if timer can be stopped', async () => {
    vi.useFakeTimers()
    const pet = seedPet({ name: 'Buddy', exerciseFrequency: '2', exerciseDuration: '30', exerciseTypes: '2', exerciseLabels: ['walk', 'run'], })
    const { wrapper } = await mountView()
    const timer = wrapper.find(`[data-test="timer-${pet.id}"]`)
    expect(timer.text()).toBe('30:00')
    await wrapper.find(`[data-test="start-timer-${pet.id}"]`).trigger('click')
    await vi.advanceTimersByTimeAsync(3000)
    await nextTick()
    expect(timer.text()).toBe('29:57')
    await wrapper.find(`[data-test="stop-timer-${pet.id}"]`).trigger('click')
    const timeWhenStopped = timer.text()
    await vi.advanceTimersByTimeAsync(5000)
    await nextTick()
    expect(timer.text()).toBe(timeWhenStopped)
    wrapper.unmount()
  })

  it('checks if timer can be reset', async () => {
    vi.useFakeTimers()
    const pet = seedPet({ name: 'Buddy', exerciseFrequency: '2', exerciseDuration: '30', exerciseTypes: '2', exerciseLabels: ['walk', 'run'], })
    const { wrapper } = await mountView()
    const timer = wrapper.find(`[data-test="timer-${pet.id}"]`)
    expect(timer.text()).toBe('30:00')
    await wrapper.find(`[data-test="start-timer-${pet.id}"]`).trigger('click')
    await vi.advanceTimersByTimeAsync(5000)
    await nextTick()
    expect(timer.text()).toBe('29:55')
    await wrapper.find(`[data-test="reset-timer-${pet.id}"]`).trigger('click')
    expect(timer.text()).toBe('30:00')
    wrapper.unmount()
  })

  it('checks if the different labels are displayed as buttons', async () => {
    const pet = seedPet({ name: 'Buddy', exerciseFrequency: '2', exerciseDuration: '30', exerciseTypes: '2', exerciseLabels: ['walk', 'run'], })
    const { wrapper } = await mountView()
    expect(wrapper.find(`[data-test="exercise-label-${pet.id}-walk"]`).exists()).toBe(true)
    expect(wrapper.find(`[data-test="exercise-label-${pet.id}-run"]`).exists()).toBe(true)
  })

  it('checks if label can be selected', async () => {
    const pet = seedPet({ name: 'Buddy', exerciseFrequency: '2', exerciseDuration: '30', exerciseTypes: '2', exerciseLabels: ['walk', 'run'], })
    const { wrapper } = await mountView()
    await wrapper.find(`[data-test="exercise-label-${pet.id}-walk"]`).trigger('click')
    expect(wrapper.find(`[data-test="exercise-label-${pet.id}-walk"]`).classes()).toContain('selected')
  })
})
