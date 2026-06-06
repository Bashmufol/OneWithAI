import type { ConnectorType, StationStatus } from "@evocharge/types"
import { create } from "zustand"

export interface StationFilterState {
  status: StationStatus[]
  operator: string[]
  connectorType: ConnectorType[]
}

export type StationFilterKey = keyof StationFilterState

export const DEFAULT_STATION_FILTERS: StationFilterState = {
  status: [],
  operator: [],
  connectorType: [],
}

interface StationFiltersStore {
  filters: StationFilterState
  searchQuery: string
  setFilter: <K extends StationFilterKey>(
    key: K,
    value: StationFilterState[K],
  ) => void
  toggleFilterValue: <K extends StationFilterKey>(
    key: K,
    value: StationFilterState[K][number],
  ) => void
  setSearchQuery: (searchQuery: string) => void
  resetFilters: () => void
}

export const useStationFiltersStore = create<StationFiltersStore>((set) => ({
  filters: DEFAULT_STATION_FILTERS,
  searchQuery: "",

  setFilter: (key, value) =>
    set((state) => ({
      filters: { ...state.filters, [key]: value },
    })),

  toggleFilterValue: (key, value) =>
    set((state) => {
      const current = state.filters[key] as Array<
        StationFilterState[typeof key][number]
      >
      const next = current.includes(value)
        ? current.filter((item) => item !== value)
        : [...current, value]

      return {
        filters: { ...state.filters, [key]: next },
      }
    }),

  setSearchQuery: (searchQuery) => set({ searchQuery }),

  resetFilters: () => set({ filters: DEFAULT_STATION_FILTERS }),
}))
