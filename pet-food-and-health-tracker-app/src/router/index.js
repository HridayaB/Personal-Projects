import { createRouter, createWebHashHistory } from 'vue-router'
import HomeView from '../Homeview.vue'
import GetStarted from '../Get-started.vue'
import DailyFoodTracker from '../Daily-food-tracker.vue'

const router = createRouter({
  history: createWebHashHistory('/Personal-Projects/'),
  routes: [
    { path: '/', name: 'home', component: HomeView },
    { path: '/get-started', name: 'get-started', component: GetStarted },
    { path: '/daily-food-tracker', name: 'daily-food-tracker', component: DailyFoodTracker },
  ],
})

export default router
