<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'

const pet = ref('')
const petBreed = ref('')
const petFoodFrequency = ref('')
const todayFeedCount = ref(0)
const hasSetupPetInfo = ref(true)

const todayDate = new Date().toLocaleDateString('en-CA')
const logKey = computed(() => `foodLog:${todayDate}`)

const limit = computed(() => Number(petFoodFrequency.value) || 0)
const remaining = computed(() => Math.max(limit.value - todayFeedCount.value, 0))
const progressLabel = computed(() => (limit.value ? `${todayFeedCount.value} of ${limit.value} feedings given today.` : 'No feeding limit set.'))

onMounted(() => {
  pet.value = localStorage.getItem('userPet') ?? ''
  petBreed.value = localStorage.getItem('userPetBreed') ?? ''
  petFoodFrequency.value = localStorage.getItem('userPetFoodFrequency') ?? ''
  hasSetupPetInfo.value = Boolean(pet.value && petFoodFrequency.value)
  const saved = localStorage.getItem(logKey.value)
  todayFeedCount.value = saved ? Number(saved) : 0
})

const logFeeding = () => {
  if (!hasSetupPetInfo.value) return
  if (limit.value && todayFeedCount.value >= limit.value) return
  todayFeedCount.value += 1
  localStorage.setItem(logKey.value, String(todayFeedCount.value))
}
const resetLog = () => {
  todayFeedCount.value = 0
  localStorage.removeItem(logKey.value)
}
</script>

<template>
  <h2>Daily Food Tracker</h2>
  <div v-if="!hasSetupPetInfo" class="setup-prompt">
    <p>It looks like you haven't set up your pet's information yet. <router-link to="/get-started">You can get started here.</router-link></p>
  </div>
  <div v-else>
    <p>Tracking for <strong>{{ pet }}</strong> <span v-if="petBreed"> ({{ petBreed }})</span> - {{ todayDate }}</p>
    <p>{{ progressLabel }}</p>
    <p v-if="limit">Remaining feedings for the day: {{ remaining }}</p>
    <button @click="logFeeding" :disabled="remaining === 0">Log feeding</button>
    <button @click="resetLog">Reset feed count</button>
  </div>
</template>

<style scoped>
</style>
