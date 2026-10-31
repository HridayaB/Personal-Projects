<script setup lang="ts">
import {ref} from 'vue'
import {useRouter} from 'vue-router'

const router = useRouter()
const isOpen = ref(false)
const selectedPet = ref('')

const pets = ['Dog', 'Cat', 'Bird', 'Fish', 'Horse', 'Turtle', 'Rabbit', 'Hamster', 'Guinea Pig', 'Snake', 'Other']
const submit = () => {
  if (!selectedPet.value) return
  localStorage.setItem('userPet', selectedPet.value)
  isOpen.value = false
  router.push(`/daily-food-tracker?pet=${encodeURIComponent(selectedPet.value)}`)
}
</script>

<template>
  <h2>Get Started</h2>
  <button @click="isOpen = true">Choose your pet</button>
  <div v-if="isOpen" class="modal-overlay" @click.self="isOpen = false">
    <div class="modal-content">
      <h3>What type of pet do you have?</h3>
      <select v-model="selectedPet">
        <option value="" disabled>Select your pet</option>
        <option v-for="pet in pets" :key="pet" :value="pet">{{pet}}</option>
      </select>
      <div class="actions">
        <button :disabled="!selectedPet" @click="submit">Submit</button>
        <button @click="isOpen = false">Cancel</button>
      </div>
    </div>
  </div>

  <p>
    <a href="https://hridayab.github.io/Personal-Projects/daily-food-tracker/" target="_blank" rel="noopener">Daily Food Tracker</a>
  </p>
  <p>
    <a href="https://hridayab.github.io/Personal-Projects/daily-treats-tracker/" target="_blank" rel="noopener">Daily Treats Tracker</a>
  </p>
</template>

<style scoped>
</style>
