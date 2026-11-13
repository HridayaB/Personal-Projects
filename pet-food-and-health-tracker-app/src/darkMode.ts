import { ref, watch } from 'vue'

const DARK_MODE_KEY = 'darkMode'

const getSavedDarkMode = () => {
  return localStorage.getItem(DARK_MODE_KEY) === 'true'
}

export const isDarkMode = ref(getSavedDarkMode())

watch(isDarkMode, (value) => {
  localStorage.setItem(DARK_MODE_KEY, String(value))
})
