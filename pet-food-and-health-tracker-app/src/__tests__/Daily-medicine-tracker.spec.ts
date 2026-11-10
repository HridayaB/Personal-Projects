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

const todayDate = () => new Date().toLocaleDateString('en-CA')

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
})
