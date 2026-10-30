import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import App from '../App.vue'
import { createRouter, createMemoryHistory } from 'vue-router'
import HomeView from '../Homeview.vue'

describe('App', () => {
  it('renders the routed component inside <router-view>', async () => {
    const router = createRouter({
      history: createMemoryHistory(),
      routes: [{ path: '/', component: HomeView }],
    })

    const wrapper = mount(App, {
      global: { plugins: [router] },
    })

    await router.isReady()
    expect(wrapper.text()).toContain('Pet Food and Health Tracker')
  })
})
