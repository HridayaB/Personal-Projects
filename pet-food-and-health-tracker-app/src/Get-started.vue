<script setup lang="ts">
  import {ref, computed} from 'vue'
  import {useRouter} from 'vue-router'
  import { addPet } from './pets'

  const router = useRouter()
  const isOpen = ref(false)
  const step = ref<'numPets' | 'pet' | 'name' | 'weight' | 'breed' | 'food' | 'treat' | 'exercise' | 'exerciseDuration' | 'exerciseTypes' | 'exerciseLabels' | 'medicine' | 'medicineFrequency' | 'medicineTypes' | 'medicineLabels'>('pet')
  const numPets = ref('')
  const selectedPet = ref('')
  const selectedPetName = ref('')
  const selectedPetWeight = ref('')
  const selectedPetBreed = ref('')
  const selectedPetFoodFrequency = ref('')
  const selectedPetTreatFrequency = ref('')
  const selectedPetExerciseFrequency = ref('')
  const selectedPetExerciseDuration = ref('')
  const selectedPetExerciseTypes = ref('')
  const selectedPetExerciseLabelsChoice = ref('')
  const selectedPetExerciseLabels = ref<string[]>([])
  const selectedPetMedicineFrequency = ref('')
  const selectedPetMedicineIntake = ref('')
  const selectedPetMedicineTypes = ref('')
  const selectedPetMedicineLabelsChoice = ref('')
  const selectedPetMedicineLabels = ref<string[]>([])

  const petsToAdd = ref<Array<{
    type: string
    name: string
    weight: string
    breed: string
    foodFrequency: string
    treatFrequency: string
    exerciseFrequency: string
    exerciseDuration: string
    exerciseTypes: string
    exerciseLabels: string
    medicineFrequency: string
    medicineIntake: string
    medicineTypes: string
    medicineLabels: string
  }>>([])

  const pets = ['Dog', 'Cat', 'Bird', 'Fish', 'Horse', 'Turtle', 'Rabbit', 'Hamster', 'Guinea Pig', 'Snake', 'Other']

  const breedLabel = computed(() => selectedPet.value ? `Enter your ${selectedPet.value.toLowerCase()}'s breed` : "Enter your pet's breed")
  const petNameLabel = computed(() => selectedPet.value ? `What is your ${selectedPet.value.toLowerCase()}'s name?` : "What is your pet's name?")
  const petWeightLabel = computed(() => selectedPet.value ? `What is your ${selectedPet.value.toLowerCase()}'s weight?` : "What is your pet's weight?")
  const foodFrequencyLabel = computed(() => selectedPet.value ? `How many times are you planning to feed your ${selectedPet.value.toLowerCase()} in a single day?` : "How many times are you planning to feed your pet in a single day?")
  const treatFrequencyLabel = computed(() => selectedPet.value ? `How many treats are you planning to give your ${selectedPet.value.toLowerCase()} in a single day?` : "How many treats are you planning to give your pet in a single day?")
  const exerciseFrequencyLabel = computed(() => selectedPet.value ? `How many times does your ${selectedPet.value.toLowerCase()} exercise in a single day?` : "How many times does your pet exercise in a single day?")
  const medicineFrequencyLabel = computed(() => selectedPet.value ? `How many times does your ${selectedPet.value.toLowerCase()} take medicine in a single day?` : "How many times does your pet take medicine in a single day?")


  const resetPetForm = () => {
    selectedPet.value = ''
    selectedPetName.value = ''
    selectedPetWeight.value = ''
    selectedPetBreed.value = ''
    selectedPetFoodFrequency.value = ''
    selectedPetTreatFrequency.value = ''
    selectedPetExerciseFrequency.value = ''
    selectedPetExerciseDuration.value = ''
    selectedPetExerciseTypes.value = ''
    selectedPetExerciseLabelsChoice.value = ''
    selectedPetExerciseLabels.value = []
    selectedPetMedicineFrequency.value = ''
    selectedPetMedicineIntake.value = ''
    selectedPetMedicineTypes.value = ''
    selectedPetMedicineLabelsChoice.value = ''
    selectedPetMedicineLabels.value = []
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
    step.value = 'exercise'
  }
  const submitPetExerciseFrequency = () => {
    if (!selectedPetExerciseFrequency.value) return
    step.value = Number(selectedPetExerciseFrequency.value) > 0 ? 'exerciseDuration' : 'medicine'
  }
  const submitPetExerciseDuration = () => {
    if (!selectedPetExerciseDuration.value) return
    step.value = 'exerciseTypes'
  }
  const submitPetExerciseTypes = () => {
    if (!selectedPetExerciseTypes.value) return
    step.value = Number(selectedPetExerciseTypes.value) > 0 ? 'exerciseLabels' : 'medicine'
  }
  const submitPetExerciseLabels = () => {
    if (!selectedPetExerciseLabelsChoice.value) return
    step.value = 'medicine'
  }
  const submitPetMedicineIntake = () => {
    if (!selectedPetMedicineIntake.value) return
    if (selectedPetMedicineIntake.value.toLowerCase() === 'no') {
      savePet()
      return
    }
    else step.value = 'medicineFrequency'
  }
  const submitPetMedicineFrequency = () => {
    if (!selectedPetMedicineFrequency.value) return
    step.value = 'medicineTypes'
  }
  const submitPetMedicineTypes = () => {
    if (!selectedPetMedicineTypes.value) return
    step.value = 'medicineLabels'
  }
  const submitPetMedicineLabels = () => {
    if (!selectedPetMedicineLabelsChoice.value) return
    savePet()
  }
  const savePet = () => {
    petsToAdd.value.push({
      type: selectedPet.value,
      name: selectedPetName.value,
      weight: selectedPetWeight.value,
      breed: selectedPetBreed.value,
      foodFrequency: selectedPetFoodFrequency.value,
      treatFrequency: selectedPetTreatFrequency.value,
      exerciseFrequency: selectedPetExerciseFrequency.value,
      exerciseDuration: selectedPetExerciseDuration.value,
      exerciseTypes: selectedPetExerciseTypes.value,
      exerciseLabels: selectedPetExerciseLabels.value.join(','),
      medicineFrequency: selectedPetMedicineFrequency.value,
      medicineIntake: selectedPetMedicineIntake.value,
      medicineTypes: selectedPetMedicineTypes.value,
      medicineLabels: selectedPetMedicineLabels.value.join(','),
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
      <template v-else-if="step === 'exercise'">
        <h3>{{ exerciseFrequencyLabel }}</h3>
        <input type="number" min="0" v-model="selectedPetExerciseFrequency">
        <div class="actions">
          <button :disabled="!selectedPetExerciseFrequency" @click="submitPetExerciseFrequency">Submit</button>
          <button @click="isOpen = false">Cancel</button>
        </div>
      </template>
      <template v-else-if="step === 'exerciseDuration'">
        <h3>How long does your {{ selectedPet.toLowerCase() }} exercise each session?</h3>
        <input type="number" min="0" v-model="selectedPetExerciseDuration" placeholder="Enter in minutes">
        <div class="actions">
          <button :disabled="!selectedPetExerciseDuration" @click="submitPetExerciseDuration">Submit</button>
          <button @click="isOpen = false">Cancel</button>
        </div>
      </template>
      <template v-else-if="step === 'exerciseTypes'">
        <h3>How many types of exercise does your {{ selectedPet.toLowerCase() }} do?</h3>
        <input type="number" min="0" v-model="selectedPetExerciseTypes">
        <div class="actions">
          <button :disabled="!selectedPetExerciseTypes" @click="submitPetExerciseTypes">Submit</button>
          <button @click="isOpen = false">Cancel</button>
        </div>
      </template>
      <template v-else-if="step === 'exerciseLabels'">
        <h3>Would you like to label the exercises?</h3>
        <input type="text" placeholder="Enter yes or no" v-model="selectedPetExerciseLabelsChoice">
        <div v-if="selectedPetExerciseLabelsChoice.toLowerCase() === 'yes'">
          <h3>Label the different types of exercises here</h3>
          <input v-for="exerciseType in Number(selectedPetExerciseTypes)" :key="exerciseType" v-model="selectedPetExerciseLabels[exerciseType - 1]" type="text" :placeholder="`Exercise ${exerciseType}`">
        </div>
        <div class="actions">
          <button :disabled="!selectedPetExerciseLabelsChoice" @click="submitPetExerciseLabels">Submit</button>
          <button @click="isOpen = false">Cancel</button>
        </div>
      </template>
      <template v-else-if="step === 'medicine'">
        <h3>Does your {{ selectedPet.toLowerCase() }} take any medicine?</h3>
        <input type="text" placeholder="Enter yes or no" v-model="selectedPetMedicineIntake">
        <div class="actions">
          <button :disabled="!selectedPetMedicineIntake" @click="submitPetMedicineIntake">Submit</button>
          <button @click="isOpen = false">Cancel</button>
        </div>
      </template>
      <template v-else-if="step === 'medicineFrequency'">
        <h3>{{ medicineFrequencyLabel }}</h3>
        <input type="number" min="1" v-model="selectedPetMedicineFrequency">
        <div class="actions">
          <button :disabled="!selectedPetMedicineFrequency" @click="submitPetMedicineFrequency">Submit</button>
          <button @click="isOpen = false">Cancel</button>
        </div>
      </template>
      <template v-else-if="step === 'medicineTypes'">
        <h3>How many types of medicines does your {{ selectedPet.toLowerCase() }} take?</h3>
        <input type="number" min="1" v-model="selectedPetMedicineTypes">
        <div class="actions">
          <button :disabled="!selectedPetMedicineTypes" @click="submitPetMedicineTypes">Submit</button>
          <button @click="isOpen = false">Cancel</button>
        </div>
      </template>
      <template v-else-if="step === 'medicineLabels'">
        <h3>Would you like to label the different types of medicines?</h3>
        <input type="text" placeholder="Enter yes or no" v-model="selectedPetMedicineLabelsChoice">
        <div v-if="selectedPetMedicineLabelsChoice.toLowerCase() === 'yes'">
          <h3>Label the different types of medicines here</h3>
          <input v-for="medicineType in Number(selectedPetMedicineTypes)" :key="medicineType" v-model="selectedPetMedicineLabels[medicineType - 1]" type="text" :placeholder="`Medicine ${medicineType}`">
        </div>
        <div class="actions">
          <button :disabled="!selectedPetMedicineLabelsChoice" @click="submitPetMedicineLabels">Submit</button>
          <button @click="isOpen = false">Cancel</button>
        </div>
      </template>
    </div>
  </div>
</template>

<style scoped>
</style>
