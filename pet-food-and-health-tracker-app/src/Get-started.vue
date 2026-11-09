<script setup lang="ts">
  import {ref, computed} from 'vue'
  import {useRouter} from 'vue-router'
  import { addPet } from './pets'

  const router = useRouter()
  const isOpen = ref(false)
  const step = ref<'numPets' | 'pet' | 'name' | 'weight' | 'breed' | 'food' | 'treat'>('pet')
  const numPets = ref('')
  const selectedPet = ref('')
  const selectedPetName = ref('')
  const selectedPetWeight = ref('')
  const selectedPetBreed = ref('')
  const selectedPetFoodFrequency = ref('')
  const selectedPetTreatFrequency = ref('')
  const petsToAdd = ref<Array<{
    type: string
    name: string
    weight: string
    breed: string
    foodFrequency: string
    treatFrequency: string
  }>>([])

  const pets = ['Dog', 'Cat', 'Bird', 'Fish', 'Horse', 'Turtle', 'Rabbit', 'Hamster', 'Guinea Pig', 'Snake', 'Other']

  const breedLabel = computed(() => selectedPet.value ? `Enter your ${selectedPet.value.toLowerCase()}'s breed` : "Enter your pet's breed")
  const petNameLabel = computed(() => selectedPet.value ? `What is your ${selectedPet.value.toLowerCase()}'s name?` : "What is your pet's name?")
  const petWeightLabel = computed(() => selectedPet.value ? `What is your ${selectedPet.value.toLowerCase()}'s weight?` : "What is your pet's weight?")
  const foodFrequencyLabel = computed(() => selectedPet.value ? `How many times are you planning to feed your ${selectedPet.value.toLowerCase()} in a single day?` : "How many times are you planning to feed your pet in a single day?")
  const treatFrequencyLabel = computed(() => selectedPet.value ? `How many treats are you planning to give your ${selectedPet.value.toLowerCase()} in a single day?` : "How many treats are you planning to give your pet in a single day?")

  const resetPetForm = () => {
    selectedPet.value = ''
    selectedPetName.value = ''
    selectedPetWeight.value = ''
    selectedPetBreed.value = ''
    selectedPetFoodFrequency.value = ''
    selectedPetTreatFrequency.value = ''
  }

  const openModal = () => {
    step.value = 'numPets'
    numPets.value = ''
    petsToAdd.value = []
    resetPetForm()
    isOpen.value = true
  }

  const finish = () => {
    petsToAdd.value.forEach((pet) => addPet(pet))
    isOpen.value = false
    router.push('/daily-food-tracker')
  }

  const submitNumPets = () => {
    if (!numPets.value) return
    step.value = 'pet'
  }
  const submitSelectPet = () => {
    if (!selectedPet.value) return
    step.value = 'name'
  }
  const submitPetName = () => {
    if (!selectedPetName.value) return
    step.value = 'weight'
  }
  const submitPetWeight = () => {
    if (!selectedPetWeight.value) return
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
    if (!selectedPetTreatFrequency.value) return
    petsToAdd.value.push({
      type: selectedPet.value,
      name: selectedPetName.value,
      weight: selectedPetWeight.value,
      breed: selectedPetBreed.value,
      foodFrequency: selectedPetFoodFrequency.value,
      treatFrequency: selectedPetTreatFrequency.value,
    })
    if (petsToAdd.value.length >= Number(numPets.value)) {
      finish()
      return
    }
    resetPetForm()
    step.value = 'pet'
  }
</script>

<template>
  <h2>Get Started</h2>
  <button @click="openModal">Choose your pet</button>
  <div v-if="isOpen" class="modal-overlay" @click.self="isOpen = false">
    <div class="modal-content">
      <template v-if="step === 'numPets'">
        <h3>How many pets do you wish to register?</h3>
        <input type="number" placeholder="Enter your pet number here" v-model="numPets">
        <div class="actions">
          <button :disabled="!numPets" @click="submitNumPets">Submit</button>
          <button @click="isOpen = false">Cancel</button>
        </div>
      </template>
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
      <template v-else-if="step === 'name'">
        <h3>{{ petNameLabel }}</h3>
        <input type="text" placeholder="Enter your pet's name" v-model="selectedPetName">
        <div class="actions">
          <button :disabled="!selectedPetName" @click="submitPetName">Submit</button>
          <button @click="isOpen = false">Cancel</button>
        </div>
      </template>
      <template v-else-if="step === 'weight'">
        <h3>{{ petWeightLabel }}</h3>
        <input type="number" placeholder="Enter in pounds(lbs)" v-model="selectedPetWeight">
        <div class="actions">
          <button :disabled="!selectedPetWeight" @click="submitPetWeight">Submit</button>
          <button @click="isOpen = false">Cancel</button>
        </div>
      </template>
      <template v-else-if="step === 'breed'">
        <h3>{{ breedLabel }}</h3>
        <input type="text" placeholder="Enter your pet's breed" v-model="selectedPetBreed">
        <button @click="notSure">I'm not sure</button>
        <div class="actions">
          <button :disabled="!selectedPetBreed" @click="submitPetBreed">Submit</button>
          <button @click="isOpen = false">Cancel</button>
        </div>
      </template>
      <template v-else-if="step === 'food'">
        <h3>{{ foodFrequencyLabel }}</h3>
        <input type="number" min="0" v-model="selectedPetFoodFrequency">
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
        <input type="number" min="0" v-model="selectedPetTreatFrequency">
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
