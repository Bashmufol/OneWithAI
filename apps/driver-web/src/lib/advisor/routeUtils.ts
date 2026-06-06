import type { Station } from "@evocharge/types"

import { getDistance } from "@/lib/distance"

export function getDistanceToRouteSegment(
  pointLat: number,
  pointLng: number,
  fromLat: number,
  fromLng: number,
  toLat: number,
  toLng: number,
): number {
  const lat1 = fromLat
  const lng1 = fromLng
  const lat2 = toLat
  const lng2 = toLng

  const dx = lng2 - lng1
  const dy = lat2 - lat1

  if (dx === 0 && dy === 0) {
    return getDistance(pointLat, pointLng, lat1, lng1)
  }

  const t = Math.max(
    0,
    Math.min(
      1,
      ((pointLng - lng1) * dx + (pointLat - lat1) * dy) / (dx * dx + dy * dy),
    ),
  )

  const closestLat = lat1 + t * dy
  const closestLng = lng1 + t * dx

  return getDistance(pointLat, pointLng, closestLat, closestLng)
}

export function isStationOnRoute(
  station: Station,
  route: { from: { lat: number; lng: number }; to: { lat: number; lng: number } },
  thresholdKm = 25,
): boolean {
  const distanceToRoute = getDistanceToRouteSegment(
    station.location.lat,
    station.location.lng,
    route.from.lat,
    route.from.lng,
    route.to.lat,
    route.to.lng,
  )

  return distanceToRoute <= thresholdKm
}
