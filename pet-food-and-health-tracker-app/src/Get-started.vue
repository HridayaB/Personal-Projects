<script setup lang="ts">
import {ref, computed} from 'vue'
import {useRouter} from 'vue-router'

const router = useRouter()
const isOpen = ref(false)
const step = ref<'pet' | 'breed' | 'food' | 'treat'>('pet')
const selectedPet = ref('')
const selectedPetBreed = ref('')
const selectedPetFoodFrequency = ref('')
const selectedPetTreatFrequency = ref('')

const pets = ['Dog', 'Cat', 'Bird', 'Fish', 'Horse', 'Turtle', 'Rabbit', 'Hamster', 'Guinea Pig', 'Snake', 'Other']

const breedLabel = computed(() => selectedPet.value ? `Enter your ${selectedPet.value.toLowerCase()}'s breed` : "Enter your pet's breed")
const foodFrequencyLabel = computed(() => selectedPet.value ? `How many times are you planning to feed your ${selectedPet.value.toLowerCase()} in a single day?` : "How many times are you planning to feed your pet in a single day?")
const treatFrequencyLabel = computed(() => selectedPet.value ? `How many treats are you planning to give your ${selectedPet.value.toLowerCase()} in a single day?` : "How many treats are you planning to give your pet in a single day?")

const openModal = () => {
  step.value = 'pet'
  selectedPet.value = ''
  selectedPetBreed.value = ''
  selectedPetFoodFrequency.value = ''
  selectedPetTreatFrequency.value = ''
  isOpen.value = true
}

const finish = (treatFrequency: string | null) => {
  const safeTreatFrequency = treatFrequency ?? ''
  localStorage.setItem('userPet', selectedPet.value)
  if (selectedPetBreed.value) {
    localStorage.setItem('userPetBreed', selectedPetBreed.value)
  }
  localStorage.setItem('userPetFoodFrequency', selectedPetFoodFrequency.value)
  localStorage.setItem('userPetTreatFrequency', safeTreatFrequency)
  isOpen.value = false
  router.push(`/daily-food-tracker?pet=${encodeURIComponent(selectedPet.value)}`)
}
const submitSelectPet = () => {
  if (!selectedPet.value) return
  step.value = 'breed'
}
const submitPetBreed = () => {
  if (!selectedPetBreed.value) return
  step.value = 'food'
}
const notSure = () => step.value = 'food'
const submitPetFoodFrequency = () => {
  if (!selectedPetFoodFrequency.value) return
  step.value = 'treat'
}
const submitPetTreatFrequency = () => {
  if ( !selectedPetTreatFrequency.value) return
  finish(selectedPetTreatFrequency.value)
}
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
          <option v-for="pet in pets" :key="pet" :value="pet">{{ pet }}</option>
        </select>
        <div class="actions">
          <button :disabled="!selectedPet" @click="submitSelectPet">Submit</button>
          <button @click="isOpen = false">Cancel</button>
        </div>
      </template>
      <template v-else-if="step === 'breed'">
        <h3>{{ breedLabel }}</h3>
        <input type="text" :placeholder="breedLabel" v-model="selectedPetBreed">
        <button @click="notSure">I'm not sure</button>
        <div class="actions">
          <button :disabled="!selectedPetBreed" @click="submitPetBreed">Submit</button>
          <button @click="isOpen = false">Cancel</button>
        </div>
      </template>
      <template v-else-if="step === 'food'">
        <h3>{{ foodFrequencyLabel }}</h3>
        <input type="number" min="0" :placeholder="foodFrequencyLabel" v-model="selectedPetFoodFrequency">
        <p>If you are unsure, then you should either contact your veterinarian or refer to the breed/age/size guidelines for your pet. Here are some sites with some general recommendations.</p>
        <ul>
          <li><a href="https://www.petfoodinstitute.org/feeding-and-treating-tips/" target="_blank" rel="noopener noreferrer">Pet Food Institute</a></li>
          <li><a href="https://wsava.org/global-guidelines/global-nutrition-guidelines/" target="_blank" rel="noopener noreferrer">WSAVA Global Nutrition Guidelines</a></li>
          <li><a href="https://pawsomepet.co/news/diet/how-often-should-you-feed-your-pet" target="_blank" rel="noopener noreferrer">Pawsome Pet</a></li>
        </ul>
        <p>These are general recommendations only, not medical advice. Always consult your veterinarian for personalized guidance.</p>
        <div class="actions">
          <button :disabled="!selectedPetFoodFrequency" @click="submitPetFoodFrequency">Submit</button>
          <button @click="isOpen = false">Cancel</button>
        </div>
      </template>
      <template v-else-if="step === 'treat'">
        <h3>{{ treatFrequencyLabel }}</h3>
        <input type="number" min="0" :placeholder="treatFrequencyLabel" v-model="selectedPetTreatFrequency">
        <p>If you are unsure, then you should either contact your veterinarian or refer to the breed/age/size guidelines for your pet. Here are some sites with some general recommendations.</p>
        <ul>
          <li><a href="https://www.petfoodinstitute.org/feeding-and-treating-tips/" target="_blank" rel="noopener noreferrer">Pet Food Institute</a></li>
          <li><a href="https://wsava.org/global-guidelines/global-nutrition-guidelines/" target="_blank" rel="noopener noreferrer">WSAVA Global Nutrition Guidelines</a></li>
          <li><a href="https://www.aaha.org/resources/5-ways-to-know-how-much-to-feed-your-pet/" target="_blank" rel="noopener noreferrer">AAHA</a></li>
        </ul>
        <p>These are general recommendations only, not medical advice. Always consult your veterinarian for personalized guidance.</p>
        <div class="actions">
          <button :disabled="!selectedPetTreatFrequency" @click="submitPetTreatFrequency">Submit</button>
          <button @click="isOpen = false">Cancel</button>
        </div>
      </template>
    </div>
  </div>
</template>

<style scoped>
</style>
