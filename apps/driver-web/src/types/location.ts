export type LocationStatus =
  | "unknown"
  | "loading"
  | "granted"
  | "denied"
  | "fallback"

export type Coordinates = {
  lat: number
  lng: number
}

export interface LocationState {
  status: LocationStatus
  coords: Coordinates | null
  lastKnownCoords: Coordinates | null
  fallbackCoords: Coordinates
}
