import { getDistance } from "@/lib/distance"
import { buildRouteCoordinates } from "@/lib/routeProgress"

export interface RoutePoint {
  lat: number
  lng: number
}

export type RouteGeometrySource = "osrm" | "fallback"

export interface RoadRouteResult {
  coordinates: RoutePoint[]
  distanceMeters: number
  durationSeconds: number
  source: RouteGeometrySource
}

interface OsrmGeoJsonGeometry {
  type: "LineString"
  coordinates: [number, number][]
}

interface OsrmRouteResponse {
  code: string
  routes?: Array<{
    distance: number
    duration: number
    geometry: OsrmGeoJsonGeometry
  }>
}

const OSRM_BASE_URL = "https://router.project-osrm.org/route/v1/driving"

function estimateStraightLineDurationSeconds(distanceMeters: number): number {
  const averageSpeedMps = 12.5
  return distanceMeters / averageSpeedMps
}

function createFallbackRoute(
  start: RoutePoint,
  destination: RoutePoint,
): RoadRouteResult {
  const coordinates = buildRouteCoordinates(start, destination)
  const distanceMeters =
    getDistance(start.lat, start.lng, destination.lat, destination.lng) * 1000

  return {
    coordinates,
    distanceMeters,
    durationSeconds: estimateStraightLineDurationSeconds(distanceMeters),
    source: "fallback",
  }
}

function parseOsrmCoordinates(geometry: OsrmGeoJsonGeometry): RoutePoint[] {
  return geometry.coordinates.map(([lng, lat]) => ({ lat, lng }))
}

export async function getRoadRoute(
  start: RoutePoint,
  destination: RoutePoint,
): Promise<RoadRouteResult> {
  if (
    !Number.isFinite(start.lat) ||
    !Number.isFinite(start.lng) ||
    !Number.isFinite(destination.lat) ||
    !Number.isFinite(destination.lng)
  ) {
    console.warn("[routeService] Invalid coordinates, using fallback route")
    return createFallbackRoute(start, destination)
  }

  const url = `${OSRM_BASE_URL}/${start.lng},${start.lat};${destination.lng},${destination.lat}?overview=full&geometries=geojson`

  try {
    const response = await fetch(url)
    if (!response.ok) {
      throw new Error(`OSRM responded with ${response.status}`)
    }

    const data = (await response.json()) as OsrmRouteResponse
    const route = data.routes?.[0]

    if (data.code !== "Ok" || !route?.geometry?.coordinates?.length) {
      throw new Error("OSRM returned no route geometry")
    }

    return {
      coordinates: parseOsrmCoordinates(route.geometry),
      distanceMeters: route.distance,
      durationSeconds: route.duration,
      source: "osrm",
    }
  } catch (error) {
    console.warn("[routeService] OSRM failed, using straight-line fallback", error)
    return createFallbackRoute(start, destination)
  }
}

export function buildRouteGeometryKey(from: RoutePoint, to: RoutePoint): string {
  return `${from.lat.toFixed(6)},${from.lng.toFixed(6)}|${to.lat.toFixed(6)},${to.lng.toFixed(6)}`
}
