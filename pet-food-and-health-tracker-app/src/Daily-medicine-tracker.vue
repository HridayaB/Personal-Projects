<script setup lang="ts">
  import { ref, onMounted } from 'vue'
  import { getPets, deletePet, type Pet } from './pets'
  import { isDarkMode } from './darkMode'
  import Icons from './Icons.vue'

  interface TrackedPet extends Pet {
    medicineCount: number
    medicineIntake: string
    medicineTypes: number
    medicineLabels: string[]
  }

  const trackedPets = ref<TrackedPet[]>([])
  const showRemovePetPopup = ref(false)
  const petToRemove = ref<TrackedPet | null>(null)
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

  const removeLog = (p: TrackedPet) => {
    if (p.medicineCount === 0) return
    p.medicineCount -= 1
    localStorage.setItem(logKeyFor(p.id), String(p.medicineCount))
  }

  const resetLog = (p: TrackedPet) => {
    p.medicineCount = 0
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

  const selectedLabels = ref<Record<string, string>>({})
  const selectLabel = (pet: TrackedPet, label: string) => {
    selectedLabels.value[pet.id] = selectedLabels.value[pet.id] === label ? '' : label
  }
</script>

<template>
  <main class="daily-medicine-tracker" :class="{ 'dark-mode': isDarkMode }">
    <h2>Daily Medicine Tracker</h2>
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
        <router-link to='/daily-potty-tracker'>Daily Potty Tracker</router-link>
      </p>
      <div v-for="pet in trackedPets" :key="pet.id" class="pet-tracker">
        <p>
          Tracking for <strong>{{ pet.name }}</strong>
          <span v-if="pet.breed"> ({{ pet.breed }})</span> — {{ todayDate }}
        </p>
        <p>{{ progressOf(pet) }}</p>
        <p v-if="limitOf(pet)">Remaining medicine doses for the day: {{ remainingOf(pet) }}</p>
        <button :disabled="remainingOf(pet) === 0" :data-test="`log-${pet.id}`" @click="logMedicine(pet)">Log medicine dose</button>
        <button :disabled="pet.medicineCount === 0" :data-test="`remove-log-${pet.id}`" @click="removeLog(pet)">Remove medicine dose</button>
        <div v-if="pet.medicineLabels.length">
          <button v-for="label in pet.medicineLabels" :key="label" :data-test="`medicine-label-${pet.id}-${label}`" :class="{ selected: selectedLabels[pet.id] === label }" @click="selectLabel(pet, label)">{{ label }}</button>
        </div>
        <button :data-test="`reset-${pet.id}`" @click="resetLog(pet)">Reset {{ pet.name }}'s medicine count</button>
        <button :data-test="`remove-pet-${pet.id}`" @click="askRemovePet(pet)">Remove pet</button>
      </div>
    </div>

    <div v-if="showRemovePetPopup" class="remove-pet-overlay">
      <div class="remove-pet-popup">
        <p>Would you like to remove {{ petToRemove?.name }} from all trackers or only this Daily Medicine Tracker?</p>
        <button @click="removeFromThisTracker">Remove from this tracker</button>
        <button @click="removeFromAllTrackers">Remove from all trackers</button>
        <button @click="cancelRemovePet">Cancel</button>
      </div>
    </div>
  </main>
</template>

<style scoped>
  .daily-medicine-tracker {
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

  .daily-medicine-tracker.dark-mode {
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
    height: 120px;
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
