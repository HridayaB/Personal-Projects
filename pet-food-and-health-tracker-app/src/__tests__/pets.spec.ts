import { describe, it, expect, beforeEach } from 'vitest'
import { getPets, addPet, getActivePet, getActivePetId, setActivePetId, deletePet } from '../pets'

const base = {
  type: 'Dog', name: 'Buddy', weight: '50', breed: 'Siberian Husky', foodFrequency: '2', treatFrequency: '5'
}

describe('pets store', () => {
  beforeEach(() => localStorage.clear())

  it('returns an empty array initially', () => {
    expect(getPets()).toEqual([])
  })

  it('adds a pet with a generated id and marks it as active', () => {
    const pet = addPet(base)
    expect(pet.id).toBeTruthy()
    expect(getPets()).toHaveLength(1)
    expect(getActivePetId()).toBe(pet.id)
    expect(getActivePet()?.name).toBe('Buddy')
  })

  it('sets the active pet id', () => {
    const pet = addPet(base)
    setActivePetId(pet.id)
    expect(getActivePetId()).toBe(pet.id)
  })

  it('adds a second pet without overwriting the first', () => {
    const firstPet = addPet(base)
    const secondPet = addPet({ ...base, type: 'Cat', name: 'Whiskers' })
    expect(getPets()).toHaveLength(2)
    expect(getActivePetId()).toBe(secondPet.id)
    expect(getActivePet()?.name).toBe('Whiskers')
    expect(getPets().find(p => p.id === firstPet.id)?.name).toBe('Buddy')
  })

  it('deletes active pet and primotes the other', () => {
    const firstPet = addPet(base)
    const secondPet = addPet({ ...base, name: 'Whiskers'})
    deletePet(secondPet.id)
    expect(getPets()).toHaveLength(1)
    expect(getActivePetId()).toBe(firstPet.id)
  })

  it('deleting the last pet clears the active id', () => {
    const pet = addPet(base)
    deletePet(pet.id)
    expect(getPets()).toHaveLength(0)
    expect(getActivePetId()).toBeNull()
  })
})
