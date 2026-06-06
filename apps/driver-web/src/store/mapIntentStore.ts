import { create } from "zustand"

export type MapMode = "focus" | "route" | null

export type MapCoords = {
  lat: number
  lng: number
}

export type RouteDestinationKind = "station" | "city" | "landmark"

export interface RouteDestination {
  label: string
  address?: string
  lat: number
  lng: number
  stationId?: string
  kind: RouteDestinationKind
}

interface MapIntentStore {
  mode: MapMode
  selectedStationId?: string
  focusCoords?: MapCoords
  routeFrom?: MapCoords
  routeTo?: MapCoords
  routeDestination: RouteDestination | null
  activeRoute: { from: MapCoords; to: MapCoords } | null
  setFocus: (stationId: string, coords: MapCoords) => void
  setRoute: (from: MapCoords, to: MapCoords) => void
  setRouteDestination: (destination: RouteDestination | null) => void
  setActiveRoute: (from: MapCoords, to: MapCoords) => void
  clearActiveRoute: () => void
  clearIntent: () => void
}

export const useMapIntentStore = create<MapIntentStore>((set) => ({
  mode: null,
  selectedStationId: undefined,
  focusCoords: undefined,
  routeFrom: undefined,
  routeTo: undefined,
  routeDestination: null,
  activeRoute: null,

  setFocus: (selectedStationId, focusCoords) =>
    set({
      mode: "focus",
      selectedStationId,
      focusCoords,
      routeFrom: undefined,
      routeTo: undefined,
      activeRoute: null,
    }),

  setRoute: (routeFrom, routeTo) =>
    set({
      mode: "route",
      routeFrom,
      routeTo,
      selectedStationId: undefined,
      focusCoords: undefined,
    }),

  setRouteDestination: (routeDestination) => set({ routeDestination }),

  setActiveRoute: (from, to) => set({ activeRoute: { from, to } }),

  clearActiveRoute: () =>
    set({
      activeRoute: null,
      routeDestination: null,
    }),

  clearIntent: () =>
    set({
      mode: null,
      selectedStationId: undefined,
      focusCoords: undefined,
      routeFrom: undefined,
      routeTo: undefined,
    }),
}))
