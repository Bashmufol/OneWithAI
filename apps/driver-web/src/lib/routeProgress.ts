import { getDistance } from "@/lib/distance"
import type { NavCoords } from "@/types/navigation"

const DEFAULT_ROUTE_SEGMENTS = 80

export interface RouteProjection {
  index: number
  fraction: number
  position: NavCoords
  progressPercentage: number
  distanceAlongM: number
  distanceRemainingKm: number
  bearing: number
}

export function buildRouteCoordinates(
  from: NavCoords,
  to: NavCoords,
  segments = DEFAULT_ROUTE_SEGMENTS,
): NavCoords[] {
  const coordinates: NavCoords[] = []

  for (let index = 0; index <= segments; index += 1) {
    const t = index / segments
    coordinates.push({
      lat: from.lat + (to.lat - from.lat) * t,
      lng: from.lng + (to.lng - from.lng) * t,
    })
  }

  return coordinates
}

export function getSegmentDistanceMeters(from: NavCoords, to: NavCoords): number {
  return getDistance(from.lat, from.lng, to.lat, to.lng) * 1000
}

export function getTotalRouteDistanceMeters(route: NavCoords[]): number {
  if (route.length < 2) return 0

  let total = 0
  for (let index = 0; index < route.length - 1; index += 1) {
    total += getSegmentDistanceMeters(route[index], route[index + 1])
  }
  return total
}

export function getBearing(from: NavCoords, to: NavCoords): number {
  const lat1 = (from.lat * Math.PI) / 180
  const lat2 = (to.lat * Math.PI) / 180
  const dLng = ((to.lng - from.lng) * Math.PI) / 180

  const y = Math.sin(dLng) * Math.cos(lat2)
  const x =
    Math.cos(lat1) * Math.sin(lat2) -
    Math.sin(lat1) * Math.cos(lat2) * Math.cos(dLng)

  return ((Math.atan2(y, x) * 180) / Math.PI + 360) % 360
}

export function offsetCoordinate(
  point: NavCoords,
  bearingDeg: number,
  distanceMeters: number,
): NavCoords {
  const earthRadius = 6378137
  const bearing = (bearingDeg * Math.PI) / 180
  const lat1 = (point.lat * Math.PI) / 180
  const lng1 = (point.lng * Math.PI) / 180
  const angularDistance = distanceMeters / earthRadius

  const lat2 = Math.asin(
    Math.sin(lat1) * Math.cos(angularDistance) +
      Math.cos(lat1) * Math.sin(angularDistance) * Math.cos(bearing),
  )
  const lng2 =
    lng1 +
    Math.atan2(
      Math.sin(bearing) * Math.sin(angularDistance) * Math.cos(lat1),
      Math.cos(angularDistance) - Math.sin(lat1) * Math.sin(lat2),
    )

  return {
    lat: (lat2 * 180) / Math.PI,
    lng: (lng2 * 180) / Math.PI,
  }
}

function projectPointOnSegment(
  point: NavCoords,
  start: NavCoords,
  end: NavCoords,
): { point: NavCoords; fraction: number; distanceToSegmentKm: number } {
  const dx = end.lng - start.lng
  const dy = end.lat - start.lat
  const lengthSquared = dx * dx + dy * dy

  if (lengthSquared === 0) {
    return {
      point: start,
      fraction: 0,
      distanceToSegmentKm: getDistance(
        point.lat,
        point.lng,
        start.lat,
        start.lng,
      ),
    }
  }

  const t = Math.max(
    0,
    Math.min(
      1,
      ((point.lng - start.lng) * dx + (point.lat - start.lat) * dy) /
        lengthSquared,
    ),
  )

  const projected = {
    lat: start.lat + dy * t,
    lng: start.lng + dx * t,
  }

  return {
    point: projected,
    fraction: t,
    distanceToSegmentKm: getDistance(
      point.lat,
      point.lng,
      projected.lat,
      projected.lng,
    ),
  }
}

