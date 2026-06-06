import type { LatLngTuple } from "leaflet"
import L from "leaflet"
import { useEffect, useMemo, useRef } from "react"
import { useMap } from "react-leaflet"

import {
  removeRouteLayer,
  toRoutePositions,
  updateRouteLayer,
  type RouteLayerHandle,
} from "@/components/map/RouteLayer"
import { enableFollowMode } from "@/lib/mapCameraFollow"
import type { MapCoords } from "@/store/mapIntentStore"
import { useMapIntentStore } from "@/store/mapIntentStore"

function resolveDisplayRoute(
  activeRoute: { from: MapCoords; to: MapCoords } | null,
  mode: "focus" | "route" | null,
  routeFrom: MapCoords | undefined,
  routeTo: MapCoords | undefined,
): { from: MapCoords; to: MapCoords } | null {
  if (activeRoute) return activeRoute
  if (mode === "route" && routeFrom && routeTo) {
    return { from: routeFrom, to: routeTo }
  }
  return null
}

export function IntentRouteOverlay() {
  const map = useMap()
  const activeRoute = useMapIntentStore((state) => state.activeRoute)
  const mode = useMapIntentStore((state) => state.mode)
  const routeFrom = useMapIntentStore((state) => state.routeFrom)
  const routeTo = useMapIntentStore((state) => state.routeTo)

  const displayRoute = useMemo(
    () => resolveDisplayRoute(activeRoute, mode, routeFrom, routeTo),
    [activeRoute, mode, routeFrom, routeTo],
  )
  const routeLayerRef = useRef<RouteLayerHandle | null>(null)
  const followControllerRef = useRef<ReturnType<typeof enableFollowMode> | null>(
    null,
  )
  const hasFittedRef = useRef(false)
  const originMarkerRef = useRef<L.CircleMarker | null>(null)
  const destinationMarkerRef = useRef<L.CircleMarker | null>(null)

  useEffect(() => {
    hasFittedRef.current = false
    followControllerRef.current?.stop()
    followControllerRef.current = null
  }, [
    displayRoute?.from.lat,
    displayRoute?.from.lng,
    displayRoute?.to.lat,
    displayRoute?.to.lng,
  ])

  useEffect(() => {
    followControllerRef.current?.stop()
    followControllerRef.current = null

    originMarkerRef.current?.remove()
    destinationMarkerRef.current?.remove()
    originMarkerRef.current = null
    destinationMarkerRef.current = null

    removeRouteLayer(map, routeLayerRef.current)
    routeLayerRef.current = null

    if (!displayRoute) {
      return
    }

    const positions = toRoutePositions(displayRoute.from, displayRoute.to)
    routeLayerRef.current = updateRouteLayer(map, null, positions)

    originMarkerRef.current = L.circleMarker(
      [displayRoute.from.lat, displayRoute.from.lng],
      {
        radius: 7,
        color: "#22d3ee",
        fillColor: "#22d3ee",
        fillOpacity: 0.9,
        weight: 2,
      },
    ).addTo(map)

    destinationMarkerRef.current = L.circleMarker(
      [displayRoute.to.lat, displayRoute.to.lng],
      {
        radius: 8,
        color: "#a78bfa",
        fillColor: "#a78bfa",
        fillOpacity: 0.9,
        weight: 2,
      },
    ).addTo(map)

    if (!hasFittedRef.current) {
      map.fitBounds(positions as LatLngTuple[], {
        padding: [56, 56],
        maxZoom: 14,
      })
      hasFittedRef.current = true
    }

    followControllerRef.current = enableFollowMode(map, positions as LatLngTuple[])

    return () => {
      followControllerRef.current?.stop()
      followControllerRef.current = null
      removeRouteLayer(map, routeLayerRef.current)
      routeLayerRef.current = null
      originMarkerRef.current?.remove()
      destinationMarkerRef.current?.remove()
      originMarkerRef.current = null
      destinationMarkerRef.current = null
    }
  }, [displayRoute, map])

  return null
}
