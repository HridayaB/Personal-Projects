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
})
