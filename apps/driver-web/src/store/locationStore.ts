import { create } from "zustand"

import { readLastLocation } from "@/lib/locationPersistence"
import type { Coordinates, LocationState, LocationStatus } from "@/types/location"

export const NIGERIA_FALLBACK_COORDS: Coordinates = {
  lat: 9.082,
  lng: 8.6753,
}

interface LocationStore extends LocationState {
  setStatus: (status: LocationStatus) => void
  setCoords: (coords: Coordinates | null) => void
  setLastKnownCoords: (coords: Coordinates | null) => void
  hydrateFromStorage: () => void
  resetLocation: () => void
  useFallbackLocation: () => void
}

const INITIAL_STATE: LocationState = {
  status: "unknown",
  coords: null,
  lastKnownCoords: null,
  fallbackCoords: NIGERIA_FALLBACK_COORDS,
}

export const useLocationStore = create<LocationStore>((set, get) => ({
  ...INITIAL_STATE,

  setStatus: (status) => set({ status }),

  setCoords: (coords) => set({ coords }),

  setLastKnownCoords: (coords) => set({ lastKnownCoords: coords }),

  hydrateFromStorage: () => {
    const stored = readLastLocation()
    if (stored) {
      set({ lastKnownCoords: stored })
    }
  },

  resetLocation: () => set({ ...INITIAL_STATE }),

  useFallbackLocation: () => {
    const { fallbackCoords, lastKnownCoords } = get()
    if (lastKnownCoords) {
      set({ status: "denied", coords: null })
      return
    }

    set({
      status: "fallback",
      coords: fallbackCoords,
    })
  },
}))

export function getLocationSnapshot(): LocationState {
  return useLocationStore.getState()
}
