<script setup lang="ts">
  import { ref, onMounted, onUnmounted } from 'vue'
  import { getPets, deletePet, type Pet } from './pets'
  import { isDarkMode } from './darkMode'
  import Icons from './Icons.vue'

  interface TrackedPet extends Pet {
    pottyBreaks: string[]
  }

  const trackedPets = ref<TrackedPet[]>([])
  const showRemovePetPopup = ref(false)
  const petToRemove = ref<TrackedPet | null>(null)
  const todayDate = new Date().toLocaleDateString('en-US')
  const currentTime = ref(new Date().toLocaleTimeString('en-US'))
  let clockInterval: ReturnType<typeof setInterval>

  const logKeyFor = (petId: string) => `pottyLog:${petId}:${todayDate}`

  onMounted(() => {
    trackedPets.value = getPets().map(pet => {
      const saved = localStorage.getItem(logKeyFor(pet.id))
      let pottyBreaks: string[] = []

      if (saved) {
        try {
          const parsed = JSON.parse(saved)

          if (Array.isArray(parsed)) {
            pottyBreaks = parsed
          }
        } catch {
          pottyBreaks = []
        }
      }

      return {
        ...pet,
        pottyBreaks
      }
    })
    clockInterval = setInterval(() => {
      currentTime.value = new Date().toLocaleTimeString('en-US')
    }, 1000)
  })

  onUnmounted(() => {
    clearInterval(clockInterval)
  })

  const progressOf = (p: TrackedPet) => {
    const count = p.pottyBreaks.length
    return count === 1 ? `1 potty break logged today.` : `${count} potty breaks logged today.`
  }

  const logPottyBreak = (p: TrackedPet) => {
    const time = new Date().toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit'
    })
    p.pottyBreaks.push(time)
    localStorage.setItem(logKeyFor(p.id), JSON.stringify(p.pottyBreaks))
  }

  const removeLog = (p: TrackedPet) => {
    if (p.pottyBreaks.length === 0) return
    p.pottyBreaks.pop()
    localStorage.setItem(logKeyFor(p.id), JSON.stringify(p.pottyBreaks))
  }

  const resetLog = (p: TrackedPet) => {
    p.pottyBreaks = []
    localStorage.removeItem(logKeyFor(p.id))
  }

  const askRemovePet = (p: TrackedPet) => {
    petToRemove.value = p
    showRemovePetPopup.value = true
  }

  const cancelRemovePet = () => {
    showRemovePetPopup.value = false
    petToRemove.value = null
  }

  const removeFromThisTracker = () => {
    if (!petToRemove.value) return
    trackedPets.value = trackedPets.value.filter(pet => pet.id !== petToRemove.value!.id)
    cancelRemovePet()
  }

  const removeFromAllTrackers = () => {
    if (!petToRemove.value) return
    const petId = petToRemove.value.id
    deletePet(petId)
    localStorage.removeItem(logKeyFor(petId))
    trackedPets.value = trackedPets.value.filter(pet => pet.id !== petId)
    cancelRemovePet()
  }
</script>

