import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { createRouter, createMemoryHistory } from 'vue-router'
import GetStarted from '../Get-started.vue'

const makeRouter = () =>
  createRouter({
    history: createMemoryHistory(),
    routes: [
      { path: '/get-started', component: GetStarted },
      { path: '/daily-food-tracker', component: { template: '<div>Tracker</div>' } },
    ],
  })

const mountView = async () => {
  const router = makeRouter()
  router.push('/get-started')
  await router.isReady()
  const wrapper = mount(GetStarted, { global: { plugins: [router] } })
  return { wrapper, router }
}

describe('GetStarted', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('does not show the modal initially', async () => {
    const { wrapper } = await mountView()
    expect(wrapper.find('.modal-overlay').exists()).toBe(false)
  })

  it('opens the modal when the button is clicked', async () => {
    const { wrapper } = await mountView()
    await wrapper.find('button').trigger('click')
    expect(wrapper.find('.modal-overlay').exists()).toBe(true)
  })

  it('disables submit button until a pet is selected', async () => {
    const { wrapper } = await mountView()
    await wrapper.find('button').trigger('click')
    const submitButton = wrapper.findAll('button').find(b => b.text() === 'Submit')
    expect(submitButton?.attributes('disabled')).toBeDefined()
    await wrapper.find('select').setValue('Dog')
    expect(submitButton?.attributes('disabled')).toBeUndefined()
  })

  it('does not navigate to the food tracker page with the selected pet', async () => {
    const { wrapper, router } = await mountView()
    const push = vi.spyOn(router, 'push')
    await wrapper.find('button').trigger('click')
    await wrapper.find('select').setValue('Cat')
    await wrapper.findAll('button').find(b => b.text() === 'Submit')!.trigger('click')
    expect(push).not.toHaveBeenCalledWith('/daily-food-tracker?pet=Cat')
  })

  it('closes the modal when the cancel button is clicked', async () => {
    const { wrapper } = await mountView()
    await wrapper.find('button').trigger('click')
    await wrapper.findAll('button').find(b => b.text() === 'Cancel')!.trigger('click')
    expect(wrapper.find('.modal-overlay').exists()).toBe(false)
  })

  it('when no pet is selected, it does not save anything or navigate anywhere', async () => {
    const { wrapper, router } = await mountView()
    const push = vi.spyOn(router, 'push')
    await wrapper.find('button').trigger('click')
    const submitButton = wrapper.findAll('button').find(b => b.text() === 'Submit')!
    await submitButton.trigger('click')
    expect(localStorage.getItem('userPet')).toBeNull()
    expect(push).not.toHaveBeenCalled()
  })

  it('asks user what type of breed their pet is', async () => {
    const { wrapper } = await mountView()
    await wrapper.find('button').trigger('click')
    expect(wrapper.find('input[type="text"]').exists()).toBe(false)
    await wrapper.find('select').setValue('Dog')
    await wrapper.findAll('button').find(b => b.text() === 'Submit')!.trigger('click')
    await wrapper.find('input[type="text"]').setValue('Buddy')
    await wrapper.findAll('button').find(b => b.text() === 'Submit')!.trigger('click')
    await wrapper.find('input[type="number"]').setValue('50')
    await wrapper.findAll('button').find(b => b.text() === 'Submit')!.trigger('click')
    await wrapper.findAll('input[type="text"]')
    expect(wrapper.find('input[type="text"]').exists()).toBe(true)
  })

  it('uses the selected pet in the breed label', async () => {
    const { wrapper } = await mountView()
    await wrapper.find('button').trigger('click')
    await wrapper.find('select').setValue('Cat')
    await wrapper.findAll('button').find(b => b.text() === 'Submit')!.trigger('click')
    await wrapper.find('input[type="text"]').setValue('Whiskers')
    await wrapper.findAll('button').find(b => b.text() === 'Submit')!.trigger('click')
    await wrapper.find('input[type="number"]').setValue('10')
    await wrapper.findAll('button').find(b => b.text() === 'Submit')!.trigger('click')
    expect(wrapper.text()).toContain("Enter your cat's breed")
  })

  it('saves the selected pet, breed, foodFrequency, and treatFrequency to localStorage when the submit button is clicked', async () => {
    const { wrapper, router } = await mountView()
    const push = vi.spyOn(router, 'push')
    await wrapper.find('button').trigger('click')
    await wrapper.find('select').setValue('Dog')
    await wrapper.findAll('button').find(b => b.text() === 'Submit')!.trigger('click')
    await wrapper.find('input[type="text"]').setValue('Buddy')
    await wrapper.findAll('button').find(b => b.text() === 'Submit')!.trigger('click')
    await wrapper.find('input[type="number"]').setValue('50')
    await wrapper.findAll('button').find(b => b.text() === 'Submit')!.trigger('click')
    await wrapper.find('input[type="text"]').setValue('Siberian Husky')
    await wrapper.findAll('button').find(b => b.text() === 'Submit')!.trigger('click')
    await wrapper.find('input[type="number"]').setValue('2')
    await wrapper.findAll('button').find(b => b.text() === 'Submit')!.trigger('click')
    await wrapper.find('input[type="number"]').setValue('5')
    await wrapper.findAll('button').find(b => b.text() === 'Submit')!.trigger('click')
    expect(localStorage.getItem('userPet')).toBe('Dog')
    expect(localStorage.getItem('userPetBreed')).toBe('Siberian Husky')
    expect(localStorage.getItem('userPetFoodFrequency')).toBe('2')
    expect(localStorage.getItem('userPetTreatFrequency')).toBe('5')
    expect(push).toHaveBeenCalledWith('/daily-food-tracker?pet=Dog')
  })

  it('does not let user click submit when breed is not entered', async () => {
    const { wrapper } = await mountView()
    await wrapper.find('button').trigger('click')
    await wrapper.find('select').setValue('Dog')
    await wrapper.findAll('button').find(b => b.text() === 'Submit')!.trigger('click')
    await wrapper.find('input[type="text"]').setValue('Buddy')
    await wrapper.findAll('button').find(b => b.text() === 'Submit')!.trigger('click')
    await wrapper.find('input[type="number"]').setValue('50')
    await wrapper.findAll('button').find(b => b.text() === 'Submit')!.trigger('click')
    const breedInputSubmitButton = wrapper.findAll('button').find(b => b.text() === 'Submit')!
    expect(breedInputSubmitButton.attributes('disabled')).toBeDefined()
    await wrapper.find('input[type="text"]').setValue('Siberian Husky')
    expect(breedInputSubmitButton.attributes('disabled')).toBeUndefined()
  })

  it('does not save the breed to localStorage when I\'m not sure button is clicked', async () => {
    const { wrapper } = await mountView()
    await wrapper.find('button').trigger('click')
    await wrapper.find('select').setValue('Dog')
    await wrapper.findAll('button').find(b => b.text() === 'Submit')!.trigger('click')
    await wrapper.find('input[type="text"]').setValue('Buddy')
    await wrapper.findAll('button').find(b => b.text() === 'Submit')!.trigger('click')
    await wrapper.find('input[type="number"]').setValue('50')
    await wrapper.findAll('button').find(b => b.text() === 'Submit')!.trigger('click')
    await wrapper.findAll('button').find(b => b.text() === 'I\'m not sure')!.trigger('click')
    await wrapper.find('input[type="number"]').setValue('2')
    await wrapper.findAll('button').find(b => b.text() === 'Submit')!.trigger('click')
    await wrapper.find('input[type="number"]').setValue('5')
    await wrapper.findAll('button').find(b => b.text() === 'Submit')!.trigger('click')
    expect(localStorage.getItem('userPet')).toBe('Dog')
    expect(localStorage.getItem('userPetBreed')).toBeNull()
  })

  it('uses selected pet in the label to ask how many times they are planning to feed their pet', async () => {
    const { wrapper } = await mountView()
    await wrapper.find('button').trigger('click')
    await wrapper.find('select').setValue('Dog')
    await wrapper.findAll('button').find(b => b.text() === 'Submit')!.trigger('click')
    await wrapper.find('input[type="text"]').setValue('Buddy')
    await wrapper.findAll('button').find(b => b.text() === 'Submit')!.trigger('click')
    await wrapper.find('input[type="number"]').setValue('50')
    await wrapper.findAll('button').find(b => b.text() === 'Submit')!.trigger('click')
    await wrapper.find('input[type="text"]').setValue('Golden Retriever')
    await wrapper.findAll('button').find(b => b.text() === 'Submit')!.trigger('click')
    expect(wrapper.text()).toContain('How many times are you planning to feed your dog in a single day?')
  })

  it('checks if there are recommended links listed for feeding frequency', async () => {
    const { wrapper } = await mountView()
    await wrapper.find('button').trigger('click')
    await wrapper.find('select').setValue('Dog')
    await wrapper.findAll('button').find(b => b.text() === 'Submit')!.trigger('click')
    await wrapper.find('input[type="text"]').setValue('Buddy')
    await wrapper.findAll('button').find(b => b.text() === 'Submit')!.trigger('click')
    await wrapper.find('input[type="number"]').setValue('50')
    await wrapper.findAll('button').find(b => b.text() === 'Submit')!.trigger('click')
    await wrapper.find('input[type="text"]').setValue('Bulldog')
    await wrapper.findAll('button').find(b => b.text() === 'Submit')!.trigger('click')
    expect(wrapper.text()).toContain('Pet Food Institute')
    expect(wrapper.text()).toContain('WSAVA Global Nutrition Guidelines')
    expect(wrapper.text()).toContain('Pawsome Pet')
  })

  it('checks if submit and cancel button exists for the feeding frequency input', async () => {
    const { wrapper } = await mountView()
    await wrapper.find('button').trigger('click')
    await wrapper.find('select').setValue('Dog')
    await wrapper.findAll('button').find(b => b.text() === 'Submit')!.trigger('click')
    await wrapper.find('input[type="text"]').setValue('Buddy')
    await wrapper.findAll('button').find(b => b.text() === 'Submit')!.trigger('click')
    await wrapper.find('input[type="number"]').setValue('50')
    await wrapper.findAll('button').find(b => b.text() === 'Submit')!.trigger('click')
    await wrapper.find('input[type="text"]').setValue('Pitbull')
    await wrapper.findAll('button').find(b => b.text() === 'Submit')!.trigger('click')
    expect(wrapper.findAll('button').find(b => b.text() === 'Submit')!.exists()).toBe(true)
    expect(wrapper.findAll('button').find(b => b.text() === 'Cancel')!.exists()).toBe(true)
  })

  it('uses selected pet in the label to ask how many times they are planning to give treats their pet', async () => {
    const { wrapper } = await mountView()
    await wrapper.find('button').trigger('click')
    await wrapper.find('select').setValue('Dog')
    await wrapper.findAll('button').find(b => b.text() === 'Submit')!.trigger('click')
    await wrapper.find('input[type="text"]').setValue('Buddy')
    await wrapper.findAll('button').find(b => b.text() === 'Submit')!.trigger('click')
    await wrapper.find('input[type="number"]').setValue('50')
    await wrapper.findAll('button').find(b => b.text() === 'Submit')!.trigger('click')
    await wrapper.find('input[type="text"]').setValue('Golden Retriever')
    await wrapper.findAll('button').find(b => b.text() === 'Submit')!.trigger('click')
    await wrapper.find('input[type="number"]').setValue('2')
    await wrapper.findAll('button').find(b => b.text() === 'Submit')!.trigger('click')
    expect(wrapper.text()).toContain('How many treats are you planning to give your dog in a single day?')
  })

  it('checks if there are recommended links listed for pet treats', async () => {
    const { wrapper } = await mountView()
    await wrapper.find('button').trigger('click')
    await wrapper.find('select').setValue('Dog')
    await wrapper.findAll('button').find(b => b.text() === 'Submit')!.trigger('click')
    await wrapper.find('input[type="text"]').setValue('Buddy')
    await wrapper.findAll('button').find(b => b.text() === 'Submit')!.trigger('click')
    await wrapper.find('input[type="number"]').setValue('50')
    await wrapper.findAll('button').find(b => b.text() === 'Submit')!.trigger('click')
    await wrapper.find('input[type="text"]').setValue('Bulldog')
    await wrapper.findAll('button').find(b => b.text() === 'Submit')!.trigger('click')
    await wrapper.find('input[type="number"]').setValue('2')
    await wrapper.findAll('button').find(b => b.text() === 'Submit')!.trigger('click')
    expect(wrapper.text()).toContain('Pet Food Institute')
    expect(wrapper.text()).toContain('WSAVA Global Nutrition Guidelines')
    expect(wrapper.text()).toContain('AAHA')
  })

  it('checks if submit and cancel button exists for the treats frequency input', async () => {
    const { wrapper } = await mountView()
    await wrapper.find('button').trigger('click')
    await wrapper.find('select').setValue('Dog')
    await wrapper.findAll('button').find(b => b.text() === 'Submit')!.trigger('click')
    await wrapper.find('input[type="text"]').setValue('Buddy')
    await wrapper.findAll('button').find(b => b.text() === 'Submit')!.trigger('click')
    await wrapper.find('input[type="number"]').setValue('50')
    await wrapper.findAll('button').find(b => b.text() === 'Submit')!.trigger('click')
    await wrapper.find('input[type="text"]').setValue('Pitbull')
    await wrapper.findAll('button').find(b => b.text() === 'Submit')!.trigger('click')
    await wrapper.find('input[type="number"]').setValue('2')
    await wrapper.findAll('button').find(b => b.text() === 'Submit')!.trigger('click')
    expect(wrapper.findAll('button').find(b => b.text() === 'Submit')!.exists()).toBe(true)
    expect(wrapper.findAll('button').find(b => b.text() === 'Cancel')!.exists()).toBe(true)
  })

  it('asks user for their pet\'s name', async () => {
    const { wrapper } = await mountView()
    await wrapper.find('button').trigger('click')
    await wrapper.find('select').setValue('Dog')
    await wrapper.findAll('button').find(b => b.text() === 'Submit')!.trigger('click')
    expect(wrapper.text()).toContain('What is your dog\'s name?')
  })

  it('asks user for their pet\'s weight', async () => {
    const { wrapper } = await mountView()
    await wrapper.find('button').trigger('click')
    await wrapper.find('select').setValue('Dog')
    await wrapper.findAll('button').find(b => b.text() === 'Submit')!.trigger('click')
    await wrapper.find('input[type="text"]').setValue('Lucy')
    await wrapper.findAll('button').find(b => b.text() === 'Submit')!.trigger('click')
    expect(wrapper.text()).toContain('What is your dog\'s weight?')
  })

  it('saves pet name and weight properly', async () => {
    const { wrapper } = await mountView()
    await wrapper.find('button').trigger('click')
    await wrapper.find('select').setValue('Dog')
    await wrapper.findAll('button').find(b => b.text() === 'Submit')!.trigger('click')
    await wrapper.find('input[type="text"]').setValue('Buddy')
    await wrapper.findAll('button').find(b => b.text() === 'Submit')!.trigger('click')
    await wrapper.find('input[type="number"]').setValue('50')
    await wrapper.findAll('button').find(b => b.text() === 'Submit')!.trigger('click')
    await wrapper.find('input[type="text"]').setValue('Pitbull')
    await wrapper.findAll('button').find(b => b.text() === 'Submit')!.trigger('click')
    await wrapper.find('input[type="number"]').setValue('2')
    await wrapper.findAll('button').find(b => b.text() === 'Submit')!.trigger('click')
    await wrapper.find('input[type="number"]').setValue('1')
    await wrapper.findAll('button').find(b => b.text() === 'Submit')!.trigger('click')
    expect(localStorage.getItem('userPetName')).toBe('Buddy')
    expect(localStorage.getItem('userPetWeight')).toBe('50')
  })
})
