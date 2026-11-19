<script setup lang="ts">
  import { ref, onMounted, onUnmounted, nextTick } from 'vue'
  import { getPets, deletePet, type Pet } from './pets'
  import { isDarkMode } from './darkMode'
  import Icons from './Icons.vue'

  interface TrackedPet extends Pet {
    exerciseCount: number
    exerciseDuration: number
    exerciseTypes: number
    exerciseLabels: string[]
    exerciseBreakdown: Record<string, number>
    exerciseHistory: string[]
  }

  const trackedPets = ref<TrackedPet[]>([])
  const selectedPet = ref<TrackedPet | null>(null)
  const showRemovePetPopup = ref(false)
  const petToRemove = ref<TrackedPet | null>(null)
  const todayDate = new Date().toLocaleDateString('en-US')

  const logKeyFor = (petId: string) => `exerciseLog:${petId}:${todayDate}`

  onMounted(() => {
    trackedPets.value = getPets().map(pet => {
      const saved = localStorage.getItem(logKeyFor(pet.id))
      const rawLabels = (pet as Pet & { exerciseLabels?: string | string[] }).exerciseLabels
      const exerciseLabels = Array.isArray(rawLabels) ? rawLabels : rawLabels ? rawLabels.split(',').map(label => label.trim()).filter(label => label.length > 0) : []
      return {
        ...pet,
        exerciseCount: saved ? Number(saved) : 0,
        exerciseDuration: Number((pet as Pet & { exerciseDuration?: number | string }).exerciseDuration ?? 0),
        exerciseTypes: Number((pet as Pet & { exerciseTypes?: number | string }).exerciseTypes ?? 0),
        exerciseLabels,
        exerciseBreakdown: JSON.parse(localStorage.getItem(`exerciseBreakdown:${pet.id}:${todayDate}`) || '{}'),
        exerciseHistory: JSON.parse(localStorage.getItem(`exerciseHistory:${pet.id}:${todayDate}`) || '[]'),
      }
    })
    trackedPets.value.forEach(pet => {
      timerSeconds.value[pet.id] = pet.exerciseDuration * 60
      timerMinutes.value[pet.id] = pet.exerciseDuration
    })
  })

  onUnmounted(() => {
    Object.entries(timerIntervals).forEach(([petId, interval]) => {
      clearInterval(interval)
      delete timerIntervals[petId]
      timerRunning.value[petId] = false
    })
  })


  const limitOf = (p: TrackedPet) => Number((p as TrackedPet & { exerciseFrequency?: number | string }).exerciseFrequency) || 0
  const remainingOf = (p: TrackedPet) => Math.max(0, limitOf(p) - p.exerciseCount)
  const progressOf = (p: TrackedPet) => limitOf(p) ? `${p.exerciseCount} of ${limitOf(p)} exercise sessions done today.` : 'No exercise goal set.'

  const saveExerciseBreakdown = (p: TrackedPet) => {
    localStorage.setItem(`exerciseBreakdown:${p.id}:${todayDate}`, JSON.stringify(p.exerciseBreakdown))
    localStorage.setItem(`exerciseHistory:${p.id}:${todayDate}`, JSON.stringify(p.exerciseHistory))
  }

  const logExercise = async (p: TrackedPet) => {
    if (limitOf(p) && p.exerciseCount >= limitOf(p)) return
    const label = selectedLabels.value[p.id] || 'Other'
    p.exerciseCount += 1
    p.exerciseHistory.push(label)
    p.exerciseBreakdown[label] = (p.exerciseBreakdown[label] || 0) + 1
    localStorage.setItem(logKeyFor(p.id), String(p.exerciseCount))
    if (limitOf(p) && p.exerciseCount === limitOf(p)) {
      await triggerConfetti()
    }
    saveExerciseBreakdown(p)
  }

  const removeLog = (p: TrackedPet) => {
    if (p.exerciseCount === 0) return
    p.exerciseCount -= 1
    const lastLabel = p.exerciseHistory.pop()
    if (lastLabel && p.exerciseBreakdown[lastLabel]) {
      p.exerciseBreakdown[lastLabel] -= 1
      if (p.exerciseBreakdown[lastLabel] === 0) {
        delete p.exerciseBreakdown[lastLabel]
      }
    }
    if (p.exerciseCount === 0) {
      localStorage.removeItem(logKeyFor(p.id))
    } else {
      localStorage.setItem(logKeyFor(p.id), String(p.exerciseCount))
    }
    saveExerciseBreakdown(p)
  }

  const resetLog = (p: TrackedPet) => {
    p.exerciseCount = 0
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
    const petId  = petToRemove.value.id
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

  const timerSeconds = ref<Record<string, number>>({})
  const timerMinutes = ref<Record<string, number>>({})
  const timerRunning = ref<Record<string, boolean>>({})
  const timerIntervals: Record<string, ReturnType<typeof setInterval>> = {}
  const timerEnabled = ref<Record<string, boolean>>({})

  const formatTimer = (seconds: number) => {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${String(minutes).padStart(2, '0')}:${String(remainingSeconds).padStart(2, '0')}`
  }

  const updateTimerDuration = (pet: TrackedPet) => {
    const minutes = Number(timerMinutes.value[pet.id])
    const validMinutes = Number.isFinite(minutes) && minutes >= 1 ? minutes : 1
    timerMinutes.value[pet.id] = validMinutes
    timerSeconds.value[pet.id] = validMinutes * 60
  }

  const startTimer = (p: TrackedPet) => {
     if (timerRunning.value[p.id]) return
    if (timerSeconds.value[p.id] === undefined || timerSeconds.value[p.id] === 0) {
      timerSeconds.value[p.id] = p.exerciseDuration * 60
    }
    timerRunning.value[p.id] = true
    timerIntervals[p.id] = setInterval(() => {
      const seconds = timerSeconds.value[p.id] ?? 0
      if (seconds > 0) {
        timerSeconds.value[p.id] = seconds - 1
      } else {
        stopTimer(p)
      }
    }, 1000)
  }

  const stopTimer = (p: TrackedPet) => {
    timerRunning.value[p.id] = false
    if (timerIntervals[p.id]) {
      clearInterval(timerIntervals[p.id])
      delete timerIntervals[p.id]
    }
  }

  const resetTimer = (p: TrackedPet) => {
    stopTimer(p)
    timerSeconds.value[p.id] = (timerMinutes.value[p.id] || p.exerciseDuration) * 60
  }

  const selectedLabels = ref<Record<string, string>>({})
  const selectLabel = (pet: TrackedPet, label: string) => {
    selectedLabels.value[pet.id] = selectedLabels.value[pet.id] === label ? '' : label
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
</script>

<template>
  <main class="daily-exercise-tracker" :class="{ 'dark-mode': isDarkMode }">
    <h2>Daily Exercise Tracker</h2>
    <input id="dark-mode-toggle" v-model="isDarkMode" type="checkbox" />
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
        <div class="potty-tracker-container">
          <router-link to="/daily-potty-tracker" id="daily-potty-tracker-link">
            <span>Daily Potty Tracker</span>
            <Icons icon="pet-potty-1" />
          </router-link>
          <div class="pet-potty-icons">
            <Icons icon="pet-potty-2" />
            <Icons icon="pet-potty-3" />
            <Icons icon="pet-potty-4" />
            <Icons icon="pet-potty-5" />
            <Icons icon="pet-potty-6" />
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
          <h3>{{ selectedPet.name }}'s Daily Exercise Tracker</h3>
          <p v-if="selectedPet.breed">{{ selectedPet.breed }}</p>
          <p>{{ selectedPet.type }}</p>
          <p>Today's date: {{ todayDate }}</p>
          <p>{{ progressOf(selectedPet) }}</p>
          <p v-if="limitOf(selectedPet)">Remaining exercises for the day: {{ remainingOf(selectedPet) }}</p>
          <div class="exercise-tracker-progress-container">
            <progress class="exercise-progress-bar" :max="limitOf(selectedPet)" :value="selectedPet.exerciseCount" :aria-label="`${selectedPet.name} daily exercise progress`"></progress>
          </div>
          <div v-if="selectedPet.exerciseLabels.length" class="exercise-types-section">
            <p class="exercise-types-title">Choose an exercise type:</p>
            <div class="exercise-type-buttons">
              <button v-for="label in selectedPet.exerciseLabels" :key="label" :data-test="`exercise-label-${selectedPet.id}-${label}`" :class="{ selected: selectedLabels[selectedPet.id] === label }" @click="selectLabel(selectedPet, label)">{{ label }}</button>
            </div>
          </div>
          <div class="exercise-log-buttons">
            <button :disabled="remainingOf(selectedPet) === 0" :data-test="`log-${selectedPet.id}`" @click="logExercise(selectedPet)">Log exercise session for {{ selectedPet.name }}</button>
            <button :data-test="`remove-log-${selectedPet.id}`" @click="removeLog(selectedPet)">Remove last exercise session</button>
          </div>
          <div class="reset-exercise-count-button">
            <button :data-test="`reset-${selectedPet.id}`" @click="resetLog(selectedPet)">Reset exercise count</button>
          </div>
          <div class="remove-pet-button-container">
            <button class="remove-pet-button" :data-test="`remove-pet-${selectedPet.id}`" @click="askRemovePet(selectedPet)"> Remove {{ selectedPet.name }}</button>
          </div>
          <div v-if="Object.keys(selectedPet.exerciseBreakdown).length" class="exercise-breakdown">
            <h4>Today's Exercise Sessions</h4>
            <div v-for="(count, label) in selectedPet.exerciseBreakdown" :key="label" class="exercise-breakdown-item">
              <div class="exercise-breakdown-heading">
                <span>{{ label }}</span>
                <span>{{ count }} completed</span>
              </div>
              <div class="exercise-breakdown-bar">
                <div class="exercise-breakdown-progress" :style="{width: `${selectedPet.exerciseCount ? (count / selectedPet.exerciseCount) * 100 : 0}%`}"></div>
              </div>
            </div>
          </div>
          <div v-if="showConfetti" class="confetti-container" aria-hidden="true">
            <span v-for="(piece, index) in confettiPieces" :key="index" class="confetti-piece" :style="{ '--x': `${piece.x}px`, '--y': `${piece.y}px`, '--rotation': `${piece.rotation}deg`, '--delay': `${piece.delay}s` }"></span>
          </div>

          <div class="exercise-timer-section">
            <div v-if="!timerEnabled[selectedPet.id]" class="timer-prompt">
              <p class="timer-question">Would you like to set a timer for {{ selectedPet.name }}'s exercise?</p>
              <label class="timer-toggle">
                <input v-model="timerEnabled[selectedPet.id]" type="checkbox" :data-test="`timer-checkbox-${selectedPet.id}`" :aria-label="`Enable exercise timer for ${selectedPet.name}`" />
                <span class="timer-toggle-slider"></span>
              </label>
            </div>
            <div v-if="timerEnabled[selectedPet.id]" class="timer-controls-wrapper">
              <div class="timer-duration-setting">
                <label :for="`timer-minutes-${selectedPet.id}`">
                  Set timer duration
                </label>
                <div class="timer-duration-input">
                  <input :id="`timer-minutes-${selectedPet.id}`" v-model.number="timerMinutes[selectedPet.id]" type="number" min="1" max="180" :disabled="timerRunning[selectedPet.id]" :data-test="`timer-minutes-${selectedPet.id}`" @change="updateTimerDuration(selectedPet)" />
                  <span>minutes</span>
                </div>
              </div>
              <div class="exercise-clock" :class="{ 'timer-running': timerRunning[selectedPet.id] }" :data-test="`timer-${selectedPet.id}`">
                <div class="clock-face">
                  <span class="clock-number clock-12">12</span>
                  <span class="clock-number clock-3">3</span>
                  <span class="clock-number clock-6">6</span>
                  <span class="clock-number clock-9">9</span>
                  <div class="clock-time">
                    {{ formatTimer(timerSeconds[selectedPet.id] ?? selectedPet.exerciseDuration * 60) }}
                  </div>
                  <div class="clock-center">
                    <span>Exercise Time</span>
                  </div>
                </div>
              </div>
              <div class="timer-controls">
                <button :data-test="`start-timer-${selectedPet.id}`" :disabled="timerRunning[selectedPet.id] || timerSeconds[selectedPet.id] === 0" @click="startTimer(selectedPet)">Start Timer</button>
                <button :data-test="`stop-timer-${selectedPet.id}`" :disabled="!timerRunning[selectedPet.id]" @click="stopTimer(selectedPet)">Stop Timer</button>
                <button :data-test="`reset-timer-${selectedPet.id}`" @click="resetTimer(selectedPet)">Reset Timer</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div v-if="showRemovePetPopup" class="remove-pet-overlay">
      <div class="remove-pet-popup">
        <p>Would you like to remove {{ petToRemove?.name }} from all trackers or only this Daily Exercise Tracker?</p>
        <button @click="removeFromThisTracker">Remove from this tracker</button>
        <button @click="removeFromAllTrackers">Remove from all trackers</button>
        <button @click="cancelRemovePet">Cancel</button>
      </div>
    </div>
  </main>
</template>

<style scoped>
  .daily-exercise-tracker {
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

  .daily-exercise-tracker.dark-mode {
    --sun-icon-color: #242424;
    --moon-icon-color: #f2f2f2;
    background: #242424;
    color: #fff;
  }

  label[for="dark-mode-toggle"] {
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

  label[for="dark-mode-toggle"]:after {
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

  label[for="dark-mode-toggle"]:active:after {
    width: 35px;
  }

  #dark-mode-toggle {
    width: 0;
    height: 0;
    visibility: hidden;
    opacity: 0;
    position: absolute;
  }

  #dark-mode-toggle:checked + label[for="dark-mode-toggle"] {
    background: #242424
  }

  #dark-mode-toggle:checked + label[for="dark-mode-toggle"]:after {
    left: 69px;
    transform: translateX(-100%);
    background: linear-gradient(180deg, #777, #3a3a3a);
  }

  #dark-mode-toggle:active:after {
    width: 35px;
  }

  label[for="dark-mode-toggle"] :deep(svg) {
    position: absolute;
    width: 25px;
    height: 25px;
    top: 50%;
    transform: translate(-50%, -50%);
    z-index: 10;
  }

  label[for="dark-mode-toggle"] :deep(svg.sun-icon) {
    left: 15px;
    transition: 0.3s;
  }

  label[for="dark-mode-toggle"] :deep(svg.moon-icon) {
    left: 55px;
    transition: 0.3s;
  }

  label[for="dark-mode-toggle"] :deep(svg.sun-icon path) {
    fill: var(--sun-icon-color);
  }

  label[for="dark-mode-toggle"] :deep(svg.sun-icon rect) {
    fill: transparent;
  }

  label[for="dark-mode-toggle"] :deep(svg.moon-icon path) {
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
  #daily-medicine-tracker-link,
  #daily-potty-tracker-link {
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
    transition: transform 0.2s,
      background-color 0.3s,
      border-color 0.3s,
      box-shadow 0.2s;
  }

  #home-page-link:hover,
  #get-started-link:hover,
  #daily-food-tracker-link:hover,
  #daily-treat-tracker-link:hover,
  #daily-medicine-tracker-link:hover,
  #daily-potty-tracker-link:hover {
    transform: translateY(-2px);
    border-color: #993638;
    box-shadow: 0 4px 10px rgba(0, 0, 0, 0.12);
  }

  .dark-mode #home-page-link,
  .dark-mode #get-started-link,
  .dark-mode #daily-food-tracker-link,
  .dark-mode #daily-treat-tracker-link,
  .dark-mode #daily-medicine-tracker-link,
  .dark-mode #daily-potty-tracker-link {
    background-color: #333333;
    color: #f2f2f2;
    border-color: #4a4a4a;
    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.3);
  }

  .dark-mode #home-page-link:hover,
  .dark-mode #get-started-link:hover,
  .dark-mode #daily-food-tracker-link:hover,
  .dark-mode #daily-treat-tracker-link:hover,
  .dark-mode #daily-medicine-tracker-link:hover,
  .dark-mode #daily-potty-tracker-link:hover {
    border-color: #993638;
    background-color: #3d3d3d;
  }

  #home-page-link :deep(svg.home-page-1),
  #get-started-link :deep(svg.get-started-1),
  #daily-food-tracker-link :deep(svg.pet-food-1),
  #daily-treat-tracker-link :deep(svg.pet-treat-1),
  #daily-medicine-tracker-link :deep(svg.pet-medicine-1),
  #daily-potty-tracker-link :deep(svg.pet-potty-1) {
    width: 30px;
    height: 30px;
    transition: transform 0.3s ease-in-out;
  }

  #home-page-link:hover :deep(svg.home-page-1),
  #get-started-link:hover :deep(svg.get-started-1),
  #daily-food-tracker-link:hover :deep(svg.pet-food-1),
  #daily-treat-tracker-link:hover :deep(svg.pet-treat-1),
  #daily-medicine-tracker-link:hover :deep(svg.pet-medicine-1),
  #daily-potty-tracker-link:hover :deep(svg.pet-potty-1) {
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
  .medicine-tracker-container,
  .potty-tracker-container {
    position: relative;
    display: inline-block;
  }

  .home-page-icons,
  .get-started-icons,
  .pet-food-icons,
  .pet-treat-icons,
  .pet-medicine-icons,
  .pet-potty-icons {
    position: absolute;
    inset: 0;
    pointer-events: none;
    overflow: visible;
  }

  .home-page-icons :deep(svg),
  .get-started-icons :deep(svg),
  .pet-food-icons :deep(svg),
  .pet-treat-icons :deep(svg),
  .pet-medicine-icons :deep(svg),
  .pet-potty-icons :deep(svg) {
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
  .pet-medicine-icons :deep(svg.pet-medicine-2),
  .pet-potty-icons :deep(svg.pet-potty-2) {
    --food-left: 10%;
    --food-rotation: -15deg;
  }

  .home-page-container:hover .home-page-icons :deep(svg.home-page-2),
  .get-started-container:hover .get-started-icons :deep(svg.get-started-2),
  .food-tracker-container:hover .pet-food-icons :deep(svg.pet-food-2),
  .treat-tracker-container:hover .pet-treat-icons :deep(svg.pet-treat-2),
  .medicine-tracker-container:hover .pet-medicine-icons :deep(svg.pet-medicine-2),
  .potty-tracker-container:hover .pet-potty-icons :deep(svg.pet-potty-2) {
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
  .pet-medicine-icons :deep(svg.pet-medicine-3),
  .pet-potty-icons :deep(svg.pet-potty-3) {
    --food-left: 30%;
    --food-rotation: -8deg;
  }

  .home-page-container:hover .home-page-icons :deep(svg.home-page-3),
  .get-started-container:hover .get-started-icons :deep(svg.get-started-3),
  .food-tracker-container:hover .pet-food-icons :deep(svg.pet-food-3),
  .treat-tracker-container:hover .pet-treat-icons :deep(svg.pet-treat-3),
  .medicine-tracker-container:hover .pet-medicine-icons :deep(svg.pet-medicine-3),
  .potty-tracker-container:hover .pet-potty-icons :deep(svg.pet-potty-3) {
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
  .pet-medicine-icons :deep(svg.pet-medicine-4),
  .pet-potty-icons :deep(svg.pet-potty-4) {
    --food-left: 50%;
    --food-rotation: 0deg;
  }

  .home-page-container:hover .home-page-icons :deep(svg.home-page-4),
  .get-started-container:hover .get-started-icons :deep(svg.get-started-4),
  .food-tracker-container:hover .pet-food-icons :deep(svg.pet-food-4),
  .treat-tracker-container:hover .pet-treat-icons :deep(svg.pet-treat-4),
  .medicine-tracker-container:hover .pet-medicine-icons :deep(svg.pet-medicine-4),
  .potty-tracker-container:hover .pet-potty-icons :deep(svg.pet-potty-4) {
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
  .pet-medicine-icons :deep(svg.pet-medicine-5),
  .pet-potty-icons :deep(svg.pet-potty-5) {
    --food-left: 70%;
    --food-rotation: 8deg;
  }

  .home-page-container:hover .home-page-icons :deep(svg.home-page-5),
  .get-started-container:hover .get-started-icons :deep(svg.get-started-5),
  .food-tracker-container:hover .pet-food-icons :deep(svg.pet-food-5),
  .treat-tracker-container:hover .pet-treat-icons :deep(svg.pet-treat-5),
  .medicine-tracker-container:hover .pet-medicine-icons :deep(svg.pet-medicine-5),
  .potty-tracker-container:hover .pet-potty-icons :deep(svg.pet-potty-5) {
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
  .pet-medicine-icons :deep(svg.pet-medicine-6),
  .pet-potty-icons :deep(svg.pet-potty-6) {
    --food-left: 90%;
    --food-rotation: 15deg;
  }

  .home-page-container:hover .home-page-icons :deep(svg.home-page-6),
  .get-started-container:hover .get-started-icons :deep(svg.get-started-6),
  .food-tracker-container:hover .pet-food-icons :deep(svg.pet-food-6),
  .treat-tracker-container:hover .pet-treat-icons :deep(svg.pet-treat-6),
  .medicine-tracker-container:hover .pet-medicine-icons :deep(svg.pet-medicine-6),
  .potty-tracker-container:hover .pet-potty-icons :deep(svg.pet-potty-6) {
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
    .pet-medicine-icons :deep(svg),
    .pet-potty-icons :deep(svg) {
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
    transition:
      transform 0.2s ease,
      box-shadow 0.2s ease,
      background-color 0.3s ease;
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
    transition:
      transform 0.2s ease,
      background-color 0.3s ease,
      border-color 0.3s ease,
      box-shadow 0.2s ease;
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

  .exercise-log-buttons {
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    gap: 12px;
    margin-top: 12px;
  }

  .exercise-type-buttons button.selected {
    animation: exercise-type-selected 0.25s ease forwards;
  }

  .exercise-log-buttons button,
  .reset-exercise-count-button button,
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
    transition:
      transform 0.2s ease,
      background-color 0.3s ease,
      border-color 0.3s ease,
      box-shadow 0.2s ease;
  }

  .exercise-log-buttons button:hover:not(:disabled),
  .reset-exercise-count-button button:hover:not(:disabled),
  .remove-pet-button-container button:hover:not(:disabled) {
    transform: translateY(-2px);
    border-color: #993638;
    box-shadow: 0 3px 8px rgba(0, 0, 0, 0.12);
  }

  .exercise-log-buttons button:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .reset-exercise-count-button {
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
  .dark-mode .exercise-log-buttons button,
  .dark-mode .reset-exercise-count-button button,
  .dark-mode .remove-pet-button-container button,
  .dark-mode .remove-pet-popup button {
    background-color: #333333;
    color: #f2f2f2;
    border-color: #555555;
  }

  .dark-mode .remove-pet-button-container .remove-pet-button {
    color: #f2f2f2;
  }

  .dark-mode .pet-tracker .view-pet-button:hover,
  .dark-mode .exercise-log-buttons button:hover:not(:disabled),
  .dark-mode .remove-pet-button-container button:hover:not(:disabled),
  .dark-mode .remove-pet-popup button:hover {
    background-color: #3d3d3d;
    border-color: #993638;
  }

  .dark-mode .pet-modal-content .remove-pet-button {
    color: #f2f2f2;
    border-color: #555555;
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

    .exercise-log-buttons,
    .remove-pet-button-container,
    .remove-pet-button {
      flex-direction: column;
    }

    .exercise-log-buttons button,
    .remove-pet-button-container button,
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

  .exercise-timer-section {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    width: 100%;
    max-width: 500px;
    margin: 1.5rem auto;
    padding: 1.25rem;
    border-radius: 12px;
    background-color: #e8e8e8;
    border: 1px solid #d4d4d4;
    text-align: center;
    box-sizing: border-box;
  }

  .daily-exercise-tracker.dark-mode .exercise-timer-section {
    background-color: #2f2f2f;
    border-color: #444444;
  }

  .timer-question {
    margin: 0 0 1rem;
    line-height: 1.5;
  }

  .exercise-timer {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    margin: 0;
    width: max-content;
    max-width: 135px;
    padding: 0.5rem 0.75rem;
    border-radius: 10px;
    background-color: #242424;
    color: #ffffff;
    font-family: monospace;
    font-size: 1.75rem;
    font-weight: 700;
    letter-spacing: 0.05em;
    text-align: center;
    box-sizing: border-box;
    z-index: 2;
  }

  .timer-controls button {
    min-width: 130px;
  }

  .exercise-types-section {
    width: 100%;
    margin-top: 1rem;
    text-align: center;
  }

  .exercise-types-title {
    margin: 0 0 10px;
    text-align: center;
    font-size: 0.95rem;
    font-weight: 600;
    color: #1a1a1a;
  }

  .dark-mode .exercise-types-title {
    color: #f2f2f2;
  }

  .exercise-type-buttons {
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    gap: 10px;
  }

  .exercise-type-buttons button {
    padding: 8px 14px;
    background-color: #ffffff;
    color: #1a1a1a;
    border: 1px solid #d1d1d1;
    border-radius: 8px;
    font-family: inherit;
    font-size: 0.9rem;
    font-weight: 600;
    cursor: pointer;
    transition: transform 0.2s ease, background-color 0.3s ease, border-color 0.3s ease, box-shadow 0.2s ease;
  }

  .exercise-type-buttons button:hover {
    transform: translateY(-2px);
    border-color: #993638;
    box-shadow: 0 3px 8px rgba(0, 0, 0, 0.12);
  }

  .exercise-type-buttons button.selected {
    background-color: #529568;
    color: #ffffff;
    border-color: #3f7d52;
    font-weight: 700;
    transform: translateY(-2px) scale(1.04);
    box-shadow: 0 0 0 3px rgba(82, 149, 104, 0.2), 0 4px 10px rgba(82, 149, 104, 0.3);
    animation: exercise-type-selected 0.25s ease-out;
  }

  .dark-mode .exercise-type-buttons button {
    background-color: #333333;
    color: #f2f2f2;
    border-color: #555555;
  }

  .dark-mode .exercise-type-buttons button:hover {
    border-color: #c96a6c;
  }

  .dark-mode .exercise-type-buttons button.selected {
    background-color: #529568;
    color: #f2f2f2;
    border-color: #3f7d52;
    font-weight: 700;
    transform: translateY(-2px) scale(1.04);
    box-shadow: 0 0 0 3px rgba(82, 149, 104, 0.2), 0 4px 10px rgba(82, 149, 104, 0.3);
    animation: exercise-type-selected 0.25s ease-out;
  }

  @keyframes exercise-type-selected {
    0% {
      transform: scale(0.95);
    }

    60% {
      transform: scale(1.08);
    }

    100% {
      transform: translateY(-2px) scale(1.04);
    }
  }

  .exercise-timer-section {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    margin-bottom: 1.5rem;
  }

  .timer-duration-setting label {
    display: block;
    font-weight: 600;
    margin-bottom: 0.5rem;
  }

  .timer-duration-input {
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 0.5rem;
  }

  .timer-duration-input input {
    width: 80px;
    padding: 0.5rem;
    border: 1px solid #aaa;
    border-radius: 6px;
    font-size: 1rem;
    text-align: center;
    background-color: #ffffff;
    color: #222222;
  }

  .daily-exercise-tracker.dark-mode .timer-duration-input input {
    background-color: #444444;
    border-color: #666666;
    color: #ffffff;
  }

  .timer-duration-input input:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  .exercise-clock {
    display: flex;
    justify-content: center;
    align-items: center;
    margin: 1rem auto 1.5rem;
  }

  .clock-face {
    position: relative;
    width: 220px;
    height: 220px;
    border: 8px solid #b7c5b5;
    border-radius: 50%;
    background-color: #fffdf5;
    box-shadow: 0 5px 15px rgba(45, 75, 48, 0.15), inset 0 0 0 5px #e5eddf;
    color: #293c2d;
  }

  .daily-exercise-tracker.dark-mode .clock-face {
    background-color: #1f1f1f;
    border-color: #666666;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.5), inset 0 0 0 4px #333333;
    color: #FFF;
  }

  .clock-time {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    padding: 10px 12px;
    border-radius: 10px;
    background: #b7c5b5;
    color: #293c2d;
    font-family: monospace;
    font-size: 2rem;
    font-weight: 700;
    letter-spacing: 0.06em;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.12);
  }

  .daily-exercise-tracker.dark-mode .clock-time {
    background: #666666;
    color: #f0f5eb;
  }

  .clock-number {
    position: absolute;
    font-weight: 700;
    font-size: 1rem;
  }

  .clock-12 {
    top: 12px;
    left: 50%;
    transform: translateX(-50%);
  }

  .clock-3 {
    right: 14px;
    top: 50%;
    transform: translateY(-50%);
  }

  .clock-6 {
    bottom: 12px;
    left: 50%;
    transform: translateX(-50%);
  }

  .clock-9 {
    left: 14px;
    top: 50%;
    transform: translateY(-50%);
  }

  .clock-mark {
    position: absolute;
    width: 3px;
    height: 10px;
    background-color: #555555;
    left: 50%;
    top: 50%;
    transform-origin: center 100px;
  }

  .clock-time {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    font-family: monospace;
    font-size: 2.2rem;
    font-weight: 700;
    letter-spacing: 0.08em;
  }

  .clock-center {
    position: absolute;
    top: 25%;
    left: 50%;
    transform: translate(-50%, -50%);
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 4px;
    z-index: 2;
  }

  .exercise-clock.timer-running .clock-face {
    animation: timer-pulse 1s ease-in-out infinite;
  }

  @keyframes timer-pulse {
    0%,
    100% {
      transform: scale(1);
    }

    50% {
      transform: scale(1.02);
    }
  }

  .timer-controls {
    display: grid;
    grid-template-columns: repeat(2, auto);
    justify-content: center;
    gap: 12px;
    margin-top: 1.25rem;
  }

  .timer-controls button,
  .disable-timer-button {
    min-width: 115px;
    padding: 10px 18px;
    border: none;
    border-radius: 9px;
    font-family: inherit;
    font-size: 0.95rem;
    font-weight: 600;
    cursor: pointer;
    transition: transform 0.2s ease, opacity 0.2s ease;
  }

  .timer-controls button:hover:not(:disabled),
  .disable-timer-button:hover {
    transform: translateY(-2px);
  }

  .timer-controls button:disabled {
    opacity: 0.4;
    cursor: not-allowed;
  }

  .timer-controls button:first-child {
    background-color: #265939;
    color: white;
  }

  .timer-controls button:nth-child(2) {
    background-color: #792e2a;
    color: white;
  }

  .timer-controls button:nth-child(3) {
    background-color: #345d89;
    color: white;
    grid-column: 1 / -1;
    justify-self: center;
  }

  .disable-timer-button {
    background-color: #777777;
    color: white;
    margin-top: 1rem;
  }

  .daily-exercise-tracker.dark-mode .timer-controls button:first-child {
    background-color: #265939;
  }

  .daily-exercise-tracker.dark-mode .timer-controls button:nth-child(2) {
    background-color: #792e2a;
  }

  .daily-exercise-tracker.dark-mode .timer-controls button:nth-child(3) {
    background-color: #345d89;
  }

  .timer-prompt {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 12px;
    margin: 1rem auto;
  }

  .timer-question {
    max-width: 420px;
    margin: 0 auto;
    font-size: 1rem !important;
    line-height: 1.5;
  }

  .timer-toggle {
    position: relative;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: auto;
    height: auto;
    top: auto;
    right: auto;
    gap: 10px;
    cursor: pointer;
    background: transparent;
    box-shadow: none;
    border-radius: 0;
  }

  .timer-toggle input {
    position: absolute;
    width: 1px;
    height: 1px;
    opacity: 0;
    visibility: visible;
  }

  .timer-toggle-slider {
    position: relative;
    width: 42px;
    height: 23px;
    border-radius: 20px;
    background-color: #aaa;
    transition: background-color 0.2s ease;
  }

  .timer-toggle-slider::after {
    content: "";
    position: absolute;
    width: 17px;
    height: 17px;
    top: 3px;
    left: 3px;
    border-radius: 50%;
    background-color: white;
    transition: transform 0.2s ease;
  }

  .timer-toggle input:checked + .timer-toggle-slider {
    background-color: #378653;
  }

  .timer-toggle input:checked + .timer-toggle-slider::after {
    transform: translateX(19px);
  }

  .timer-toggle-text {
    font-size: 0.9rem;
    font-weight: 600;
  }

  .timer-toggle input:focus-visible + .timer-toggle-slider {
    outline: 3px solid #7aa7d8;
    outline-offset: 3px;
  }

  .exercise-breakdown {
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

  .exercise-breakdown h4 {
    margin: 0 0 1.25rem;
    text-align: center;
    font-size: 1.15rem;
  }

  .exercise-breakdown-item {
    margin-bottom: 1rem;
  }

  .exercise-breakdown-heading {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 10px;
    margin-bottom: 7px;
    font-size: 0.95rem;
    font-weight: 600;
  }

  .exercise-breakdown-bar {
    width: 100%;
    height: 9px;
    overflow: hidden;
    border-radius: 10px;
    background-color: #dce5d9;
  }

  .exercise-breakdown-progress {
    height: 100%;
    border-radius: 10px;
    background-color: #529568;
    transition: width 0.3s ease;
  }

  .daily-exercise-tracker.dark-mode .exercise-breakdown {
    background-color: #293a30;
    border-color: #465d4b;
  }

  .daily-exercise-tracker.dark-mode .exercise-breakdown-bar {
    background-color: #435448;
  }

  .daily-exercise-tracker.dark-mode .exercise-breakdown-progress {
    background-color: #77b783;
  }

  .exercise-progress-bar {
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

  .exercise-progress-bar::-webkit-progress-bar {
    background-color: #dce5d9;
    border-radius: 10px;
  }

  .exercise-progress-bar::-webkit-progress-value {
    background-color: #529568;
    border-radius: 10px;
    transition: width 0.3s ease;
  }

  .exercise-progress-bar::-moz-progress-bar {
    background-color: #529568;
    border-radius: 10px;
    transition: width 0.3s ease;
  }

  .daily-exercise-tracker.dark-mode .exercise-progress-bar {
    background-color: #435448;
  }

  .daily-exercise-tracker.dark-mode .exercise-progress-bar::-webkit-progress-bar {
    background-color: #435448;
  }

  .daily-exercise-tracker.dark-mode .exercise-progress-bar::-webkit-progress-value {
    background-color: #77b783;
  }

  .daily-exercise-tracker.dark-mode .exercise-progress-bar::-moz-progress-bar {
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
