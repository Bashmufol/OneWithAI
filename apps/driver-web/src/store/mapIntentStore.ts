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

export type RouteGeometrySource = "osrm" | "fallback"

interface MapIntentStore {
  mode: MapMode
  selectedStationId?: string
  focusCoords?: MapCoords
  routeFrom?: MapCoords
  routeTo?: MapCoords
  routeDestination: RouteDestination | null
  activeRoute: { from: MapCoords; to: MapCoords } | null
  routeGeometry: MapCoords[] | null
  routeGeometryKey: string | null
  routeDistanceMeters: number | null
  routeDurationSeconds: number | null
  routeGeometrySource: RouteGeometrySource | null
  isRouteGeometryLoading: boolean
  setFocus: (stationId: string, coords: MapCoords) => void
  setRoute: (from: MapCoords, to: MapCoords) => void
  setRouteDestination: (destination: RouteDestination | null) => void
  setActiveRoute: (from: MapCoords, to: MapCoords) => void
  setRouteGeometry: (input: {
    coordinates: MapCoords[]
    distanceMeters: number
    durationSeconds: number
    source: RouteGeometrySource
    key: string
  }) => void
  clearRouteGeometry: () => void
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
  routeGeometry: null,
  routeGeometryKey: null,
  routeDistanceMeters: null,
  routeDurationSeconds: null,
  routeGeometrySource: null,
  isRouteGeometryLoading: false,

  setFocus: (selectedStationId, focusCoords) =>
    set({
      mode: "focus",
      selectedStationId,
      focusCoords,
      routeFrom: undefined,
      routeTo: undefined,
      activeRoute: null,
      routeGeometry: null,
      routeGeometryKey: null,
      routeDistanceMeters: null,
      routeDurationSeconds: null,
      routeGeometrySource: null,
      isRouteGeometryLoading: false,
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

  setActiveRoute: (from, to) =>
    set({
      activeRoute: { from, to },
      routeGeometry: null,
      routeGeometryKey: null,
      routeDistanceMeters: null,
      routeDurationSeconds: null,
      routeGeometrySource: null,
    }),

  setRouteGeometry: ({
    coordinates,
    distanceMeters,
    durationSeconds,
    source,
    key,
  }) =>
    set({
      routeGeometry: coordinates,
      routeGeometryKey: key,
      routeDistanceMeters: distanceMeters,
      routeDurationSeconds: durationSeconds,
      routeGeometrySource: source,
    }),

  clearRouteGeometry: () =>
    set({
      routeGeometry: null,
      routeGeometryKey: null,
      routeDistanceMeters: null,
      routeDurationSeconds: null,
      routeGeometrySource: null,
      isRouteGeometryLoading: false,
    }),

  clearActiveRoute: () =>
    set({
      activeRoute: null,
      routeDestination: null,
      routeGeometry: null,
      routeGeometryKey: null,
      routeDistanceMeters: null,
      routeDurationSeconds: null,
      routeGeometrySource: null,
      isRouteGeometryLoading: false,
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
