<script setup lang="ts">
  import { ref, onMounted, onUnmounted, nextTick } from 'vue'
  import { getPets, deletePet, type Pet } from './pets'
  import { isDarkMode } from './darkMode'
  import Icons from './Icons.vue'
  import { useRouter } from 'vue-router'

  interface TrackedPet extends Pet {
    pottyBreaks: string[]
    pottyBreakdown: Record<string, number>
    pottyHistory: string[]
  }

  const router = useRouter()

  const trackedPets = ref<TrackedPet[]>([])
  const selectedPet = ref<TrackedPet | null>(null)
  const showRemovePetPopup = ref(false)
  const petToRemove = ref<TrackedPet | null>(null)
  const todayDate = new Date().toLocaleDateString('en-US')
  const currentTime = ref(new Date().toLocaleTimeString('en-US'))
  let clockInterval: ReturnType<typeof setInterval>

  const logKeyFor = (petId: string) => `pottyLog:${petId}:${todayDate}`

  onMounted(() => {
    document.title = 'Daily Potty Tracker'
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
        pottyBreaks,
        pottyBreakdown: JSON.parse(localStorage.getItem(`pottyBreakdown:${pet.id}:${todayDate}`) || '{}'),
        pottyHistory: JSON.parse(localStorage.getItem(`pottyHistory:${pet.id}:${todayDate}`) || '[]')
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

  const savePottyBreakdown = (p: TrackedPet) => {
    localStorage.setItem(`pottyBreakdown:${p.id}:${todayDate}`, JSON.stringify(p.pottyBreakdown))
    localStorage.setItem(`pottyHistory:${p.id}:${todayDate}`, JSON.stringify(p.pottyHistory))
  }

  const logPottyBreak = async (p: TrackedPet) => {
    const time = new Date().toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit'
    })
    p.pottyBreaks.push(time)
    p.pottyHistory.push(time)
    p.pottyBreakdown[time] = (p.pottyBreakdown[time] || 0)
    localStorage.setItem(logKeyFor(p.id), JSON.stringify(p.pottyBreaks))
    await triggerConfetti()
    savePottyBreakdown(p)
  }

  const removeLog = (p: TrackedPet) => {
    if (p.pottyBreaks.length === 0) return
    p.pottyBreaks.pop()
    const lastBreak = p.pottyHistory.pop()
    if (lastBreak && p.pottyBreakdown[lastBreak]) {
      p.pottyBreakdown[lastBreak] -= 1
      if(p.pottyBreakdown[lastBreak] === 0) {
        delete p.pottyBreakdown[lastBreak]
      }
    }
    localStorage.setItem(logKeyFor(p.id), JSON.stringify(p.pottyBreaks))
    savePottyBreakdown(p)
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
    const petId = petToRemove.value.id
    trackedPets.value = trackedPets.value.filter(pet => pet.id !== petToRemove.value!.id)
    cancelRemovePet()
    if (selectedPet.value?.id === petId) {
      closePetPopup()
    }
  }

  const removeFromAllTrackers = () => {
    if (!petToRemove.value) return
    const petId = petToRemove.value.id
    deletePet(petId)
    localStorage.removeItem(logKeyFor(petId))
    trackedPets.value = trackedPets.value.filter(pet => pet.id !== petId)
    cancelRemovePet()
    if (selectedPet.value?.id === petId) {
      closePetPopup()
    }
  }

  const openPetPopup = (pet: TrackedPet) => {
    selectedPet.value = pet
  }

  const closePetPopup = () => {
    selectedPet.value = null
  }

  const showConfetti = ref(false)
  const confettiPieces = ref<ConfettiPiece[]>([])

  interface ConfettiPiece {
    x: number
    y: number
    rotation: number
    delay: number
  }

  const triggerConfetti = async () => {
    confettiPieces.value = Array.from({ length: 24 }, () => ({
      x: (Math.random() - 0.5) * 500,
      y: -Math.random() * 300 - 100,
      rotation: Math.random() * 720 - 360,
      delay: Math.random() * 0.15,
    }))
    showConfetti.value = false
    await nextTick()
    showConfetti.value = true
    setTimeout(() => {
      showConfetti.value = false
    }, 1200)
  }

  const navigateAfterAnimation = (event: MouseEvent, destination: string) => {
    const link = event.currentTarget as HTMLElement
    const container = link.parentElement
    if (link.classList.contains('is-animating')) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      router.push(destination)
      return
    }
    const isTouchDevice = window.matchMedia(
      '(hover: none), (pointer: coarse)'
    ).matches
    if (!isTouchDevice) {
      router.push(destination)
      return
    }
    const finishAnimation = (animationEvent: AnimationEvent) => {
      if (animationEvent.target !== link) return
      link.removeEventListener('animationend', finishAnimation)
      router.push(destination)
    }
    link.addEventListener('animationend', finishAnimation)
    container?.classList.add('is-animating')
    link.classList.add('is-animating')
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
        It looks like you haven't set up your pet's information yet. <span class="get-started-link-container"><router-link to="/get-started" id="get-started-link" @click.prevent="navigateAfterAnimation($event, '/get-started')">You can get started here.</router-link></span>
      </p>
    </div>
    <div v-else>
      <div class="tracker-links">
        <div class="home-page-container">
          <router-link to="/" id="home-page-link" @click.prevent="navigateAfterAnimation($event, '/')">
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
          <router-link to="/get-started" id="get-started-link" @click.prevent="navigateAfterAnimation($event, '/get-started')">
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
          <router-link to='/daily-food-tracker' id="daily-food-tracker-link" @click.prevent="navigateAfterAnimation($event, '/daily-food-tracker')">
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
          <router-link to='/daily-treat-tracker' id="daily-treat-tracker-link" @click.prevent="navigateAfterAnimation($event, '/daily-treat-tracker')">
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
          <router-link to="/daily-exercise-tracker" id="daily-exercise-tracker-link" @click.prevent="navigateAfterAnimation($event, '/daily-exercise-tracker')">
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
          <router-link to="/daily-medicine-tracker" id="daily-medicine-tracker-link" @click.prevent="navigateAfterAnimation($event, '/daily-medicine-tracker')">
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
      <div class="pet-list">
        <div v-for="pet in trackedPets" :key="pet.id" class="pet-tracker">
          <p><strong>{{ pet.name }}</strong></p>
          <p v-if="pet.breed">{{ pet.breed }}</p>
          <p>{{ pet.type }}</p>
          <button class="view-pet-button" :data-test="`view-${pet.id}`" @click="openPetPopup(pet)">View Tracker</button>
        </div>
      </div>
      <div v-if="selectedPet" class="pet-modal-overlay" @click.self="closePetPopup">
        <div class="pet-modal-content">
          <button class="close-modal-button" aria-label="Close pet tracker" @click="closePetPopup">&times;</button>
          <h3>{{ selectedPet.name }}'s Daily Potty Tracker</h3>
          <p v-if="selectedPet.breed">{{ selectedPet.breed }}</p>
          <p>{{ selectedPet.type }}</p>
          <p>Today's date: {{ todayDate }}</p>
          <p>{{ progressOf(selectedPet) }}</p>
          <div class="potty-tracker-progress-container">
            <progress class="potty-progress-bar" :value="selectedPet.pottyBreaks.length" :aria-label="`${selectedPet.name} daily potty progress`"></progress>
          </div>
          <div class="potty-log-buttons">
            <button :data-test="`log-${selectedPet.id}`" @click="logPottyBreak(selectedPet)">Log potty break for {{ selectedPet.name }}</button>
            <button :data-test="`remove-log-${selectedPet.id}`" @click="removeLog(selectedPet)">Remove last potty break</button>
          </div>
          <div class="reset-potty-count-button">
            <button :data-test="`reset-${selectedPet.id}`" @click="resetLog(selectedPet)">Reset potty break count</button>
          </div>
          <div class="remove-pet-button-container">
            <button class="remove-pet-button" :data-test="`remove-pet-${selectedPet.id}`" @click="askRemovePet(selectedPet)">Remove {{ selectedPet.name }}</button>
          </div>
          <div v-if="selectedPet.pottyBreaks.length" class="potty-breakdown">
            <h4>Today's Potty Breaks</h4>
            <div v-for="(time, index) in selectedPet.pottyBreaks" :key="`${time}-${index}`">
              <div class="potty-breakdown-heading">
                <span>{{ time }} — Potty break</span>
                <span>{{ selectedPet.pottyBreaks.length }} completed</span>
              </div>
              <div class="potty-breakdown-bar">
                <div class="potty-breakdown-progress" :style="{ width: `${selectedPet.pottyBreaks.length ? ((index + 1) / selectedPet.pottyBreaks.length) * 100 : 0}%` }"></div>
              </div>
            </div>
          </div>
        </div>
          <div v-if="showConfetti" class="confetti-container" aria-hidden="true">
            <span v-for="(piece, index) in confettiPieces" :key="index" class="confetti-piece" :style="{ '--x': `${piece.x}px`, '--y': `${piece.y}px`, '--rotation': `${piece.rotation}deg`, '--delay': `${piece.delay}s` }"></span>
          </div>
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

  .home-page-container:is(:hover, .is-animating) .home-page-icons :deep(svg.home-page-2),
  .get-started-container:is(:hover, .is-animating) .get-started-icons :deep(svg.get-started-2),
  .food-tracker-container:is(:hover, .is-animating) .pet-food-icons :deep(svg.pet-food-2),
  .treat-tracker-container:is(:hover, .is-animating) .pet-treat-icons :deep(svg.pet-treat-2),
  .exercise-tracker-container:is(:hover, .is-animating) .pet-exercise-icons :deep(svg.pet-exercise-2),
  .medicine-tracker-container:is(:hover, .is-animating) .pet-medicine-icons :deep(svg.pet-medicine-2) {
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

  .home-page-container:is(:hover, .is-animating) .home-page-icons :deep(svg.home-page-3),
  .get-started-container:is(:hover, .is-animating) .get-started-icons :deep(svg.get-started-3),
  .food-tracker-container:is(:hover, .is-animating) .pet-food-icons :deep(svg.pet-food-3),
  .treat-tracker-container:is(:hover, .is-animating) .pet-treat-icons :deep(svg.pet-treat-3),
  .exercise-tracker-container:is(:hover, .is-animating) .pet-exercise-icons :deep(svg.pet-exercise-3),
  .medicine-tracker-container:is(:hover, .is-animating) .pet-medicine-icons :deep(svg.pet-medicine-3) {
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

  .home-page-container:is(:hover, .is-animating) .home-page-icons :deep(svg.home-page-4),
  .get-started-container:is(:hover, .is-animating) .get-started-icons :deep(svg.get-started-4),
  .food-tracker-container:is(:hover, .is-animating) .pet-food-icons :deep(svg.pet-food-4),
  .treat-tracker-container:is(:hover, .is-animating) .pet-treat-icons :deep(svg.pet-treat-4),
  .exercise-tracker-container:is(:hover, .is-animating) .pet-exercise-icons :deep(svg.pet-exercise-4),
  .medicine-tracker-container:is(:hover, .is-animating) .pet-medicine-icons :deep(svg.pet-medicine-4) {
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

  .home-page-container:is(:hover, .is-animating) .home-page-icons :deep(svg.home-page-5),
  .get-started-container:is(:hover, .is-animating) .get-started-icons :deep(svg.get-started-5),
  .food-tracker-container:is(:hover, .is-animating) .pet-food-icons :deep(svg.pet-food-5),
  .treat-tracker-container:is(:hover, .is-animating) .pet-treat-icons :deep(svg.pet-treat-5),
  .exercise-tracker-container:is(:hover, .is-animating) .pet-exercise-icons :deep(svg.pet-exercise-5),
  .medicine-tracker-container:is(:hover, .is-animating) .pet-medicine-icons :deep(svg.pet-medicine-5) {
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

  .home-page-container:is(:hover, .is-animating) .home-page-icons :deep(svg.home-page-6),
  .get-started-container:is(:hover, .is-animating) .get-started-icons :deep(svg.get-started-6),
  .food-tracker-container:is(:hover, .is-animating) .pet-food-icons :deep(svg.pet-food-6),
  .treat-tracker-container:is(:hover, .is-animating) .pet-treat-icons :deep(svg.pet-treat-6),
  .exercise-tracker-container:is(:hover, .is-animating) .pet-exercise-icons :deep(svg.pet-exercise-6),
  .medicine-tracker-container:is(:hover, .is-animating) .pet-medicine-icons :deep(svg.pet-medicine-6) {
    left: 90%;
    top: -40px;
    opacity: 1;
    transform: translate(-50%, 0) scale(1) rotate(15deg);
    transition-delay: 0.28s;
  }

  .tracker-links > div.is-animating > a {
    animation: tracker-link-tap 0.8s ease forwards;
  }

  @keyframes tracker-link-tap {
    0% {
      transform: translateY(0) scale(1);
    }

    35% {
      transform: translateY(-5px) scale(1.05);
    }

    70% {
      transform: translateY(-2px) scale(1.02);
    }

    100% {
      transform: translateY(0) scale(1);
    }
  }

  .get-started-link-container.is-animating #get-started-link {
    animation: tracker-link-tap 0.8s ease forwards;
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
    .tracker-links > div.is-animating > a {
      animation: none;
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

  .pet-list {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
    gap: 20px;
    width: 100%;
    max-width: 1000px;
    margin: 40px auto;
  }

  .pet-tracker {
    box-sizing: border-box;
    padding: 25px 20px;
    background-color: #ffffff;
    color: #1a1a1a;
    border: 1px solid #d1d1d1;
    border-radius: 14px;
    box-shadow: 0 3px 10px rgba(0, 0, 0, 0.08);
    transition: transform 0.2s ease, box-shadow 0.2s ease, background-color 0.3s ease;
  }

  .pet-tracker:hover {
    transform: translateY(-3px);
    box-shadow: 0 6px 15px rgba(0, 0, 0, 0.12);
  }

  .pet-tracker p {
    margin: 8px auto;
    font-size: 1.1rem;
  }

  .pet-tracker .view-pet-button {
    padding: 10px 22px;
    margin-top: 15px;
    background-color: #ffffff;
    color: #1a1a1a;
    border: 1px solid #d1d1d1;
    border-radius: 8px;
    font-family: inherit;
    font-size: 1rem;
    font-weight: 600;
    cursor: pointer;
    transition: transform 0.2s ease, background-color 0.3s ease, border-color 0.3s ease, box-shadow 0.2s ease;
  }

  .pet-tracker .view-pet-button:hover {
    transform: translateY(-2px);
    border-color: #993638;
    box-shadow: 0 3px 8px rgba(0, 0, 0, 0.12);
  }

  .pet-modal-overlay {
    position: fixed;
    inset: 0;
    z-index: 1000;
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 20px;
    box-sizing: border-box;
    background: rgba(0, 0, 0, 0.45);
    backdrop-filter: blur(6px);
    -webkit-backdrop-filter: blur(6px);
  }

  .pet-modal-content {
    position: relative;
    width: 100%;
    max-width: 600px;
    max-height: calc(100vh - 40px);
    overflow-y: auto;
    box-sizing: border-box;
    padding: 35px 30px;
    background-color: #ffffff;
    color: #1a1a1a;
    border: 1px solid #d1d1d1;
    border-radius: 16px;
    box-shadow: 0 10px 35px rgba(0, 0, 0, 0.25);
    animation: pet-modal-appear 0.25s ease-out;
  }

  .pet-modal-content h3 {
    margin: 10px 25px 20px;
    font-size: 1.5rem;
  }

  .pet-modal-content p {
    margin: 12px auto;
    font-size: 1.1rem;
    line-height: 1.5;
  }

  .pet-modal-content .close-modal-button {
    position: absolute;
    top: 12px;
    right: 15px;
    padding: 4px 10px;
    margin: 0;
    background: transparent;
    color: inherit;
    border: none;
    border-radius: 6px;
    font-size: 1.8rem;
    cursor: pointer;
  }

  .pet-modal-content .close-modal-button:hover {
    color: #993638;
  }

  .potty-log-buttons {
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    gap: 12px;
    margin-top: 12px;
  }

  .potty-log-buttons button,
  .reset-potty-count-button button,
  .remove-pet-button-container button {
    padding: 10px 18px;
    background-color: #ffffff;
    color: #1a1a1a;
    border: 1px solid #d1d1d1;
    border-radius: 8px;
    font-family: inherit;
    font-size: 0.95rem;
    font-weight: 600;
    cursor: pointer;
    transition: transform 0.2s ease, background-color 0.3s ease, border-color 0.3s ease, box-shadow 0.2s ease;
  }

  .potty-log-buttons button:hover:not(:disabled),
  .reset-potty-count-button button:hover:not(:disabled),
  .remove-pet-button-container button:hover:not(:disabled) {
    transform: translateY(-2px);
    border-color: #993638;
    box-shadow: 0 3px 8px rgba(0, 0, 0, 0.12);
  }

  .potty-log-buttons button:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .reset-potty-count-button {
    display: flex;
    justify-content: center;
    margin-top: 12px;
  }

  .remove-pet-button-container {
    display: flex;
    justify-content: center;
    margin-top: 12px;
  }

  .remove-pet-button-container .remove-pet-button {
    border-color: #993638;
    color: #993638;
  }

  .potty-type-buttons button.selected {
    animation: medicine-type-selected 0.25s ease forwards;
  }

  .pet-modal-content .potty-log-buttons button,
  .pet-modal-content .reset-potty-count-button button,
  .pet-modal-content .remove-pet-button-container button {
    padding: 10px 18px;
    background-color: #ffffff;
    color: #1a1a1a;
    border: 1px solid #d1d1d1;
    border-radius: 8px;
    font-family: inherit;
    font-size: 0.95rem;
    font-weight: 600;
    cursor: pointer;
    transition: transform 0.2s ease, background-color 0.3s ease, border-color 0.3s ease, box-shadow 0.2s ease;
  }

  .pet-modal-content .potty-log-buttons button:hover:not(:disabled),
  .pet-modal-content .reset-potty-count-button button:hover:not(:disabled),
  .pet-modal-content .remove-pet-button-container button:hover:not(:disabled) {
    transform: translateY(-2px);
    border-color: #993638;
    box-shadow: 0 3px 8px rgba(0, 0, 0, 0.12);
  }

  .pet-modal-content .potty-log-buttons button:disabled,
  .pet-modal-content .reset-potty-count-button button:disabled,
  .pet-modal-content .remove-pet-button-container button:hover:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .pet-modal-content .remove-pet-button {
    border-color: #993638;
    color: #993638;
  }

  .remove-pet-overlay {
    position: fixed;
    inset: 0;
    z-index: 1100;
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 20px;
    box-sizing: border-box;
    background: rgba(0, 0, 0, 0.5);
    backdrop-filter: blur(6px);
    -webkit-backdrop-filter: blur(6px);
  }

  .remove-pet-popup {
    width: 100%;
    max-width: 450px;
    padding: 30px;
    box-sizing: border-box;
    background-color: #ffffff;
    color: #1a1a1a;
    border-radius: 16px;
    box-shadow: 0 10px 35px rgba(0, 0, 0, 0.25);
    animation: pet-modal-appear 0.25s ease-out;
  }

  .remove-pet-popup p {
    margin-bottom: 20px;
    line-height: 1.5;
  }

  .remove-pet-popup button {
    padding: 10px 16px;
    margin: 6px;
    background-color: #ffffff;
    color: #1a1a1a;
    border: 1px solid #d1d1d1;
    border-radius: 8px;
    font-family: inherit;
    font-weight: 600;
    cursor: pointer;
  }

  .remove-pet-popup button:hover {
    border-color: #993638;
  }

  .dark-mode .pet-tracker,
  .dark-mode .pet-modal-content,
  .dark-mode .remove-pet-popup {
    background-color: #333333;
    color: #f2f2f2;
    border-color: #4a4a4a;
  }

  .dark-mode .pet-tracker .view-pet-button,
  .dark-mode .potty-log-buttons button,
  .dark-mode .reset-potty-count-button button,
  .dark-mode .remove-pet-button-container button,
  .dark-mode .remove-pet-popup button {
    background-color: #333333;
    color: #f2f2f2;
    border-color: #555555;
  }

  .dark-mode .pet-tracker .view-pet-button:hover,
  .dark-mode .potty-log-buttons button:hover:not(:disabled),
  .dark-mode .reset-potty-count-button button:hover:not(:disabled),
  .dark-mode .remove-pet-button-container button:hover:not(:disabled),
  .dark-mode .remove-pet-popup button:hover {
    background-color: #3d3d3d;
    border-color: #993638;
  }

  .dark-mode .pet-modal-content .remove-pet-button {
    color: #ff9999;
    border-color: #993638;
  }

  @keyframes pet-modal-appear {
    from {
      opacity: 0;
      transform: scale(0.95) translateY(10px);
    }

    to {
      opacity: 1;
      transform: scale(1) translateY(0);
    }
  }

  @media (max-width: 600px) {
    .pet-list {
      grid-template-columns: 1fr;
      gap: 15px;
      margin-top: 25px;
    }

    .pet-modal-content {
      padding: 30px 18px;
    }

    .pet-modal-content h3 {
      font-size: 1.25rem;
    }

    .potty-log-buttons,
    .reset-potty-count-button,
    .remove-pet-button {
      flex-direction: column;
    }

    .potty-log-buttons button,
    .reset-potty-count-button button,
    .remove-pet-button button {
      width: 100%;
    }
  }

  .pet-tracker button:focus-visible,
  .pet-modal-content button:focus-visible,
  .remove-pet-popup button:focus-visible {
    outline: 3px solid rgba(153, 54, 56, 0.4);
    outline-offset: 3px;
  }

  @media (prefers-reduced-motion: reduce) {
    .pet-tracker,
    .pet-tracker button,
    .pet-modal-content,
    .pet-modal-content button,
    .remove-pet-popup {
      animation: none;
      transition: none;
    }
  }

  .potty-breakdown {
    width: 100%;
    max-width: 450px;
    margin: 1.5rem auto;
    padding: 18px;
    box-sizing: border-box;
    border-radius: 12px;
    background-color: #f0f4ed;
    border: 1px solid #d5e1d2;
    text-align: left;
  }

  .potty-breakdown h4 {
    margin: 0 0 1.25rem;
    text-align: center;
    font-size: 1.15rem;
  }

  .potty-breakdown-item {
    margin-bottom: 1rem;
  }

  .potty-breakdown-heading {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 10px;
    margin-bottom: 7px;
    font-size: 0.95rem;
    font-weight: 600;
  }

  .potty-breakdown-bar {
    width: 100%;
    height: 9px;
    overflow: hidden;
    border-radius: 10px;
    background-color: #dce5d9;
  }

  .potty-breakdown-progress {
    height: 100%;
    border-radius: 10px;
    background-color: #529568;
    transition: width 0.3s ease;
  }

  .daily-potty-tracker.dark-mode .potty-breakdown {
    background-color: #293a30;
    border-color: #465d4b;
  }

  .daily-potty-tracker.dark-mode .potty-breakdown-bar {
    background-color: #435448;
  }

  .daily-potty-tracker.dark-mode .potty-breakdown-progress {
    background-color: #77b783;
  }

  .potty-progress-bar {
    width: 100%;
    max-width: 450px;
    height: 10px;
    margin: 1.25rem auto;
    display: block;
    overflow: hidden;
    border-radius: 10px;
    appearance: none;
    -webkit-appearance: none;
    background-color: #dce5d9;
  }

  .potty-progress-bar::-webkit-progress-bar {
    background-color: #dce5d9;
    border-radius: 10px;
  }

  .potty-progress-bar::-webkit-progress-value {
    background-color: #529568;
    border-radius: 10px;
    transition: width 0.3s ease;
  }

  .potty-progress-bar::-moz-progress-bar {
    background-color: #529568;
    border-radius: 10px;
    transition: width 0.3s ease;
  }

  .daily-potty-tracker.dark-mode .potty-progress-bar {
    background-color: #435448;
  }

  .daily-potty-tracker.dark-mode .potty-progress-bar::-webkit-progress-bar {
    background-color: #435448;
  }

  .daily-potty-tracker.dark-mode .potty-progress-bar::-webkit-progress-value {
    background-color: #77b783;
  }

  .daily-potty-tracker.dark-mode .potty-progress-bar::-moz-progress-bar {
    background-color: #77b783;
  }

  .confetti-container {
    position: absolute;
    inset: 0;
    z-index: 10;
    pointer-events: none;
    overflow: visible;
  }

  .confetti-piece {
    position: absolute;
    top: 45%;
    left: 50%;
    width: 8px;
    height: 14px;
    border-radius: 2px;
    background-color: #529568;
    opacity: 0;
    animation: confetti-blast 1.1s ease-out forwards;
    animation-delay: var(--delay);
  }

  .confetti-piece:nth-child(3n) {
    background-color: #f2c94c;
  }

  .confetti-piece:nth-child(3n + 1) {
    background-color: #993638;
  }

  .confetti-piece:nth-child(3n + 2) {
    background-color: #77b783;
  }

  @keyframes confetti-blast {
    0% {
      opacity: 1;
      transform: translate(0, 0) rotate(0deg);
    }

    70% {
      opacity: 1;
    }

    100% {
      opacity: 0;
      transform: translate(var(--x), var(--y)) rotate(var(--rotation));
    }
  }
</style>
