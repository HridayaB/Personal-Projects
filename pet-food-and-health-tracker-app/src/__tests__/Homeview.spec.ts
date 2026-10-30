import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import { createRouter, createMemoryHistory } from 'vue-router'
import HomeView from '../Homeview.vue'

const makeRouter = () =>
  createRouter({
    history: createMemoryHistory(),
    routes: [
      {path: '/', component: HomeView },
      { path: '/get-started', component: { template: '<div>Get Started</div>' } },
    ],
  })

describe('HomeView', () => {
  it('renders the welcome message', async () => {
    const router = makeRouter()
    const wrapper = mount(HomeView, { global: { plugins: [router] } })
    await router.isReady()
    const link = wrapper.find('a[href="#/get-started"]')
    expect(link.exists()).toBe(true)
    expect(link.text()).toContain('get started')
  })
})
