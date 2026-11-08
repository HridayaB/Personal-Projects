<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { getPets, type Pet } from './pets'

interface TrackedPet extends Pet {
  feedCount: number
}

const trackedPets = ref<TrackedPet[]>([])
const todayDate = new Date().toLocaleDateString('en-CA')

const logKeyFor = (petId: string) => `foodLog:${petId}:${todayDate}`

onMounted(() => {
  trackedPets.value = getPets().map(pet => {
    const saved = localStorage.getItem(logKeyFor(pet.id))
    return { ...pet, feedCount: saved ? Number(saved) : 0 }
  })
})

const limitOf = (p: TrackedPet) => Number(p.foodFrequency) || 0
const remainingOf = (p: TrackedPet) => Math.max(limitOf(p) - p.feedCount, 0)
const progressOf = (p: TrackedPet) => limitOf(p) ? `${p.feedCount} of ${limitOf(p)} feedings given today.` : 'No feeding limit set.'

const logFeeding = (p: TrackedPet) => {
  if (limitOf(p) && p.feedCount >= limitOf(p)) return
  p.feedCount += 1
  localStorage.setItem(logKeyFor(p.id), String(p.feedCount))
}

const resetLog = (p: TrackedPet) => {
  p.feedCount = 0
  localStorage.removeItem(logKeyFor(p.id))
}
</script>

<template>
  <h2>Daily Food Tracker</h2>
  <div v-if="trackedPets.length === 0" class="setup-prompt">
    <p>
      It looks like you haven't set up your pet's information yet. <router-link to="/get-started">You can get started here.</router-link>
    </p>
  </div>

  <div v-else>
    <div v-for="pet in trackedPets" :key="pet.id" class="pet-tracker">
      <p>
        Tracking for <strong>{{ pet.name }}</strong>
        <span v-if="pet.breed"> ({{ pet.breed }})</span> — {{ todayDate }}
      </p>
      <p>{{ progressOf(pet) }}</p>
      <p v-if="limitOf(pet)">Remaining feedings for the day: {{ remainingOf(pet) }}</p>
      <button :disabled="remainingOf(pet) === 0" :data-test="`log-${pet.id}`" @click="logFeeding(pet)">Log feeding for {{ pet.name }}</button>
      <button :data-test="`reset-${pet.id}`" @click="resetLog(pet)">Reset {{ pet.name }}'s feed count</button>
    </div>
  </div>
</template>

<style scoped>
</style>