<template>
  <main class="daily-potty-tracker" :class="{ 'dark-mode': isDarkMode }">
    <h2>Daily Potty Tracker</h2>
    <input id="dark-mode-toggle" v-model="isDarkMode" type="checkbox"/>
    <label for="dark-mode-toggle">
      <Icons :dark-mode="isDarkMode" />
    </label>
    <div v-if="trackedPets.length === 0" class="setup-prompt">
      <p>
        It looks like you haven't set up your pet's information yet. <router-link to="/get-started">You can get started here.</router-link>
      </p>
    </div>
    <div v-else>
      <div class="tracker-links">
        <div class="home-page-container">
          <router-link to="/" id="home-page-link">
            <span>Home</span>
            <Icons icon="home-page-1" />
          </router-link>
          <div class="home-page-icons">
            <Icons icon="home-page-2" />
            <Icons icon="home-page-3" />
            <Icons icon="home-page-4" />
            <Icons icon="home-page-5" />
            <Icons icon="home-page-6" />
          </div>
        </div>
        <div class="get-started-container">
          <router-link to="/get-started" id="get-started-link">
            <span>Get Started</span>
            <Icons icon="get-started-1" />
          </router-link>
          <div class="get-started-icons">
            <Icons icon="get-started-2" />
            <Icons icon="get-started-3" />
            <Icons icon="get-started-4" />
            <Icons icon="get-started-5" />
            <Icons icon="get-started-6" />
          </div>
        </div>
        <div class="food-tracker-container">
          <router-link to='/daily-food-tracker' id="daily-food-tracker-link">
            <span>Daily Food Tracker</span>
            <Icons icon="pet-food-1" />
          </router-link>
          <div class="pet-food-icons">
            <Icons icon="pet-food-2" />
            <Icons icon="pet-food-3" />
            <Icons icon="pet-food-4" />
            <Icons icon="pet-food-5" />
            <Icons icon="pet-food-6" />
          </div>
        </div>
        <div class="treat-tracker-container">
          <router-link to='/daily-treat-tracker' id="daily-treat-tracker-link">
            <span>Daily Treat Tracker</span>
            <Icons icon="pet-treat-1" />
          </router-link>
          <div class="pet-treat-icons">
            <Icons icon="pet-treat-2" />
            <Icons icon="pet-treat-3" />
            <Icons icon="pet-treat-4" />
            <Icons icon="pet-treat-5" />
            <Icons icon="pet-treat-6" />
          </div>
        </div>
        <div class="exercise-tracker-container">
          <router-link to="/daily-exercise-tracker" id="daily-exercise-tracker-link">
            <span>Daily Exercise Tracker</span>
            <Icons icon="pet-exercise-1" />
          </router-link>
          <div class="pet-exercise-icons">
            <Icons icon="pet-exercise-2" />
            <Icons icon="pet-exercise-3" />
            <Icons icon="pet-exercise-4" />
            <Icons icon="pet-exercise-5" />
            <Icons icon="pet-exercise-6" />
          </div>
        </div>
        <div class="medicine-tracker-container">
          <router-link to="/daily-medicine-tracker" id="daily-medicine-tracker-link">
            <span>Daily Medicine Tracker</span>
            <Icons icon="pet-medicine-1" />
          </router-link>
          <div class="pet-medicine-icons">
            <Icons icon="pet-medicine-2" />
            <Icons icon="pet-medicine-3" />
            <Icons icon="pet-medicine-4" />
            <Icons icon="pet-medicine-5" />
            <Icons icon="pet-medicine-6" />
          </div>
        </div>
      </div>
      <div v-for="pet in trackedPets" :key="pet.id" class="pet-tracker">
        <p>
          Tracking for <strong>{{ pet.name }}</strong>
          <span v-if="pet.breed"> ({{ pet.breed }})</span> — {{ todayDate }} — {{ currentTime }}
        </p>
        <p>{{ progressOf(pet) }}</p>
        <button :data-test="`log-${pet.id}`" @click="logPottyBreak(pet)">Log potty break</button>
        <button :data-test="`remove-log-${pet.id}`" @click="removeLog(pet)">Remove last potty break</button>
        <div v-if="pet.pottyBreaks.length">
          <h3>Today's potty breaks</h3>
          <ul>
            <li v-for="(time, index) in pet.pottyBreaks" :key="`${time}-${index}`">{{ time }} — Potty break</li>
          </ul>
        </div>
        <button :data-test="`reset-${pet.id}`" @click="resetLog(pet)">Reset {{ pet.name }}'s potty break count</button>
        <button :data-test="`remove-pet-${pet.id}`" @click="askRemovePet(pet)">Remove {{ pet.name }}</button>
      </div>
    </div>

    <div v-if="showRemovePetPopup" class="remove-pet-overlay">
      <div class="remove-pet-popup">
        <p>Would you like to remove {{ petToRemove?.name }} from all trackers or only this Daily Potty Tracker?</p>
        <button @click="removeFromThisTracker">Remove from this tracker</button>
        <button @click="removeFromAllTrackers">Remove from all trackers</button>
        <button @click="cancelRemovePet">Cancel</button>
      </div>
    </div>
  </main>
</template>

