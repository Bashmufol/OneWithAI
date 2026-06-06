import type { LatLngTuple, Map as LeafletMap } from "leaflet"

import { isMapContainerReady } from "@/lib/mapReady"
import { offsetCoordinate } from "@/lib/routeProgress"
import type { NavCoords } from "@/types/navigation"

export interface NavigationFollowController {
  stop: () => void
  recenter: () => void
}

const CAMERA_FORWARD_OFFSET_M = 85
const CAMERA_PAN_DURATION = 0.55

function isValidCoords(coords: NavCoords | null | undefined): coords is NavCoords {
  return Boolean(
    coords &&
      Number.isFinite(coords.lat) &&
      Number.isFinite(coords.lng) &&
      Math.abs(coords.lat) <= 90 &&
      Math.abs(coords.lng) <= 180,
  )
}

function isValidLatLngTuple(position: LatLngTuple | null | undefined): position is LatLngTuple {
  if (!position || position.length < 2) return false
  const [lat, lng] = position
  return (
    Number.isFinite(lat) &&
    Number.isFinite(lng) &&
    Math.abs(lat) <= 90 &&
    Math.abs(lng) <= 180
  )
}

export function enableNavigationFollow(
  map: LeafletMap,
  getFollowTarget: () => { position: LatLngTuple; bearing: number } | null,
  onUserInteraction: () => void,
): NavigationFollowController {
  if (!isMapContainerReady(map)) {
    return {
      stop: () => undefined,
      recenter: () => undefined,
    }
  }

  const stopInteractionWatch = () => {
    map.off("dragstart", handleInteractionStart)
    map.off("zoomstart", handleInteractionStart)
    map.off("moveend", handleInteractionEnd)
  }

  const handleInteractionStart = () => {
    onUserInteraction()
  }

  const handleInteractionEnd = () => {
    window.setTimeout(() => {
      /* allow follow resume after gesture ends */
    }, 800)
  }

  map.on("dragstart", handleInteractionStart)
  map.on("zoomstart", handleInteractionStart)
  map.on("moveend", handleInteractionEnd)

  const flyToTarget = (zoom?: number) => {
    if (!isMapContainerReady(map)) return

    const target = getFollowTarget()
    if (!target || !isValidLatLngTuple(target.position)) return

    map.flyTo(target.position, zoom ?? Math.max(map.getZoom(), 15), {
      animate: true,
      duration: 0.85,
      easeLinearity: 0.25,
    })
  }

  const recenter = () => {
    flyToTarget()
  }

  return {
    stop: stopInteractionWatch,
    recenter,
  }
}

export function getCameraFollowTarget(
  vehiclePosition: NavCoords,
  bearing: number,
): { position: LatLngTuple; bearing: number } {
  const offset = offsetCoordinate(
    vehiclePosition,
    bearing,
    CAMERA_FORWARD_OFFSET_M,
  )

  return {
    position: [offset.lat, offset.lng],
    bearing,
  }
}

export function panMapToVehicle(
  map: LeafletMap,
  vehiclePosition: NavCoords,
  bearing: number,
) {
  if (!isMapContainerReady(map)) return
  if (!isValidCoords(vehiclePosition)) return

  const target = getCameraFollowTarget(vehiclePosition, bearing)
  if (!isValidLatLngTuple(target.position)) return

  map.panTo(target.position, {
    animate: true,
    duration: CAMERA_PAN_DURATION,
    easeLinearity: 0.18,
    noMoveStart: true,
  })
}
