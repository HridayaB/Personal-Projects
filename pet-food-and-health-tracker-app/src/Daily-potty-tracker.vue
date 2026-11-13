<script setup lang="ts">
  import { ref, onMounted, onUnmounted } from 'vue'
  import { getPets, deletePet, type Pet } from './pets'

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
</template>

<style scoped>
</style>
