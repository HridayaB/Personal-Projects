import { createRouter, createWebHashHistory } from 'vue-router'
import HomeView from '../Homeview.vue'
import GetStarted from '../Get-started.vue'
import DailyFoodTracker from '../Daily-food-tracker.vue'
import DailyTreatTracker from '../Daily-treat-tracker.vue'
import DailyExerciseTracker from '../Daily-exercise-tracker.vue'
import DailyMedicineTracker from '../Daily-medicine-tracker.vue'
import DailyPottyTracker from '../Daily-potty-tracker.vue'

const router = createRouter({
  history: createWebHashHistory('/Personal-Projects/'),
  routes: [
    { path: '/', name: 'home', component: HomeView },
    { path: '/get-started', name: 'get-started', component: GetStarted },
    { path: '/daily-food-tracker', name: 'daily-food-tracker', component: DailyFoodTracker },
    { path: '/daily-treat-tracker', name: 'daily-treat-tracker', component: DailyTreatTracker },
    { path: '/daily-exercise-tracker', name: 'daily-exercise-tracker', component: DailyExerciseTracker },
    { path: '/daily-medicine-tracker', name: 'daily-medicine-tracker', component: DailyMedicineTracker },
    { path: '/daily-potty-tracker', name: 'daily-potty-tracker', component: DailyPottyTracker },
  ],
})

export default router
