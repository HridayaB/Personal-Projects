import { describe, it, expect, vi } from 'vitest'
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

  it('navigates to the food tracker page with the selected pet', async () => {
    const { wrapper, router } = await mountView()
    const push = vi.spyOn(router, 'push')
    await wrapper.find('button').trigger('click')
    await wrapper.find('select').setValue('Cat')
    await wrapper.findAll('button').find(b => b.text() === 'Submit')?.trigger('click')
    expect(push).toHaveBeenCalledWith('/daily-food-tracker?pet=Cat')
  })

  it('closes the modal when the cancel button is clicked', async () => {
    const { wrapper } = await mountView()
    await wrapper.find('button').trigger('click')
    await wrapper.findAll('button').find(b => b.text() === 'Cancel')!.trigger('click')
    expect(wrapper.find('.modal-overlay').exists()).toBe(false)
  })
})
