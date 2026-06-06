import type { Station } from "@evocharge/types"

/** Leaflet uses [latitude, longitude] */
export const NIGERIA_CENTER: [number, number] = [9.082, 8.6753]

/** Legacy Lagos reference for city-specific examples */
export const LAGOS_CENTER: [number, number] = [6.5244, 3.3792]

export const DEFAULT_MAP_CENTER = NIGERIA_CENTER

export const DEFAULT_MAP_ZOOM = 7

/** Zoom when centered on a user's live GPS position */
export const LOCAL_MAP_ZOOM = 12

export const DARK_TILE_URL =
  "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"

export const TILE_ATTRIBUTION =
  '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>'

export interface MapBounds {
  north: number
  south: number
  east: number
  west: number
}

export function isStationInBounds(station: Station, bounds: MapBounds): boolean {
  const { lat, lng } = station.location
  return (
    lat <= bounds.north &&
    lat >= bounds.south &&
    lng <= bounds.east &&
    lng >= bounds.west
  )
}

export function filterStationsByBounds(
  stations: Station[],
  bounds: MapBounds,
): Station[] {
  return stations.filter((station) => isStationInBounds(station, bounds))
}

export const STATUS_MARKER_CLASSES = {
  available: "station-marker-dot--available",
  busy: "station-marker-dot--busy",
  offline: "station-marker-dot--offline",
} as const
