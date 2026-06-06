import type { StationWithEvoScore } from "@/lib/evoscore"

export type AdvisorIntent =
  | "low_battery"
  | "nearest"
  | "best"
  | "route_based"
  | "general"

export type MapCoords = {
  lat: number
  lng: number
}

export type ActiveRoute = {
  from: MapCoords
  to: MapCoords
}

export interface AdvisorInput {
  query: string
  stations: StationWithEvoScore[]
  userLocation: MapCoords
  batteryLevel: number
  activeRoute: ActiveRoute | null
  usingFallbackLocation?: boolean
}

export interface AdvisorContext {
  query: string
  intent: AdvisorIntent
  stations: StationWithEvoScore[]
  userLocation: MapCoords
  batteryLevel: number
  activeRoute: ActiveRoute | null
  usingFallbackLocation: boolean
}

export type RankedStation = StationWithEvoScore & {
  distanceKm: number
  finalScore: number
}

export interface StationReasoning {
  name: string
  reason: string[]
}

export interface AdvisorResponse {
  intent: AdvisorIntent
  title: string
  topStations: RankedStation[]
  reasoning: StationReasoning[]
}
