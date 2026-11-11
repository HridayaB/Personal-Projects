<script setup lang="ts">
  import { ref, onMounted } from 'vue'
  import { getPets, type Pet } from './pets'

  interface TrackedPet extends Pet {
    treatCount: number
  }

  const trackedPets = ref<TrackedPet[]>([])
  const todayDate = new Date().toLocaleDateString('en-US')

  const logKeyFor = (petId: string) => `treatLog:${petId}:${todayDate}`

  onMounted(() => {
    trackedPets.value = getPets().map(pet => {
      const saved = localStorage.getItem(logKeyFor(pet.id))
      return { ...pet, treatCount: saved ? Number(saved) : 0 }
    })
  })

  const limitOf = (p: TrackedPet) => Number(p.treatFrequency) || 0
  const remainingOf = (p: TrackedPet) => Math.max(limitOf(p) - p.treatCount, 0)
  const progressOf = (p: TrackedPet) => limitOf(p) ? `${p.treatCount} of ${limitOf(p)} treats given today.` : 'No treat limit set.'

  const logTreat = (p: TrackedPet) => {
    if (limitOf(p) && p.treatCount >= limitOf(p)) return
    p.treatCount += 1
    localStorage.setItem(logKeyFor(p.id), String(p.treatCount))
  }

  const resetLog = (p: TrackedPet) => {
    p.treatCount = 0
    localStorage.removeItem(logKeyFor(p.id))
  }
</script>

<template>
  <h2>Daily Treat Tracker</h2>
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
      <p v-if="limitOf(pet)">Remaining treats for the day: {{ remainingOf(pet)}}</p>
      <button :disabled="remainingOf(pet) === 0" :data-test="`log-${pet.id}`" @click="logTreat(pet)">Log treat</button>
      <button :data-test="`reset-${pet.id}`" @click="resetLog(pet)">Reset {{ pet.name }}'s treat count</button>
    </div>
  </div>
</template>

<style scoped>
</style>
