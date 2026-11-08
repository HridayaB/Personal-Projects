export interface Pet {
  id: string
  type: string
  name: string
  weight: string
  breed: string
  foodFrequency: string
  treatFrequency: string
}

const PETS_KEY = 'pets'
const ACTIVE_PET_KEY = 'activePet'

export function getPets(): Pet[] {
  const raw = localStorage.getItem(PETS_KEY)
  return raw ? JSON.parse(raw) : []
}

export function savePets(pets: Pet[]) {
  localStorage.setItem(PETS_KEY, JSON.stringify(pets))
}

export function addPet(pet: Omit<Pet, 'id'>): Pet {
  const pets = getPets()
  const newPet: Pet = { ...pet, id: `p_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`}
  pets.push(newPet)
  savePets(pets)
  setActivePetId(newPet.id)
  return newPet
}

export function getActivePetId(): string | null {
  return localStorage.getItem(ACTIVE_PET_KEY)
}

export function setActivePetId(id: string) {
  localStorage.setItem(ACTIVE_PET_KEY, id)
}

export function getActivePet(): Pet | null {
  const id = getActivePetId()
  if (!id) return null
  return getPets().find(p => p.id === id) ?? null
}

export function deletePet(id: string) {
  const pets = getPets().filter(p => p.id !== id)
  savePets(pets)
  if (getActivePetId() === id) {
    const nextPet = pets[0]
    if (nextPet) setActivePetId(nextPet.id)
    else localStorage.removeItem(ACTIVE_PET_KEY)
  }
}
