import L from "leaflet"
import "leaflet-polylinedecorator"
import type { LatLngExpression, LatLngTuple } from "leaflet"

export const ROUTE_COLOR = "#22d3ee"
export const ROUTE_PASSED_COLOR = "#64748b"
export const ROUTE_WEIGHT = 5
export const ROUTE_PASSED_WEIGHT = 4
export const ROUTE_OPACITY = 0.95
export const ROUTE_PASSED_OPACITY = 0.35

export interface RouteLayerHandle {
  polyline: L.Polyline
  decorator?: L.Layer
}

export interface ProgressRouteLayerHandle {
  passed: L.Polyline
  upcoming: L.Polyline
  decorator: L.Layer
}

export function toRoutePositions(
  from: { lat: number; lng: number },
  to: { lat: number; lng: number },
): LatLngTuple[] {
  return [
    [from.lat, from.lng],
    [to.lat, to.lng],
  ]
}

export function getRouteMidpoint(positions: LatLngTuple[]): LatLngTuple {
  if (positions.length === 0) {
    return [0, 0]
  }

  if (positions.length === 1) {
    return positions[0]
  }

  const [start, end] = [positions[0], positions.at(-1)!]
  return [(start[0] + end[0]) / 2, (start[1] + end[1]) / 2]
}

export function createRouteLayer(
  map: L.Map,
  positions: LatLngExpression[],
): RouteLayerHandle {
  const polyline = L.polyline(positions, {
    color: ROUTE_COLOR,
    weight: ROUTE_WEIGHT,
    opacity: ROUTE_OPACITY,
    lineCap: "round",
    lineJoin: "round",
    className: "intent-route-line route-navigation-line route-upcoming-line",
  })

  const decorator = L.polylineDecorator(polyline, {
    patterns: [
      {
        offset: 24,
        repeat: 72,
        symbol: L.Symbol.arrowHead({
          pixelSize: 11,
          polygon: false,
          pathOptions: {
            stroke: true,
            weight: 2,
            color: ROUTE_COLOR,
            opacity: 0.85,
            className: "route-direction-arrow",
          },
        }),
      },
    ],
  })

  polyline.addTo(map)
  decorator.addTo(map)

  return { polyline, decorator }
}

export function createProgressRouteLayer(
  map: L.Map,
  passedPositions: LatLngExpression[],
  upcomingPositions: LatLngExpression[],
): ProgressRouteLayerHandle {
  const passed =
    passedPositions.length >= 2
      ? L.polyline(passedPositions, {
          color: ROUTE_PASSED_COLOR,
          weight: ROUTE_PASSED_WEIGHT,
          opacity: ROUTE_PASSED_OPACITY,
          lineCap: "round",
          lineJoin: "round",
          className: "route-passed-line",
        }).addTo(map)
      : L.polyline([], { opacity: 0 }).addTo(map)

  const upcoming =
    upcomingPositions.length >= 2
      ? L.polyline(upcomingPositions, {
          color: ROUTE_COLOR,
          weight: ROUTE_WEIGHT,
          opacity: ROUTE_OPACITY,
          lineCap: "round",
          lineJoin: "round",
          className: "route-navigation-line route-upcoming-line",
        }).addTo(map)
      : L.polyline([], { opacity: 0 }).addTo(map)

  const decorator = L.polylineDecorator(upcoming, {
    patterns: [
      {
        offset: 24,
        repeat: 72,
        symbol: L.Symbol.arrowHead({
          pixelSize: 11,
          polygon: false,
          pathOptions: {
            stroke: true,
            weight: 2,
            color: ROUTE_COLOR,
            opacity: 0.85,
            className: "route-direction-arrow",
          },
        }),
      },
    ],
  }).addTo(map)

  return { passed, upcoming, decorator }
}

export function updateProgressRouteLayer(
  map: L.Map,
  handle: ProgressRouteLayerHandle | null,
  passedPositions: LatLngExpression[],
  upcomingPositions: LatLngExpression[],
): ProgressRouteLayerHandle {
  if (handle) {
    removeProgressRouteLayer(map, handle)
  }

  return createProgressRouteLayer(map, passedPositions, upcomingPositions)
}

export function removeProgressRouteLayer(
  map: L.Map,
  handle: ProgressRouteLayerHandle | null,
) {
  if (!handle) return

  map.removeLayer(handle.decorator)
  map.removeLayer(handle.upcoming)
  map.removeLayer(handle.passed)
}

export function updateRouteLayer(
  map: L.Map,
  handle: RouteLayerHandle | null,
  positions: LatLngExpression[],
): RouteLayerHandle {
  if (handle) {
    removeRouteLayer(map, handle)
  }

  return createRouteLayer(map, positions)
}

export function removeRouteLayer(map: L.Map, handle: RouteLayerHandle | null) {
  if (!handle) return

  if (handle.decorator) {
    map.removeLayer(handle.decorator)
  }
  map.removeLayer(handle.polyline)
}
