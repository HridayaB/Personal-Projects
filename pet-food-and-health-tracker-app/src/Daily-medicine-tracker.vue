<script setup lang="ts">
  import { ref, onMounted } from 'vue'
  import { getPets, type Pet } from './pets'

  interface TrackedPet extends Pet {
    medicineCount: number
    medicineIntake: string
    medicineTypes: number
    medicineLabels: string[]
  }

  const trackedPets = ref<TrackedPet[]>([])
  const todayDate = new Date().toLocaleDateString('en-US')

  const logKeyFor = (petId: string) => `medicineLog:${petId}:${todayDate}`

  onMounted(() => {
    trackedPets.value = getPets().map(pet => {
      const saved = localStorage.getItem(logKeyFor(pet.id))
      const rawLabels = (pet as Pet & { medicineLabels?: string | string[] }).medicineLabels
      const medicineLabels = Array.isArray(rawLabels) ? rawLabels : rawLabels ? rawLabels.split(',').map(label => label.trim()).filter(label => label.length > 0) : []
      return {
        ...pet,
        medicineCount: saved ? Number(saved) : 0,
        medicineIntake: saved ? 'Yes' : 'No',
        medicineTypes: Number((pet as Pet & { medicineTypes?: number | string }).medicineTypes ?? 0),
        medicineLabels,
      }
    })
  })

  const limitOf = (p: TrackedPet) => Number((p as TrackedPet & { medicineFrequency?: number | string }).medicineFrequency) || 0
  const remainingOf = (p: TrackedPet) => Math.max(0, limitOf(p) - p.medicineCount)
  const progressOf = (p: TrackedPet) => limitOf(p) ? `${p.medicineCount} of ${limitOf(p)} medicine doses given today.` : 'No medicine goal set.'

  const logMedicine = (p: TrackedPet) => {
    if(limitOf(p) && p.medicineCount >= limitOf(p)) return
    p.medicineCount += 1
    localStorage.setItem(logKeyFor(p.id), String(p.medicineCount))
  }

  const resetLog = (p: TrackedPet) => {
    p.medicineCount = 0
    localStorage.removeItem(logKeyFor(p.id))
  }

  const selectedLabels = ref<Record<string, string>>({})
  const selectLabel = (pet: TrackedPet, label: string) => {
    selectedLabels.value[pet.id] = selectedLabels.value[pet.id] === label ? '' : label
  }
</script>

<template>
  <h2>Daily Medicine Tracker</h2>
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
      <p v-if="limitOf(pet)">Remaining medicine doses for the day: {{ remainingOf(pet) }}</p>
      <button :disabled="remainingOf(pet) === 0" :data-test="`log-${pet.id}`" @click="logMedicine(pet)">Log medicine dose</button>
      <div v-if="pet.medicineLabels.length">
        <button v-for="label in pet.medicineLabels" :key="label" :data-test="`medicine-label-${pet.id}-${label}`" :class="{ selected: selectedLabels[pet.id] === label }" @click="selectLabel(pet, label)">{{ label }}</button>
      </div>
      <button :data-test="`reset-${pet.id}`" @click="resetLog(pet)">Reset {{ pet.name }}'s medicine count</button>
    </div>
  </div>
</template>

<style scoped>
</style>
