export type NavigationMode = "idle" | "active" | "paused"

export interface NavCoords {
  lat: number
  lng: number
}

export interface NavigationRoute {
  from: NavCoords
  to: NavCoords
  destinationLabel?: string
}
