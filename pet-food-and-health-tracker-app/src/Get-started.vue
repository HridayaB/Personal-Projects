<script setup lang="ts">
  import {ref, computed} from 'vue'
  import { addPet, getPets } from './pets'
  import { isDarkMode } from './darkMode'
  import Icons from './Icons.vue'

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
  const showTrackerOptions = ref(getPets().length > 0)

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
    showTrackerOptions.value = true
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
    if (selectedPetFoodFrequency.value === '') return
    step.value = 'treat'
  }
  const submitPetTreatFrequency = () => {
    if (selectedPetTreatFrequency.value === '') return
    step.value = 'exercise'
  }
  const submitPetExerciseFrequency = () => {
    if (selectedPetExerciseFrequency.value === '') return
    step.value = Number(selectedPetExerciseFrequency.value) > 0 ? 'exerciseDuration' : 'medicine'
  }
  const submitPetExerciseDuration = () => {
    if (selectedPetExerciseDuration.value === '') return
    step.value = 'exerciseTypes'
  }
  const submitPetExerciseTypes = () => {
    if (selectedPetExerciseTypes.value === '') return
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
  <main class="get-started" :class="{ 'dark-mode': isDarkMode }">
    <h2>Get Started</h2>
    <input id="dark-mode-toggle" v-model="isDarkMode" type="checkbox"/>
    <label for="dark-mode-toggle">
      <Icons :dark-mode="isDarkMode" />
    </label>
    <button @click="openModal" id="choose-pet-button">Choose your pet</button>
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
        <template v-else-if="step === 'pet'">
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
            <button :disabled="selectedPetFoodFrequency === ''" @click="submitPetFoodFrequency">Submit</button>
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
            <button :disabled="selectedPetTreatFrequency === ''" @click="submitPetTreatFrequency">Submit</button>
            <button @click="isOpen = false">Cancel</button>
          </div>
        </template>
        <template v-else-if="step === 'exercise'">
          <h3>{{ exerciseFrequencyLabel }}</h3>
          <input type="number" min="0" v-model="selectedPetExerciseFrequency">
          <div class="actions">
            <button :disabled="selectedPetExerciseFrequency === ''" @click="submitPetExerciseFrequency">Submit</button>
            <button @click="isOpen = false">Cancel</button>
          </div>
        </template>
        <template v-else-if="step === 'exerciseDuration'">
          <h3>How long does your {{ selectedPet.toLowerCase() }} exercise each session?</h3>
          <input type="number" min="0" v-model="selectedPetExerciseDuration" placeholder="Enter in minutes">
          <div class="actions">
            <button :disabled="selectedPetExerciseDuration === ''" @click="submitPetExerciseDuration">Submit</button>
            <button @click="isOpen = false">Cancel</button>
          </div>
        </template>
        <template v-else-if="step === 'exerciseTypes'">
          <h3>How many types of exercise does your {{ selectedPet.toLowerCase() }} do?</h3>
          <input type="number" min="0" v-model="selectedPetExerciseTypes">
          <div class="actions">
            <button :disabled="selectedPetExerciseTypes === ''" @click="submitPetExerciseTypes">Submit</button>
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

    <div v-if="showTrackerOptions === true" class="show-tracker-options">
      <p> That is all we need from you. You can now start tracking your pet's food and health using one of the following tracker.</p>
      <div class="home-page-container">
        <router-link to="/" id="home-page-link">
          <span>Home</span>
          <Icons icon="home-page-1" />
        </router-link>
        <div class="home-page-icons">
          <Icons icon="home-page-2" />
          <Icons icon="home-page-3" />
          <Icons icon="home-page-4" />
          <Icons icon="home-page-5" />
          <Icons icon="home-page-6" />
        </div>
      </div>
      <div class="food-tracker-container">
        <router-link to="/daily-food-tracker" id="daily-food-tracker-link">
          <span>Daily Food Tracker</span>
          <Icons icon="pet-food-1" />
        </router-link>
        <div class="pet-food-icons">
          <Icons icon="pet-food-2" />
          <Icons icon="pet-food-3" />
          <Icons icon="pet-food-4" />
          <Icons icon="pet-food-5" />
          <Icons icon="pet-food-6" />
        </div>
      </div>
      <div class="treat-tracker-container">
        <router-link to='/daily-treat-tracker' id="daily-treat-tracker-link">
          <span>Daily Treat Tracker</span>
          <Icons icon="pet-treat-1" />
        </router-link>
        <div class="pet-treat-icons">
          <Icons icon="pet-treat-2" />
          <Icons icon="pet-treat-3" />
          <Icons icon="pet-treat-4" />
          <Icons icon="pet-treat-5" />
          <Icons icon="pet-treat-6" />
        </div>
      </div>
      <div class="exercise-tracker-container">
        <router-link to='/daily-exercise-tracker' id="daily-exercise-tracker-link">
          <span>Daily Exercise Tracker</span>
          <Icons icon="pet-exercise-1" />
        </router-link>
        <div class="pet-exercise-icons">
          <Icons icon="pet-exercise-2" />
          <Icons icon="pet-exercise-3" />
          <Icons icon="pet-exercise-4" />
          <Icons icon="pet-exercise-5" />
          <Icons icon="pet-exercise-6" />
        </div>
      </div>
      <div class="medicine-tracker-container">
        <router-link to='/daily-medicine-tracker' id="daily-medicine-tracker-link">
          <span>Daily Medicine Tracker</span>
          <Icons icon="pet-medicine-1" />
        </router-link>
        <div class="pet-medicine-icons">
          <Icons icon="pet-medicine-2" />
          <Icons icon="pet-medicine-3" />
          <Icons icon="pet-medicine-4" />
          <Icons icon="pet-medicine-5" />
          <Icons icon="pet-medicine-6" />
        </div>
      </div>
      <div class="potty-tracker-container">
        <router-link to='/daily-potty-tracker' id="daily-potty-tracker-link">
          <span>Daily Potty Tracker</span>
          <Icons icon="pet-potty-1" />
        </router-link>
        <div class="pet-potty-icons">
          <Icons icon="pet-potty-2" />
          <Icons icon="pet-potty-3" />
          <Icons icon="pet-potty-4" />
          <Icons icon="pet-potty-5" />
          <Icons icon="pet-potty-6" />
        </div>
      </div>
    </div>
  </main>
</template>

<style scoped>
  .get-started {
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

  .get-started.dark-mode {
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

  #dark-mode-toggle {
    width: 0;
    height: 0;
    visibility: hidden;
    opacity: 0;
    position: absolute;
  }

  #dark-mode-toggle:checked + label {
    background: #242424
  }

  #dark-mode-toggle:checked + label:after {
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
    height: 25px;
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

  .tracker-links {
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 15px;
    flex-wrap: wrap;
    margin-top: 2rem;
  }

  #home-page-link,
  #daily-food-tracker-link,
  #daily-treat-tracker-link,
  #daily-exercise-tracker-link,
  #daily-medicine-tracker-link,
  #daily-potty-tracker-link {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 10px;
    padding: 12px 20px;
    background-color: #ffffff;
    color: #1a1a1a;
    border: 1px solid #d1d1d1;
    border-radius: 10px;
    text-decoration: none;
    font-weight: 600;
    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.08);
    transition: transform 0.2s,
      background-color 0.3s,
      border-color 0.3s,
      box-shadow 0.2s;
  }

  #home-page-link:hover,
  #daily-food-tracker-link:hover,
  #daily-treat-tracker-link:hover,
  #daily-exercise-tracker-link:hover,
  #daily-medicine-tracker-link:hover,
  #daily-potty-tracker-link:hover {
    transform: translateY(-2px);
    border-color: #993638;
    box-shadow: 0 4px 10px rgba(0, 0, 0, 0.12);
  }

  .dark-mode #home-page-link,
  .dark-mode #daily-food-tracker-link,
  .dark-mode #daily-treat-tracker-link,
  .dark-mode #daily-exercise-tracker-link,
  .dark-mode #daily-medicine-tracker-link,
  .dark-mode #daily-potty-tracker-link {
    background-color: #333333;
    color: #f2f2f2;
    border-color: #4a4a4a;
    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.3);
  }

  .dark-mode #home-page-link:hover,
  .dark-mode #daily-food-tracker-link:hover,
  .dark-mode #daily-treat-tracker-link:hover,
  .dark-mode #daily-exercise-tracker-link:hover,
  .dark-mode #daily-medicine-tracker-link:hover,
  .dark-mode #daily-potty-tracker-link:hover {
    border-color: #993638;
    background-color: #3d3d3d;
  }

  #home-page-link :deep(svg.home-page-1),
  #daily-food-tracker-link :deep(svg.pet-food-1),
  #daily-treat-tracker-link :deep(svg.pet-treat-1),
  #daily-exercise-tracker-link :deep(svg.pet-exercise-1),
  #daily-medicine-tracker-link :deep(svg.pet-medicine-1),
  #daily-potty-tracker-link :deep(svg.pet-potty-1) {
    width: 30px;
    height: 30px;
    transition: transform 0.3s ease-in-out;
  }

  #home-page-link:hover :deep(svg.home-page-1),
  #daily-food-tracker-link:hover :deep(svg.pet-food-1),
  #daily-treat-tracker-link:hover :deep(svg.pet-treat-1),
  #daily-exercise-tracker-link:hover :deep(svg.pet-exercise-1),
  #daily-medicine-tracker-link:hover :deep(svg.pet-medicine-1),
  #daily-potty-tracker-link:hover :deep(svg.pet-potty-1) {
    transform: scale(1.1);
  }

  .home-page-container,
  .food-tracker-container,
  .treat-tracker-container,
  .exercise-tracker-container,
  .medicine-tracker-container,
  .potty-tracker-container {
    position: relative;
    display: inline-block;
  }

  .home-page-icons,
  .pet-food-icons,
  .pet-treat-icons,
  .pet-exercise-icons,
  .pet-medicine-icons,
  .pet-potty-icons {
    position: absolute;
    inset: 0;
    pointer-events: none;
    overflow: visible;
  }

  .home-page-icons :deep(svg),
  .pet-food-icons :deep(svg),
  .pet-treat-icons :deep(svg),
  .pet-exercise-icons :deep(svg),
  .pet-medicine-icons :deep(svg),
  .pet-potty-icons :deep(svg) {
    position: absolute;
    width: 30px;
    height: 30px;
    left: 50%;
    top: 0;
    opacity: 0;
    transform: translate(-50%, 12px) scale(0) rotate(0deg);
    transition: left 0.45s cubic-bezier(0.2, 0.8, 0.2, 1), top 0.45s ease, opacity 0.25s ease, transform 0.45s cubic-bezier(0.2, 0.8, 0.2, 1);
  }

  .home-page-icons :deep(svg.home-page-2),
  .pet-food-icons :deep(svg.pet-food-2),
  .pet-treat-icons :deep(svg.pet-treat-2),
  .pet-exercise-icons :deep(svg.pet-exercise-2),
  .pet-medicine-icons :deep(svg.pet-medicine-2),
  .pet-potty-icons :deep(svg.pet-potty-2) {
    --food-left: 10%;
    --food-rotation: -15deg;
  }

  .home-page-container:hover .home-page-icons :deep(svg.home-page-2),
  .food-tracker-container:hover .pet-food-icons :deep(svg.pet-food-2),
  .treat-tracker-container:hover .pet-treat-icons :deep(svg.pet-treat-2),
  .exercise-tracker-container:hover .pet-exercise-icons :deep(svg.pet-exercise-2),
  .medicine-tracker-container:hover .pet-medicine-icons :deep(svg.pet-medicine-2),
  .potty-tracker-container:hover .pet-potty-icons :deep(svg.pet-potty-2) {
    left: 10%;
    top: -40px;
    opacity: 1;
    transform: translate(-50%, 0) scale(1) rotate(-15deg);
    transition-delay: 0s;
  }

  .home-page-icons :deep(svg.home-page-3),
  .pet-food-icons :deep(svg.pet-food-3),
  .pet-treat-icons :deep(svg.pet-treat-3),
  .pet-exercise-icons :deep(svg.pet-exercise-3),
  .pet-medicine-icons :deep(svg.pet-medicine-3),
  .pet-potty-icons :deep(svg.pet-potty-3) {
    --food-left: 30%;
    --food-rotation: -8deg;
  }

  .home-page-container:hover .home-page-icons :deep(svg.home-page-3),
  .food-tracker-container:hover .pet-food-icons :deep(svg.pet-food-3),
  .treat-tracker-container:hover .pet-treat-icons :deep(svg.pet-treat-3),
  .exercise-tracker-container:hover .pet-exercise-icons :deep(svg.pet-exercise-3),
  .medicine-tracker-container:hover .pet-medicine-icons :deep(svg.pet-medicine-3),
  .potty-tracker-container:hover .pet-potty-icons :deep(svg.pet-potty-3) {
    left: 30%;
    top: -40px;
    opacity: 1;
    transform: translate(-50%, 0) scale(1) rotate(-8deg);
    transition-delay: 0.07s;
  }

  .home-page-icons :deep(svg.home-page-4),
  .pet-food-icons :deep(svg.pet-food-4),
  .pet-treat-icons :deep(svg.pet-treat-4),
  .pet-exercise-icons :deep(svg.pet-exercise-4),
  .pet-medicine-icons :deep(svg.pet-medicine-4),
  .pet-potty-icons :deep(svg.pet-potty-4) {
    --food-left: 50%;
    --food-rotation: 0deg;
  }

  .home-page-container:hover .home-page-icons :deep(svg.home-page-4),
  .food-tracker-container:hover .pet-food-icons :deep(svg.pet-food-4),
  .treat-tracker-container:hover .pet-treat-icons :deep(svg.pet-treat-4),
  .exercise-tracker-container:hover .pet-exercise-icons :deep(svg.pet-exercise-4),
  .medicine-tracker-container:hover .pet-medicine-icons :deep(svg.pet-medicine-4),
  .potty-tracker-container:hover .pet-potty-icons :deep(svg.pet-potty-4) {
    left: 50%;
    top: -40px;
    opacity: 1;
    transform: translate(-50%, 0) scale(1) rotate(5deg);
    transition-delay: 0.14s;
  }

  .home-page-icons :deep(svg.home-page-5),
  .pet-food-icons :deep(svg.pet-food-5),
  .pet-treat-icons :deep(svg.pet-treat-5),
  .pet-exercise-icons :deep(svg.pet-exercise-5),
  .pet-medicine-icons :deep(svg.pet-medicine-5),
  .pet-potty-icons :deep(svg.pet-potty-5) {
    --food-left: 70%;
    --food-rotation: 8deg;
  }

  .home-page-container:hover .home-page-icons :deep(svg.home-page-5),
  .food-tracker-container:hover .pet-food-icons :deep(svg.pet-food-5),
  .treat-tracker-container:hover .pet-treat-icons :deep(svg.pet-treat-5),
  .exercise-tracker-container:hover .pet-exercise-icons :deep(svg.pet-exercise-5),
  .medicine-tracker-container:hover .pet-medicine-icons :deep(svg.pet-medicine-5),
  .potty-tracker-container:hover .pet-potty-icons :deep(svg.pet-potty-5) {
    left: 70%;
    top: -40px;
    opacity: 1;
    transform: translate(-50%, 0) scale(1) rotate(8deg);
    transition-delay: 0.21s;
  }

  .home-page-icons :deep(svg.home-page-6),
  .pet-food-icons :deep(svg.pet-food-6),
  .pet-treat-icons :deep(svg.pet-treat-6),
  .pet-exercise-icons :deep(svg.pet-exercise-6),
  .pet-medicine-icons :deep(svg.pet-medicine-6),
  .pet-potty-icons :deep(svg.pet-potty-6) {
    --food-left: 90%;
    --food-rotation: 15deg;
  }

  .home-page-container:hover .home-page-icons :deep(svg.home-page-6),
  .food-tracker-container:hover .pet-food-icons :deep(svg.pet-food-6),
  .treat-tracker-container:hover .pet-treat-icons :deep(svg.pet-treat-6),
  .exercise-tracker-container:hover .pet-exercise-icons :deep(svg.pet-exercise-6),
  .medicine-tracker-container:hover .pet-medicine-icons :deep(svg.pet-medicine-6),
  .potty-tracker-container:hover .pet-potty-icons :deep(svg.pet-potty-6) {
    left: 90%;
    top: -40px;
    opacity: 1;
    transform: translate(-50%, 0) scale(1) rotate(15deg);
    transition-delay: 0.28s;
  }

  @media (prefers-reduced-motion: reduce) {
    .home-page-icons :deep(svg),
    .pet-food-icons :deep(svg),
    .pet-treat-icons :deep(svg),
    .pet-exercise-icons :deep(svg),
    .pet-medicine-icons :deep(svg),
    .pet-potty-icons :deep(svg) {
      transition: none;
    }
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

  #choose-pet-button {
    padding: 12px 24px;
    background-color: #FFF;
    color: #1a1a1a;
    border: 1px solid #d1d1d1;
    border-radius: 10px;
    font-size: 16px;
    font-weight: 600;
    font-family: inherit;
    cursor: pointer;
    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.08);
    transition: transform 0.2s ease, background-color 0.3s ease, border-color 0.3s ease, box-shadow 0.2s ease;
  }

  #choose-pet-button:hover {
    transform: translateY(-2px);
    border-color: #993638;
    box-shadow: 0 4px 10px rgba(0, 0, 0, 0.12);
  }

  #choose-pet-button:active {
    transform: translateY(0);
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.12);
  }

  #choose-pet-button:focus-visible {
    outline: 3px solid rgba(153, 54, 56, 0.35);
    outline-offset: 3px;
  }

  .dark-mode #choose-pet-button {
    background-color: #333333;
    color: #f2f2f2;
    border-color: #4a4a4a;
    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.3);
  }

  .dark-mode #choose-pet-button:hover {
    background-color: #3d3d3d;
    border-color: #993638;
  }

  .modal-overlay {
    position: fixed;
    inset: 0;
    z-index: 1000;
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 20px;
    box-sizing: border-box;
    background: rgba(0, 0, 0, 0.45);
    backdrop-filter: blur(6px);
    -webkit-backdrop-filter: blur(6px);
  }

  .modal-content {
    width: 100%;
    max-width: 600px;
    max-height: calc(100vh - 40px);
    overflow-y: auto;
    box-sizing: border-box;
    padding: 30px;
    background-color: #FFF;
    color: #1a1a1a;
    border: 1px solid #d1d1d1;
    border-radius: 16px;
    box-shadow: 0 10px 35px rgba(0, 0, 0, 0.25);
    text-align: center;
    animation: modal-appear 0.25s ease-out;
  }

  .modal-content h3 {
    margin: 0 0 20px;
    font-size: 1.4rem;
    font-weight: 600;
  }

  .modal-context p {
    margin: 15px auto;
    font-size: 1rem;
    line-height: 1.5;
  }

  .modal-content ul {
    text-align: left;
    margin: 15px 0;
    padding-left: 25px;
  }

  .modal-content li {
    margin-bottom: 8px;
  }

  .modal-content input,
  .modal-content select {
    width: 100%;
    max-width: 400px;
    box-sizing: border-box;
    padding: 12px 14px;
    margin: 10px 0;
    background-color: #FFF;
    color: #1a1a1a;
    border: 1px splid #d1d1d1;
    border-radius: 8px;
    font-family: inherit;
    font-size: 1rem;
  }

  .modal-content input:focus,
  .modal-content select:focus {
    outline: none;
    border-color: #993638;
    box-shadow: 0 0 0 3px rgba(153, 54, 56, 0.15);
  }

  .modal-content button {
    padding: 10px 22px;
    margin: 8px;
    background-color: #FFF;
    color: #1a1a1a;
    border: 1px solid #d1d1d1;
    border-radius: 8px;
    font-family: inherit;
    font-size: 1rem;
    font-weight: 600;
    cursor: pointer;
    transition: transform 0.2s ease, background-color 0.3s ease, border-color 0.3s ease, box-shadow 0.2s ease;
  }

  .modal-content button:hover:not(:disabled) {
    transform: translateY(-2px);
    border-color: #993638;
    box-shadow: 0 3px 8px rgba(0, 0, 0, 0.12);
  }

  .modal-content button:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .modal-content button:focus-visible {
    outline: 3px solid rgba(153, 54, 56, 0.35);
    outline-offset: 3px;
  }

  .modal-content .actions {
    display: flex;
    justify-content: center;
    flex-wrap: wrap;
    gap: 10px;
    margin-top: 20px;
  }

  .dark-mode .modal-content {
    background-color: #333333;
    color: #f2f2f2;
    border-color: #4a4a4a;
  }

  .dark-mode .modal-content input,
  .dark-mode .modal-content select {
    background-color: #242424;
    color: #f2f2f2;
    border-color: #555555;
  }

  .dark-mode .modal-content button {
    background-color: #333333;
    color: #f2f2f2;
    border-color: #555555;
  }

  .dark-mode .modal-content button:hover:not(:disabled) {
    background-color: #3d3d3d;
    border-color: #993638;
  }

  @keyframes modal-appear {
    from {
      opacity: 0;
      transform: scale(0.95) translateY(10px);
    }
    to {
      opacity: 1;
      transform: scale(1) translateY(0);
    }
  }

  @media (max-width: 600px) {
    .modal-content {
      padding: 22px 16px;
    }

    .modal-content h3 {
      font-size: 1.2rem;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .modal-content {
      animation: none;
    }

    .modal-content button {
      transition: none;
    }
  }
</style>
