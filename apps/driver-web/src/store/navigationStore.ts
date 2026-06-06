import { create } from "zustand"

import {
  buildRouteCoordinates,
  getBearing,
  getBearingAtDistance,
  getIndexAtDistance,
  getPositionAtDistance,
  getTotalRouteDistanceMeters,
  projectOntoRoute,
} from "@/lib/routeProgress"

export type NavigationMode = "idle" | "active" | "paused"

export interface NavCoords {
  lat: number
  lng: number
}

export interface NavigationRoute {
  from: NavCoords
  to: NavCoords
  destinationLabel?: string
}

interface RouteProgressUpdate {
  routeProgressDistanceM?: number
  vehiclePosition?: NavCoords | null
  vehicleBearing?: number
  currentRouteIndex?: number
  progressPercentage?: number
  distanceRemainingKm?: number | null
}

interface NavigationStore {
  navigationMode: NavigationMode
  isNavigationFullscreen: boolean
  currentRoute: NavigationRoute | null
  currentRouteCoordinates: NavCoords[]
  currentRouteIndex: number
  progressPercentage: number
  routeProgressDistanceM: number
  distanceRemainingKm: number | null
  routeDurationSeconds: number | null
  userLocation: NavCoords | null
  vehiclePosition: NavCoords | null
  vehicleBearing: number
  destination: NavCoords | null

  setNavigationMode: (mode: NavigationMode) => void
  setRoute: (route: NavigationRoute | null) => void
  setRouteCoordinates: (coordinates: NavCoords[]) => void
  setUserLocation: (location: NavCoords | null) => void
  setDestination: (destination: NavCoords | null) => void
  setRouteProgress: (update: RouteProgressUpdate) => void
  syncProgressFromGps: (location: NavCoords) => void
  advanceSimulation: (distanceMeters: number) => void
  pauseFollow: () => void
  resumeFollow: () => void
  setFullscreen: (enabled: boolean) => void
  startNavigation: (input: {
    route: NavigationRoute
    routeCoordinates?: NavCoords[]
    routeDurationSeconds?: number | null
    userLocation?: NavCoords | null
    fullscreen?: boolean
  }) => void
  exitNavigation: () => void
}

function createInitialProgress(route: NavCoords[], start: NavCoords) {
  const totalDistanceM = getTotalRouteDistanceMeters(route)

  return {
    currentRouteCoordinates: route,
    currentRouteIndex: 0,
    progressPercentage: 0,
    routeProgressDistanceM: 0,
    distanceRemainingKm: totalDistanceM / 1000,
    vehiclePosition: start,
    vehicleBearing: route.length >= 2 ? getBearing(route[0], route[1]) : 0,
  }
}

export const useNavigationStore = create<NavigationStore>((set, get) => ({
  navigationMode: "idle",
  isNavigationFullscreen: false,
  currentRoute: null,
  currentRouteCoordinates: [],
  currentRouteIndex: 0,
  progressPercentage: 0,
  routeProgressDistanceM: 0,
  distanceRemainingKm: null,
  routeDurationSeconds: null,
  userLocation: null,
  vehiclePosition: null,
  vehicleBearing: 0,
  destination: null,

  setNavigationMode: (navigationMode) => set({ navigationMode }),

  setRoute: (currentRoute) =>
    set({
      currentRoute,
      destination: currentRoute?.to ?? null,
    }),

  setRouteCoordinates: (currentRouteCoordinates) => set({ currentRouteCoordinates }),

  setUserLocation: (userLocation) => set({ userLocation }),

  setDestination: (destination) => set({ destination }),

  setRouteProgress: (update) => set(update),

  syncProgressFromGps: (location) => {
    const state = get()
    if (!isNavigationActive(state.navigationMode)) return

    set({ userLocation: location })

    const route = state.currentRouteCoordinates
    if (route.length < 2) return

    const projection = projectOntoRoute(location, route)
    const nextDistance = Math.max(
      state.routeProgressDistanceM,
      projection.distanceAlongM,
    )

    set({
      routeProgressDistanceM: nextDistance,
      vehiclePosition: getPositionAtDistance(route, nextDistance),
      vehicleBearing: getBearingAtDistance(route, nextDistance),
      currentRouteIndex: getIndexAtDistance(route, nextDistance),
      progressPercentage:
        getTotalRouteDistanceMeters(route) > 0
          ? (nextDistance / getTotalRouteDistanceMeters(route)) * 100
          : 0,
      distanceRemainingKm:
        (getTotalRouteDistanceMeters(route) - nextDistance) / 1000,
    })
  },

  advanceSimulation: (distanceMeters) => {
    const state = get()
    if (state.navigationMode !== "active") return

    const route = state.currentRouteCoordinates
    if (route.length < 2) return

    const totalDistanceM = getTotalRouteDistanceMeters(route)
    const nextDistance = Math.min(
      state.routeProgressDistanceM + distanceMeters,
      totalDistanceM,
    )

    set({
      routeProgressDistanceM: nextDistance,
      vehiclePosition: getPositionAtDistance(route, nextDistance),
      vehicleBearing: getBearingAtDistance(route, nextDistance),
      currentRouteIndex: getIndexAtDistance(route, nextDistance),
      progressPercentage:
        totalDistanceM > 0 ? (nextDistance / totalDistanceM) * 100 : 0,
      distanceRemainingKm: (totalDistanceM - nextDistance) / 1000,
    })
  },

  pauseFollow: () => {
    if (get().navigationMode === "active") {
      set({ navigationMode: "paused" })
    }
  },

  resumeFollow: () => {
    if (get().navigationMode === "paused") {
      set({ navigationMode: "active" })
    }
  },

  setFullscreen: (isNavigationFullscreen) => set({ isNavigationFullscreen }),

  startNavigation: ({
    route,
    routeCoordinates,
    routeDurationSeconds = null,
    userLocation,
    fullscreen = false,
  }) => {
    const resolvedCoordinates =
      routeCoordinates && routeCoordinates.length >= 2
        ? routeCoordinates
        : buildRouteCoordinates(route.from, route.to)
    const start = userLocation ?? route.from
    const progress = createInitialProgress(resolvedCoordinates, start)

    set({
      navigationMode: "active",
      currentRoute: route,
      destination: route.to,
      userLocation: start,
      isNavigationFullscreen: fullscreen,
      routeDurationSeconds,
      ...progress,
    })
  },

  exitNavigation: () =>
    set({
      navigationMode: "idle",
      isNavigationFullscreen: false,
      currentRoute: null,
      currentRouteCoordinates: [],
      currentRouteIndex: 0,
      progressPercentage: 0,
      routeProgressDistanceM: 0,
      distanceRemainingKm: null,
      routeDurationSeconds: null,
      userLocation: null,
      vehiclePosition: null,
      vehicleBearing: 0,
      destination: null,
    }),
}))

export function isNavigationFollowing(navigationMode: NavigationMode): boolean {
  return navigationMode === "active"
}

export function isNavigationActive(navigationMode: NavigationMode): boolean {
  return navigationMode === "active" || navigationMode === "paused"
}
