import { useMapStore } from "@/components/map/store"
import type { MapCoords, RouteDestination } from "@/store/mapIntentStore"
import { useMapIntentStore } from "@/store/mapIntentStore"

export function requestMapFocus(stationId: string, coords: MapCoords) {
  useMapStore.getState().setSelectedStation(null)
  useMapIntentStore.getState().setFocus(stationId, coords)
}

export function applyRouteDestination(
  from: MapCoords,
  destination: RouteDestination,
) {
  useMapStore.getState().setSelectedStation(null)
  useMapIntentStore.getState().setRouteDestination(destination)
  useMapIntentStore.getState().setRoute(from, {
    lat: destination.lat,
    lng: destination.lng,
  })
}

export function requestMapRoute(from: MapCoords, to: MapCoords) {
  useMapStore.getState().setSelectedStation(null)
  useMapIntentStore.getState().setRoute(from, to)
}

export function requestMapRouteWithDestination(
  from: MapCoords,
  destination: RouteDestination,
) {
  applyRouteDestination(from, destination)
}
