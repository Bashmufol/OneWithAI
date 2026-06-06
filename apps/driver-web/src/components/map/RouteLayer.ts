import L from "leaflet"
import "leaflet-polylinedecorator"
import type { LatLngExpression, LatLngTuple } from "leaflet"

export const ROUTE_COLOR = "#22d3ee"
export const ROUTE_WEIGHT = 4.5
export const ROUTE_OPACITY = 0.8

export interface RouteLayerHandle {
  polyline: L.Polyline
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
    className: "intent-route-line route-navigation-line",
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

  map.removeLayer(handle.decorator)
  map.removeLayer(handle.polyline)
}
