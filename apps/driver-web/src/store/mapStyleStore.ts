import { create } from "zustand"

import type { MapStyle } from "@/lib/mapTiles"

interface MapStyleStore {
  currentMapStyle: MapStyle
  setMapStyle: (style: MapStyle) => void
}

export const useMapStyleStore = create<MapStyleStore>((set) => ({
  currentMapStyle: "standard",
  setMapStyle: (currentMapStyle) => set({ currentMapStyle }),
}))
