import {
  buildRouteGeometryKey,
  getRoadRoute,
  type RouteGeometrySource,
  type RoutePoint,
} from "@/lib/routeService"
import type { MapCoords } from "@/store/mapIntentStore"
import { useMapIntentStore } from "@/store/mapIntentStore"

const inFlightRequests = new Map<string, Promise<MapCoords[]>>()

export async function resolveRoadRouteForIntent(
  from: MapCoords,
  to: MapCoords,
): Promise<MapCoords[]> {
  const key = buildRouteGeometryKey(from, to)
  const store = useMapIntentStore.getState()

  if (
    store.routeGeometryKey === key &&
    store.routeGeometry &&
    store.routeGeometry.length >= 2
  ) {
    return store.routeGeometry
  }

  const existingRequest = inFlightRequests.get(key)
  if (existingRequest) {
    return existingRequest
  }

  const request = (async () => {
    useMapIntentStore.setState({
      isRouteGeometryLoading: true,
      routeGeometryKey: key,
    })

    try {
      const result = await getRoadRoute(from as RoutePoint, to as RoutePoint)
      useMapIntentStore.getState().setRouteGeometry({
        coordinates: result.coordinates,
        distanceMeters: result.distanceMeters,
        durationSeconds: result.durationSeconds,
        source: result.source,
        key,
      })
      return result.coordinates
    } finally {
      useMapIntentStore.setState({ isRouteGeometryLoading: false })
      inFlightRequests.delete(key)
    }
  })()

  inFlightRequests.set(key, request)
  return request
}

export function getStoredRouteGeometry(): MapCoords[] | null {
  return useMapIntentStore.getState().routeGeometry
}

export function getRouteGeometryMeta(): {
  distanceMeters: number | null
  durationSeconds: number | null
  source: RouteGeometrySource | null
} {
  const store = useMapIntentStore.getState()
  return {
    distanceMeters: store.routeDistanceMeters,
    durationSeconds: store.routeDurationSeconds,
    source: store.routeGeometrySource,
  }
}
