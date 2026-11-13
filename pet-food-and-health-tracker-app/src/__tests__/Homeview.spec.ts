import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import { createRouter, createMemoryHistory } from 'vue-router'
import HomeView from '../Homeview.vue'

const makeRouter = () =>
  createRouter({
    history: createMemoryHistory(),
    routes: [
      { path: '/', component: HomeView },
      { path: '/get-started', component: { template: '<div>Get Started</div>' } },
      { path: '/daily-food-tracker', component: { template: '<div>Daily Food Tracker</div>' } },
      { path: '/daily-treat-tracker', component: { template: '<div>Daily Treat Tracker</div>' } },
      { path: '/daily-exercise-tracker', component: { template: '<div>Daily Exercise Tracker</div>' } },
      { path: '/daily-medicine-tracker', component: { template: '<div>Daily Medicine Tracker</div>' } },
      { path: '/daily-potty-tracker', component: { template: '<div>Daily Potty Tracker</div>' } },
    ],
  })

describe('HomeView', () => {
  it('renders the welcome message', async () => {
    const router = makeRouter()
    const wrapper = mount(HomeView, { global: { plugins: [router] } })
    await router.isReady()
    expect(wrapper.find('h1').text()).toBe('Pet Food and Health Tracker')
  })

  it('links to the get-started page', async () => {
    const router = makeRouter()
    const wrapper = mount(HomeView, { global: { plugins: [router] } })
    await router.isReady()
    const link = wrapper.findComponent({ name: 'RouterLink' })
    expect(link.exists()).toBe(true)
    expect(link.props('to')).toBe('/get-started')
    expect(link.text()).toContain('get started')
  })

  it('links to the daily food tracker page', async () => {
    const router = makeRouter()
    const wrapper = mount(HomeView, { global: { plugins: [router] } })
    await router.isReady()
    const link = wrapper.findAllComponents({ name: 'RouterLink' }).find(l => l.text().includes('Daily Food Tracker'))
    expect(link?.exists()).toBe(true)
    expect(link?.props('to')).toBe('/daily-food-tracker')
    expect(link?.text()).toContain('Daily Food Tracker')
  })

  it('links to the daily treat tracker page', async () => {
    const router = makeRouter()
    const wrapper = mount(HomeView, { global: { plugins: [router] } })
    await router.isReady()
    const link = wrapper.findAllComponents({ name: 'RouterLink' }).find(l => l.text().includes('Daily Treat Tracker'))
    expect(link?.exists()).toBe(true)
    expect(link?.props('to')).toBe('/daily-treat-tracker')
    expect(link?.text()).toContain('Daily Treat Tracker')
  })

  it('links to the daily exercise tracker page', async () => {
    const router = makeRouter()
    const wrapper = mount(HomeView, { global: { plugins: [router] } })
    await router.isReady()
    const link = wrapper.findAllComponents({ name: 'RouterLink' }).find(l => l.text().includes('Daily Exercise Tracker'))
    expect(link?.exists()).toBe(true)
    expect(link?.props('to')).toBe('/daily-exercise-tracker')
    expect(link?.text()).toContain('Daily Exercise Tracker')
  })

  it('links to the daily medicine tracker page', async () => {
    const router = makeRouter()
    const wrapper = mount(HomeView, { global: { plugins: [router] } })
    await router.isReady()
    const link = wrapper.findAllComponents({ name: 'RouterLink' }).find(l => l.text().includes('Daily Medicine Tracker'))
    expect(link?.exists()).toBe(true)
    expect(link?.props('to')).toBe('/daily-medicine-tracker')
    expect(link?.text()).toContain('Daily Medicine Tracker')
  })

  it('links to the daily potty tracker page', async () => {
    const router = makeRouter()
    const wrapper = mount(HomeView, { global: { plugins: [router] } })
    await router.isReady()
    const link = wrapper.findAllComponents({ name: 'RouterLink' }).find(l => l.text().includes('Daily Potty Tracker'))
    expect(link?.exists()).toBe(true)
    expect(link?.props('to')).toBe('/daily-potty-tracker')
    expect(link?.text()).toContain('Daily Potty Tracker')
  })

  it('has a dark mode toggle', async () => {
    const router = makeRouter()
    const wrapper = mount(HomeView, { global: { plugins: [router] } })
    const toggle = wrapper.find('#dark-mode-toggle')
    expect(toggle.exists()).toBe(true)
    expect(toggle.element.getAttribute('type')).toBe('checkbox')
  })

  it('changes the page background when dark mode is toggled', async () => {
    const router = makeRouter()
    const wrapper = mount(HomeView, { global: { plugins: [router] } })
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
