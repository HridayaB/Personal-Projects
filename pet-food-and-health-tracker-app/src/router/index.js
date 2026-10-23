import { createRouter, createWebHashHistory } from 'vue-router'
import HomeView from '../Homeview.vue'
import GetStarted from '../Get-started.vue'

const router = createRouter({
  history: createWebHashHistory('/Personal-Projects/'),
  routes: [
    { path: '/', name: 'home', component: HomeView },
    { path: '/get-started', name: 'get-started', component: GetStarted },
  ],
})

export default router
