import type { LatLngTuple } from "leaflet"
import L from "leaflet"
import { useEffect, useRef } from "react"
import { useMap } from "react-leaflet"

import {
  removeProgressRouteLayer,
  updateProgressRouteLayer,
  type ProgressRouteLayerHandle,
} from "@/components/map/RouteLayer"
import { splitRouteAtProgress } from "@/lib/routeProgress"
import {
  isNavigationActive,
  useNavigationStore,
} from "@/store/navigationStore"

function toLatLngTuples(
  coordinates: { lat: number; lng: number }[],
): LatLngTuple[] {
  return coordinates.map((point) => [point.lat, point.lng])
}

export function NavigationRouteOverlay() {
  const map = useMap()
  const navigationMode = useNavigationStore((state) => state.navigationMode)
  const routeCoordinates = useNavigationStore(
    (state) => state.currentRouteCoordinates,
  )
  const routeProgressDistanceM = useNavigationStore(
    (state) => state.routeProgressDistanceM,
  )
  const destination = useNavigationStore((state) => state.destination)
  const layerRef = useRef<ProgressRouteLayerHandle | null>(null)
  const destinationMarkerRef = useRef<L.CircleMarker | null>(null)

  useEffect(() => {
    destinationMarkerRef.current?.remove()
    destinationMarkerRef.current = null
    removeProgressRouteLayer(map, layerRef.current)
    layerRef.current = null

    if (!isNavigationActive(navigationMode) || routeCoordinates.length < 2) {
      return
    }

    const { passed, upcoming } = splitRouteAtProgress(
      routeCoordinates,
      routeProgressDistanceM,
    )

    layerRef.current = updateProgressRouteLayer(
      map,
      null,
      toLatLngTuples(passed),
      toLatLngTuples(upcoming),
    )

    if (destination) {
      destinationMarkerRef.current = L.circleMarker(
        [destination.lat, destination.lng],
        {
          radius: 8,
          color: "#a78bfa",
          fillColor: "#a78bfa",
          fillOpacity: 0.9,
          weight: 2,
        },
      ).addTo(map)
    }

    return () => {
      removeProgressRouteLayer(map, layerRef.current)
      layerRef.current = null
      destinationMarkerRef.current?.remove()
      destinationMarkerRef.current = null
    }
  }, [destination, map, navigationMode, routeCoordinates, routeProgressDistanceM])

  useEffect(() => {
    if (!layerRef.current || routeCoordinates.length < 2) return

    const { passed, upcoming } = splitRouteAtProgress(
      routeCoordinates,
      routeProgressDistanceM,
    )

    layerRef.current.passed.setLatLngs(toLatLngTuples(passed))
    layerRef.current.upcoming.setLatLngs(toLatLngTuples(upcoming))
  }, [routeCoordinates, routeProgressDistanceM])

  return null
}