<style scoped>
  .daily-potty-tracker {
    position: relative;
    min-height: 100vh;
    box-sizing: border-box;
    --sun-icon-color: #f2f2f2;
    --moon-icon-color: #242424;
    background: #f2f2f2;
    color: #1a1a1a;
    font-family:'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
    text-align: center;
    padding: 3rem;
    transition: background-color 0.3s, color 0.3s;
  }

  .daily-potty-tracker.dark-mode {
    --sun-icon-color: #242424;
    --moon-icon-color: #f2f2f2;
    background: #242424;
    color: #fff;
  }

  label {
    width: 70px;
    height: 30px;
    top: 1.5rem;
    right: 1.5rem;
    position: absolute;
    display: block;
    background: #f2f2f2;
    border-radius: 200px;
    box-shadow: inset 0px 5px 15px rgba(0, 0, 0, 0.4), inset 0px -5px 15px rgba(255, 255, 255, 0.4);
    cursor: pointer;
    transition: 0.3s;
  }

  label:after {
    content: "";
    width: 28px;
    height: 28px;
    position: absolute;
    bottom: 1px;
    left: 1px;
    z-index: 0;
    background: linear-gradient(180deg, #ffcc89, #d8860b);
    border-radius: 28px;
    box-shadow: inset 0px 5px 10px rgba(0, 0, 0, 0.2);
    transition: 0.3s;
  }

  input {
    width: 0;
    height: 0;
    visibility: hidden;
    opacity: 0;
    position: absolute;
  }

  input:checked + label {
    background: #242424
  }

  input:checked + label:after {
    left: 69px;
    transform: translateX(-100%);
    background: linear-gradient(180deg, #777, #3a3a3a);
  }

  label:active:after {
    width: 35px;
  }

  label :deep(svg) {
    position: absolute;
    width: 25px;
    height: 25px;
    top: 50%;
    transform: translate(-50%, -50%);
    z-index: 10;
  }

  label :deep(svg.sun-icon) {
    left: 15px;
    transition: 0.3s;
  }

  label :deep(svg.moon-icon) {
    left: 55px;
    transition: 0.3s;
  }

  label :deep(svg.sun-icon path) {
    fill: var(--sun-icon-color);
  }

  label :deep(svg.sun-icon rect) {
    fill: transparent;
  }

  label :deep(svg.moon-icon path) {
    fill: var(--moon-icon-color);
  }

  .tracker-links {
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 15px;
    flex-wrap: wrap;
    margin-top: 2rem;
  }

  #home-page-link,
  #get-started-link,
  #daily-food-tracker-link,
  #daily-treat-tracker-link,
  #daily-exercise-tracker-link,
  #daily-medicine-tracker-link {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 10px;
    padding: 12px 20px;
    background-color: #ffffff;
    color: #1a1a1a;
    border: 1px solid #d1d1d1;
    border-radius: 10px;
    text-decoration: none;
    font-weight: 600;
    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.08);
    transition: transform 0.2s, background-color 0.3s, border-color 0.3s, box-shadow 0.2s;
  }

  #home-page-link:hover,
  #get-started-link:hover,
  #daily-food-tracker-link:hover,
  #daily-treat-tracker-link:hover,
  #daily-exercise-tracker-link:hover,
  #daily-medicine-tracker-link:hover {
    transform: translateY(-2px);
    border-color: #993638;
    box-shadow: 0 4px 10px rgba(0, 0, 0, 0.12);
  }

  .dark-mode #home-page-link,
  .dark-mode #get-started-link,
  .dark-mode #daily-food-tracker-link,
  .dark-mode #daily-treat-tracker-link,
  .dark-mode #daily-exercise-tracker-link,
  .dark-mode #daily-medicine-tracker-link {
    background-color: #333333;
    color: #f2f2f2;
    border-color: #4a4a4a;
    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.3);
  }

  .dark-mode #home-page-link:hover,
  .dark-mode #get-started-link:hover,
  .dark-mode #daily-food-tracker-link:hover,
  .dark-mode #daily-treat-tracker-link:hover,
  .dark-mode #daily-exercise-tracker-link:hover,
  .dark-mode #daily-medicine-tracker-link:hover {
    border-color: #993638;
    background-color: #3d3d3d;
  }

  #home-page-link :deep(svg.home-page-1),
  #get-started-link :deep(svg.get-started-1),
  #daily-food-tracker-link :deep(svg.pet-food-1),
  #daily-treat-tracker-link :deep(svg.pet-treat-1),
  #daily-exercise-tracker-link :deep(svg.pet-exercise-1),
  #daily-medicine-tracker-link :deep(svg.pet-medicine-1) {
    width: 30px;
    height: 30px;
    transition: transform 0.3s ease-in-out;
  }

  #home-page-link:hover :deep(svg.home-page-1),
  #get-started-link:hover :deep(svg.get-started-1),
  #daily-food-tracker-link:hover :deep(svg.pet-food-1),
  #daily-treat-tracker-link:hover :deep(svg.pet-treat-1),
  #daily-exercise-tracker-link:hover :deep(svg.pet-exercise-1),
  #daily-medicine-tracker-link:hover :deep(svg.pet-medicine-1) {
    transform: scale(1.1);
  }

  #get-started-link :deep(svg.get-started-1) {
    color: #2e3436;
  }

  .dark-mode #get-started-link :deep(svg.get-started-1) {
    color: #188b31;
  }

  .home-page-container,
  .get-started-container,
  .food-tracker-container,
  .treat-tracker-container,
  .exercise-tracker-container,
  .medicine-tracker-container {
    position: relative;
    display: inline-block;
  }

  .home-page-icons,
  .get-started-icons,
  .pet-food-icons,
  .pet-treat-icons,
  .pet-exercise-icons,
  .pet-medicine-icons {
    position: absolute;
    inset: 0;
    pointer-events: none;
    overflow: visible;
  }

  .home-page-icons :deep(svg),
  .get-started-icons :deep(svg),
  .pet-food-icons :deep(svg),
  .pet-treat-icons :deep(svg),
  .pet-exercise-icons :deep(svg),
  .pet-medicine-icons :deep(svg) {
    position: absolute;
    width: 30px;
    height: 30px;
    left: 50%;
    top: 0;
    opacity: 0;
    transform: translate(-50%, 12px) scale(0) rotate(0deg);
    transition: left 0.45s cubic-bezier(0.2, 0.8, 0.2, 1), top 0.45s ease, opacity 0.25s ease, transform 0.45s cubic-bezier(0.2, 0.8, 0.2, 1);
  }

  .home-page-icons :deep(svg.home-page-2),
  .get-started-icons :deep(svg.get-started-2),
  .pet-food-icons :deep(svg.pet-food-2),
  .pet-treat-icons :deep(svg.pet-treat-2),
  .pet-exercise-icons :deep(svg.pet-exercise-2),
  .pet-medicine-icons :deep(svg.pet-medicine-2) {
    --food-left: 10%;
    --food-rotation: -15deg;
  }

  .home-page-container:hover .home-page-icons :deep(svg.home-page-2),
  .get-started-container:hover .get-started-icons :deep(svg.get-started-2),
  .food-tracker-container:hover .pet-food-icons :deep(svg.pet-food-2),
  .treat-tracker-container:hover .pet-treat-icons :deep(svg.pet-treat-2),
  .exercise-tracker-container:hover .pet-exercise-icons :deep(svg.pet-exercise-2),
  .medicine-tracker-container:hover .pet-medicine-icons :deep(svg.pet-medicine-2) {
    left: 10%;
    top: -40px;
    opacity: 1;
    transform: translate(-50%, 0) scale(1) rotate(-15deg);
    transition-delay: 0s;
  }

  .home-page-icons :deep(svg.home-page-3),
  .get-started-icons :deep(svg.get-started-3),
  .pet-food-icons :deep(svg.pet-food-3),
  .pet-treat-icons :deep(svg.pet-treat-3),
  .pet-exercise-icons :deep(svg.pet-exercise-3),
  .pet-medicine-icons :deep(svg.pet-medicine-3) {
    --food-left: 30%;
    --food-rotation: -8deg;
  }

  .home-page-container:hover .home-page-icons :deep(svg.home-page-3),
  .get-started-container:hover .get-started-icons :deep(svg.get-started-3),
  .food-tracker-container:hover .pet-food-icons :deep(svg.pet-food-3),
  .treat-tracker-container:hover .pet-treat-icons :deep(svg.pet-treat-3),
  .exercise-tracker-container:hover .pet-exercise-icons :deep(svg.pet-exercise-3),
  .medicine-tracker-container:hover .pet-medicine-icons :deep(svg.pet-medicine-3) {
    left: 30%;
    top: -40px;
    opacity: 1;
    transform: translate(-50%, 0) scale(1) rotate(-8deg);
    transition-delay: 0.07s;
  }

  .home-page-icons :deep(svg.home-page-4),
  .get-started-icons :deep(svg.get-started-4),
  .pet-food-icons :deep(svg.pet-food-4),
  .pet-treat-icons :deep(svg.pet-treat-4),
  .pet-exercise-icons :deep(svg.pet-exercise-4),
  .pet-medicine-icons :deep(svg.pet-medicine-4) {
    --food-left: 50%;
    --food-rotation: 0deg;
  }

  .home-page-container:hover .home-page-icons :deep(svg.home-page-4),
  .get-started-container:hover .get-started-icons :deep(svg.get-started-4),
  .food-tracker-container:hover .pet-food-icons :deep(svg.pet-food-4),
  .treat-tracker-container:hover .pet-treat-icons :deep(svg.pet-treat-4),
  .exercise-tracker-container:hover .pet-exercise-icons :deep(svg.pet-exercise-4),
  .medicine-tracker-container:hover .pet-medicine-icons :deep(svg.pet-medicine-4) {
    left: 50%;
    top: -40px;
    opacity: 1;
    transform: translate(-50%, 0) scale(1) rotate(5deg);
    transition-delay: 0.14s;
  }

  .home-page-icons :deep(svg.home-page-5),
  .get-started-icons :deep(svg.get-started-5),
  .pet-food-icons :deep(svg.pet-food-5),
  .pet-treat-icons :deep(svg.pet-treat-5),
  .pet-exercise-icons :deep(svg.pet-exercise-5),
  .pet-medicine-icons :deep(svg.pet-medicine-5) {
    --food-left: 70%;
    --food-rotation: 8deg;
  }

  .home-page-container:hover .home-page-icons :deep(svg.home-page-5),
  .get-started-container:hover .get-started-icons :deep(svg.get-started-5),
  .food-tracker-container:hover .pet-food-icons :deep(svg.pet-food-5),
  .treat-tracker-container:hover .pet-treat-icons :deep(svg.pet-treat-5),
  .exercise-tracker-container:hover .pet-exercise-icons :deep(svg.pet-exercise-5),
  .medicine-tracker-container:hover .pet-medicine-icons :deep(svg.pet-medicine-5) {
    left: 70%;
    top: -40px;
    opacity: 1;
    transform: translate(-50%, 0) scale(1) rotate(8deg);
    transition-delay: 0.21s;
  }

  .home-page-icons :deep(svg.home-page-6),
  .get-started-icons :deep(svg.get-started-6),
  .pet-food-icons :deep(svg.pet-food-6),
  .pet-treat-icons :deep(svg.pet-treat-6),
  .pet-exercise-icons :deep(svg.pet-exercise-6),
  .pet-medicine-icons :deep(svg.pet-medicine-6) {
    --food-left: 90%;
    --food-rotation: 15deg;
  }

  .home-page-container:hover .home-page-icons :deep(svg.home-page-6),
  .get-started-container:hover .get-started-icons :deep(svg.get-started-6),
  .food-tracker-container:hover .pet-food-icons :deep(svg.pet-food-6),
  .treat-tracker-container:hover .pet-treat-icons :deep(svg.pet-treat-6),
  .exercise-tracker-container:hover .pet-exercise-icons :deep(svg.pet-exercise-6),
  .medicine-tracker-container:hover .pet-medicine-icons :deep(svg.pet-medicine-6) {
    left: 90%;
    top: -40px;
    opacity: 1;
    transform: translate(-50%, 0) scale(1) rotate(15deg);
    transition-delay: 0.28s;
  }

  @media (prefers-reduced-motion: reduce) {
    .home-page-icons :deep(svg),
    .get-started-icons :deep(svg),
    .pet-food-icons :deep(svg),
    .pet-treat-icons :deep(svg),
    .pet-exercise-icons :deep(svg),
    .pet-medicine-icons :deep(svg) {
      transition: none;
    }
  }

  h2 {
    font-size: 2.5rem;
    margin-bottom: 1rem;
  }

  p {
    font-size: 1.2rem;
    max-width: 600px;
    margin: 0 auto;
  }
</style>
