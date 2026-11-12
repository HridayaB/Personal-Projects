<script setup lang="ts">
  import { ref, onMounted, onUnmounted } from 'vue'
  import { getPets, type Pet } from './pets'

  interface TrackedPet extends Pet {
    exerciseCount: number
    exerciseDuration: number
    exerciseTypes: number
    exerciseLabels: string[]
  }

  const trackedPets = ref<TrackedPet[]>([])
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
      }
    })
    trackedPets.value.forEach(pet => {
      timerSeconds.value[pet.id] = pet.exerciseDuration * 60
    })
  })

  onUnmounted(() => {
    Object.values(timerIntervals).forEach(interval => {
      clearInterval(interval)
    })
  })


  const limitOf = (p: TrackedPet) => Number((p as TrackedPet & { exerciseFrequency?: number | string }).exerciseFrequency) || 0
  const remainingOf = (p: TrackedPet) => Math.max(0, limitOf(p) - p.exerciseCount)
  const progressOf = (p: TrackedPet) => limitOf(p) ? `${p.exerciseCount} of ${limitOf(p)} exercise sessions done today.` : 'No exercise goal set.'

  const logExercise = (p: TrackedPet) => {
    if(limitOf(p) && p.exerciseCount >= limitOf(p)) return
    p.exerciseCount += 1
    localStorage.setItem(logKeyFor(p.id), String(p.exerciseCount))
  }

  const resetLog = (p: TrackedPet) => {
    p.exerciseCount = 0
    localStorage.removeItem(logKeyFor(p.id))
  }

  const timerSeconds = ref<Record<string, number>>({})
  const timerRunning = ref<Record<string, boolean>>({})
  const timerIntervals: Record<string, ReturnType<typeof setInterval>> = {}

  const formatTimer = (seconds: number) => {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${String(minutes).padStart(2, '0')}:${String(remainingSeconds).padStart(2, '0')}`
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
    timerSeconds.value[p.id] = p.exerciseDuration * 60
  }

  const selectedLabels = ref<Record<string, string>>({})
  const selectLabel = (pet: TrackedPet, label: string) => {
    selectedLabels.value[pet.id] = selectedLabels.value[pet.id] === label ? '' : label
  }
</script>

<template>
  <h2>Daily Exercise Tracker</h2>
  <div v-if="trackedPets.length === 0" class="setup-prompt">
    <p>
      It looks like you haven't set up your pet's information yet. <router-link to="/get-started">You can get started here.</router-link>
    </p>
  </div>

  <div v-else>
    <p>
      <router-link to="/">Home</router-link>
    </p>
    <p>
      <router-link to="/get-started">Get Started</router-link>
    </p>
    <p>
      <router-link to='/daily-food-tracker'>Daily Food Tracker</router-link>
    </p>
    <p>
      <router-link to='/daily-treat-tracker'>Daily Treat Tracker</router-link>
    </p>
    <p>
      <router-link to='/daily-medicine-tracker'>Daily Medicine Tracker</router-link>
    </p>
    <p>
      <router-link to='/daily-potty-tracker'>Daily Potty Tracker</router-link>
    </p>
    <div v-for="pet in trackedPets" :key="pet.id" class="pet-tracker">
      <p>
        Tracking for <strong>{{ pet.name }}</strong>
        <span v-if="pet.breed"> ({{ pet.breed }})</span> — {{ todayDate }}
      </p>
      <p>{{ progressOf(pet) }}</p>
      <p v-if="limitOf(pet)">Remaining exercises for the day: {{ remainingOf(pet) }}</p>
      <button :disabled="remainingOf(pet) === 0" :data-test="`log-${pet.id}`" @click="logExercise(pet)">Log exercise</button>
      <div v-if="pet.exerciseLabels.length">
        <button v-for="label in pet.exerciseLabels" :key="label" :data-test="`exercise-label-${pet.id}-${label}`" :class="{ selected: selectedLabels[pet.id] === label }" @click="selectLabel(pet, label)">{{ label }}</button>
      </div>
      <button :data-test="`reset-${pet.id}`" @click="resetLog(pet)">Reset {{ pet.name }}'s exercise count</button>

      <div>
        <p>Would you like to set a timer for the exercise duration of {{ pet.exerciseDuration }} minutes as your pet exercises?</p>
        <input type="checkbox" :data-test="`timer-checkbox-${pet.id}`">
        <p :data-test="`timer-${pet.id}`">{{ formatTimer(timerSeconds[pet.id] ?? pet.exerciseDuration * 60) }}</p>
        <button :data-test="`start-timer-${pet.id}`" @click="startTimer(pet)">Start Timer</button>
        <button :data-test="`stop-timer-${pet.id}`" @click="stopTimer(pet)">Stop Timer</button>
        <button :data-test="`reset-timer-${pet.id}`" @click="resetTimer(pet)">Reset Timer</button>
      </div>
    </div>
  </div>
</template>

<style scoped>
</style>
