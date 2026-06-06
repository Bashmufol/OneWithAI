import type { LatLngTuple, Map as LeafletMap } from "leaflet"

import { getRouteMidpoint } from "@/components/map/RouteLayer"

export interface RouteFollowController {
  stop: () => void
}

export function enableFollowMode(
  map: LeafletMap,
  route: LatLngTuple[],
): RouteFollowController {
  if (route.length < 2) {
    return { stop: () => undefined }
  }

  const midpoint = getRouteMidpoint(route)
  let followIntervalId: number | null = null
  let isUserInteracting = false

  const stopInteractionWatch = () => {
    map.off("dragstart", handleInteractionStart)
    map.off("zoomstart", handleInteractionStart)
    map.off("moveend", handleInteractionEnd)
  }

  const handleInteractionStart = () => {
    isUserInteracting = true
  }

  const handleInteractionEnd = () => {
    window.setTimeout(() => {
      isUserInteracting = false
    }, 1200)
  }

  map.on("dragstart", handleInteractionStart)
  map.on("zoomstart", handleInteractionStart)
  map.on("moveend", handleInteractionEnd)

  const initialPanId = window.setTimeout(() => {
    map.panTo(midpoint, { animate: true, duration: 0.85, easeLinearity: 0.25 })
  }, 700)

  followIntervalId = window.setInterval(() => {
    if (isUserInteracting) return
    map.panTo(midpoint, { animate: true, duration: 1.1, easeLinearity: 0.2 })
  }, 4500)

  return {
    stop: () => {
      window.clearTimeout(initialPanId)
      if (followIntervalId !== null) {
        window.clearInterval(followIntervalId)
      }
      stopInteractionWatch()
    },
  }
}
