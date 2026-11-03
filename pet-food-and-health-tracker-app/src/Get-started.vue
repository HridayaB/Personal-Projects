<script setup lang="ts">
import {ref, computed} from 'vue'
import {useRouter} from 'vue-router'

const router = useRouter()
const isOpen = ref(false)
const step = ref<'pet' | 'breed'>('pet')
const selectedPet = ref('')
const selectedPetBreed = ref('')

const pets = ['Dog', 'Cat', 'Bird', 'Fish', 'Horse', 'Turtle', 'Rabbit', 'Hamster', 'Guinea Pig', 'Snake', 'Other']

const breedLabel = computed(() => selectedPet.value ? `Enter your ${selectedPet.value.toLowerCase()}'s breed` : "Enter your pet's breed")

const openModal = () => {
  step.value = 'pet'
  selectedPet.value = ''
  selectedPetBreed.value = ''
  isOpen.value = true
}

const finish = (breed: string | null) => {
  localStorage.setItem('userPet', selectedPet.value)
  if (breed) localStorage.setItem('userPetBreed', breed)
  isOpen.value = false
  router.push(`/daily-food-tracker?pet=${encodeURIComponent(selectedPet.value)}`)
}
const submitSelectPet = () => {
  if (!selectedPet.value) return
  step.value = 'breed'
}
const submitPetBreed = () => {
  if (!selectedPetBreed.value) return
  finish(selectedPetBreed.value)
}
const notSure = () => finish(null)
</script>

<template>
  <h2>Get Started</h2>
  <button @click="openModal">Choose your pet</button>
  <div v-if="isOpen" class="modal-overlay" @click.self="isOpen = false">
    <div class="modal-content">
      <template v-if="step === 'pet'">
        <h3>What type of pet do you have?</h3>
        <select v-model="selectedPet">
          <option value="" disabled>Select your pet</option>
          <option v-for="pet in pets" :key="pet" :value="pet">{{pet}}</option>
        </select>
        <div class="actions">
          <button :disabled="!selectedPet" @click="submitSelectPet">Submit</button>
          <button @click="isOpen = false">Cancel</button>
        </div>
      </template>
      <template v-else>
        <h3>{{ breedLabel }}</h3>
        <input type="text" :placeholder="breedLabel" v-model="selectedPetBreed">
        <button @click="notSure">I'm not sure</button>
        <div class="actions">
          <button :disabled="!selectedPetBreed" @click="submitPetBreed">Submit</button>
          <button @click="isOpen = false">Cancel</button>
        </div>
      </template>
    </div>
  </div>
</template>

<style scoped>
</style>
