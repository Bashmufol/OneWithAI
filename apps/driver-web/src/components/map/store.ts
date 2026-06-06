import { create } from "zustand"

import type { Station } from "@evocharge/types"

interface FlyToRequest {
  lat: number
  lng: number
  zoom?: number
}

interface SelectStationOptions {
  fly?: boolean
  openDialog?: boolean
}

interface MapStore {
  selectedStation: Station | null
  highlightedStationId: string | null
  heatmapEnabled: boolean
  flyToRequest: FlyToRequest | null
  setSelectedStation: (station: Station | null) => void
  setHighlightedStationId: (id: string | null) => void
  selectStation: (station: Station, options?: SelectStationOptions) => void
  clearFlyToRequest: () => void
  setHeatmapEnabled: (enabled: boolean) => void
}

export const useMapStore = create<MapStore>((set) => ({
  selectedStation: null,
  highlightedStationId: null,
  heatmapEnabled: false,
  flyToRequest: null,

  setSelectedStation: (selectedStation) => set({ selectedStation }),

  setHighlightedStationId: (highlightedStationId) =>
    set({ highlightedStationId }),

  selectStation: (station, options = { fly: true, openDialog: true }) => {
    set({
      highlightedStationId: station.id,
      selectedStation: options.openDialog ? station : null,
      flyToRequest: options.fly
        ? {
            lat: station.location.lat,
            lng: station.location.lng,
            zoom: 14,
          }
        : null,
    })
  },

  clearFlyToRequest: () => set({ flyToRequest: null }),

  setHeatmapEnabled: (heatmapEnabled) => set({ heatmapEnabled }),
}))
