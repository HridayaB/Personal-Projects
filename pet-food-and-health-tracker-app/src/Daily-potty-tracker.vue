<script setup lang="ts">
  import { ref, onMounted, onUnmounted } from 'vue'
  import { getPets, type Pet } from './pets'

  interface TrackedPet extends Pet {
    pottyBreaks: string[]
  }

  const trackedPets = ref<TrackedPet[]>([])
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

  const resetLog = (p: TrackedPet) => {
    p.pottyBreaks = []
    localStorage.removeItem(logKeyFor(p.id))
  }
</script>

<template>
  <h2>Daily Potty Tracker</h2>
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
      <router-link to='/daily-exercise-tracker'>Daily Exercise Tracker</router-link>
    </p>
    <p>
      <router-link to='/daily-medicine-tracker'>Daily Medicine Tracker</router-link>
    </p>
    <div v-for="pet in trackedPets" :key="pet.id" class="pet-tracker">
      <p>
        Tracking for <strong>{{ pet.name }}</strong>
        <span v-if="pet.breed"> ({{ pet.breed }})</span> — {{ todayDate }} — {{ currentTime }}
      </p>
      <p>{{ progressOf(pet) }}</p>
      <button :data-test="`log-${pet.id}`" @click="logPottyBreak(pet)">Log Potty Break</button>
      <div v-if="pet.pottyBreaks.length">
        <h3>Today's potty breaks</h3>
        <ul>
          <li v-for="(time, index) in pet.pottyBreaks" :key="`${time}-${index}`">{{ time }} — Potty break</li>
        </ul>
      </div>
      <button :data-test="`reset-${pet.id}`" @click="resetLog(pet)">Reset {{ pet.name }}'s potty break count</button>
    </div>
  </div>
</template>

<style scoped>
</style>