export function projectOntoRoute(
  point: NavCoords,
  route: NavCoords[],
): RouteProjection {
  if (route.length === 0) {
    return {
      index: 0,
      fraction: 0,
      position: point,
      progressPercentage: 0,
      distanceAlongM: 0,
      distanceRemainingKm: 0,
      bearing: 0,
    }
  }

  if (route.length === 1) {
    return {
      index: 0,
      fraction: 0,
      position: route[0],
      progressPercentage: 100,
      distanceAlongM: 0,
      distanceRemainingKm: 0,
      bearing: 0,
    }
  }

  let bestIndex = 0
  let bestFraction = 0
  let bestPoint = route[0]
  let bestDistanceKm = Number.POSITIVE_INFINITY

  for (let index = 0; index < route.length - 1; index += 1) {
    const projection = projectPointOnSegment(point, route[index], route[index + 1])
    if (projection.distanceToSegmentKm < bestDistanceKm) {
      bestDistanceKm = projection.distanceToSegmentKm
      bestIndex = index
      bestFraction = projection.fraction
      bestPoint = projection.point
    }
  }

  let distanceAlongM = 0
  for (let index = 0; index < bestIndex; index += 1) {
    distanceAlongM += getSegmentDistanceMeters(route[index], route[index + 1])
  }
  distanceAlongM += getSegmentDistanceMeters(route[bestIndex], bestPoint)

  const totalDistanceM = getTotalRouteDistanceMeters(route)
  const remainingM = Math.max(0, totalDistanceM - distanceAlongM)
  const nextPoint = route[Math.min(bestIndex + 1, route.length - 1)]
  const bearing = getBearing(bestPoint, nextPoint)

  return {
    index: bestIndex,
    fraction: bestFraction,
    position: bestPoint,
    progressPercentage:
      totalDistanceM > 0 ? (distanceAlongM / totalDistanceM) * 100 : 0,
    distanceAlongM,
    distanceRemainingKm: remainingM / 1000,
    bearing,
  }
}

export function getPositionAtDistance(
  route: NavCoords[],
  distanceMeters: number,
): NavCoords {
  if (route.length === 0) {
    return { lat: 0, lng: 0 }
  }

  if (route.length === 1 || distanceMeters <= 0) {
    return route[0]
  }

  let remaining = distanceMeters

  for (let index = 0; index < route.length - 1; index += 1) {
    const segmentLength = getSegmentDistanceMeters(route[index], route[index + 1])
    if (remaining <= segmentLength) {
      const t = segmentLength === 0 ? 0 : remaining / segmentLength
      return {
        lat: route[index].lat + (route[index + 1].lat - route[index].lat) * t,
        lng: route[index].lng + (route[index + 1].lng - route[index].lng) * t,
      }
    }
    remaining -= segmentLength
  }

  return route.at(-1)!
}

export function getBearingAtDistance(
  route: NavCoords[],
  distanceMeters: number,
): number {
  if (route.length < 2) return 0

  let remaining = distanceMeters

  for (let index = 0; index < route.length - 1; index += 1) {
    const segmentLength = getSegmentDistanceMeters(route[index], route[index + 1])
    if (remaining <= segmentLength) {
      return getBearing(route[index], route[index + 1])
    }
    remaining -= segmentLength
  }

  return getBearing(route.at(-2)!, route.at(-1)!)
}

export function getIndexAtDistance(route: NavCoords[], distanceMeters: number): number {
  if (route.length < 2) return 0

  let remaining = distanceMeters

  for (let index = 0; index < route.length - 1; index += 1) {
    const segmentLength = getSegmentDistanceMeters(route[index], route[index + 1])
    if (remaining <= segmentLength) {
      return index
    }
    remaining -= segmentLength
  }

  return route.length - 2
}

export function splitRouteAtProgress(
  route: NavCoords[],
  distanceMeters: number,
): { passed: NavCoords[]; upcoming: NavCoords[] } {
  if (route.length < 2) {
    return { passed: [], upcoming: route }
  }

  const pivot = getPositionAtDistance(route, distanceMeters)
  const passed: NavCoords[] = []
  let remaining = distanceMeters

  for (let index = 0; index < route.length - 1; index += 1) {
    const segmentLength = getSegmentDistanceMeters(route[index], route[index + 1])
    if (remaining >= segmentLength) {
      passed.push(route[index])
      remaining -= segmentLength
      continue
    }

    passed.push(route[index], pivot)
    return {
      passed,
      upcoming: [pivot, ...route.slice(index + 1)],
    }
  }

  return { passed: route, upcoming: [route.at(-1)!] }
}
