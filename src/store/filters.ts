import { create } from 'zustand'

export type FiltersState = {
  gte: string
  lte: string
  bbox: string
  q: string
  toneMin?: number
  toneMax?: number
  set: (partial: Partial<FiltersState>) => void
}

export const useFiltersStore = create<FiltersState>((set) => ({
  gte: '2019-04-01',
  lte: '2019-04-30',
  bbox: '70,15,135,55',
  q: '',
  set: (partial) => set((s) => ({ ...s, ...partial })),
}))








