import { getDistance } from "@/lib/distance"
import type { StationWithEvoScore } from "@/lib/evoscore"
import type { DemandPoint } from "@/lib/demandEngine"

export type RouteMode = "emergency" | "conservative" | "normal"

export interface GeoPoint {
  lat: number
  lng: number
  label: string
}

export interface ChargingRouteInput {
  origin: GeoPoint
  destination: GeoPoint
  batteryLevel: number
  stations: StationWithEvoScore[]
  demandPoints?: DemandPoint[]
}

export interface ChargingRouteResult {
  recommendedStations: StationWithEvoScore[]
  reason: string[]
  mode: RouteMode
}

export const distanceKm = getDistance

export function getRouteMode(batteryLevel: number): RouteMode {
  if (batteryLevel < 20) return "emergency"
  if (batteryLevel <= 50) return "conservative"
  return "normal"
}

function getMaxDetourKm(mode: RouteMode): number {
  switch (mode) {
    case "emergency":
      return 8
    case "conservative":
      return 14
    case "normal":
      return 22
  }
}

function getStationLimit(mode: RouteMode): number {
  switch (mode) {
    case "emergency":
      return 1
    case "conservative":
      return 2
    case "normal":
      return 1
  }
}

function getNearbyDemandIntensity(
  station: StationWithEvoScore,
  demandPoints: DemandPoint[],
): number {
  if (demandPoints.length === 0) return 0

  let nearestIntensity = 0
  let nearestDistance = Number.POSITIVE_INFINITY

  for (const point of demandPoints) {
    const distance = distanceKm(
      station.location.lat,
      station.location.lng,
      point.lat,
      point.lng,
    )

    if (distance < nearestDistance) {
      nearestDistance = distance
      nearestIntensity = point.intensity
    }
  }

  if (nearestDistance > 0.02) {
    return nearestIntensity * 0.35
  }

  return nearestIntensity
}

function scoreStation(
  station: StationWithEvoScore,
  input: ChargingRouteInput,
  mode: RouteMode,
): number {
  if (station.status === "offline") return Number.NEGATIVE_INFINITY

  const directDistance = distanceKm(
    input.origin.lat,
    input.origin.lng,
    input.destination.lat,
    input.destination.lng,
  )
  const detour =
    distanceKm(
      input.origin.lat,
      input.origin.lng,
      station.location.lat,
      station.location.lng,
    ) +
    distanceKm(
      station.location.lat,
      station.location.lng,
      input.destination.lat,
      input.destination.lng,
    ) -
    directDistance

  const maxDetour = getMaxDetourKm(mode)
  if (detour > maxDetour) return Number.NEGATIVE_INFINITY

  const evoScorePoints = station.evoScoreDetail.score * 0.45

  let availabilityPoints = 0
  if (station.status === "available") {
    availabilityPoints = 32
  } else if (station.status === "busy") {
    if (mode === "emergency") return Number.NEGATIVE_INFINITY
    availabilityPoints = mode === "conservative" ? 4 : 12
  }

  const distancePoints = (1 - Math.max(0, detour) / maxDetour) * 22
  const demandPenalty =
    getNearbyDemandIntensity(station, input.demandPoints ?? []) *
    (mode === "conservative" ? 14 : 8)

  return evoScorePoints + availabilityPoints + distancePoints - demandPenalty
}

function buildReasons(
  mode: RouteMode,
  stations: StationWithEvoScore[],
  batteryLevel: number,
  adapted: boolean,
): string[] {
  const reasons = [
    `Battery at ${batteryLevel}% — ${mode} routing mode active`,
    "Ranked by EvoScore, availability, route detour, and demand pressure",
    "Offline stations excluded from all routes",
  ]

  if (mode === "emergency") {
    reasons.push("Emergency mode: only available stations within short detour")
  } else if (mode === "conservative") {
    reasons.push("Conservative mode: prioritizes available stops with low detour")
  } else {
    reasons.push("Normal mode: balances EvoScore quality with flexible detour")
  }

  if (stations.length > 0) {
    reasons.push(
      `Primary stop: ${stations[0].name} (EvoScore ${stations[0].evoScoreDetail.score})`,
    )
  }

  if (adapted) {
    reasons.push("Route recomputed due to live status or demand shift")
  }

  return reasons
}

export function getBestChargingStops(
  input: ChargingRouteInput,
  options?: { previousStationIds?: string[] },
): ChargingRouteResult {
  const mode = getRouteMode(input.batteryLevel)
  const limit = getStationLimit(mode)

  const ranked = input.stations
    .map((station) => ({
      station,
      score: scoreStation(station, input, mode),
    }))
    .filter((entry) => entry.score > Number.NEGATIVE_INFINITY)
    .sort((left, right) => {
      if (right.score !== left.score) return right.score - left.score
      return right.station.evoScoreDetail.score - left.station.evoScoreDetail.score
    })

  const recommendedStations = ranked.slice(0, limit).map((entry) => entry.station)

  const previousIds = options?.previousStationIds ?? []
  const adapted =
    previousIds.length > 0 &&
    (recommendedStations.length === 0 ||
      recommendedStations[0]?.id !== previousIds[0])

  if (recommendedStations.length === 0) {
    return {
      recommendedStations: [],
      mode,
      reason: [
        `Battery at ${input.batteryLevel}% — ${mode} routing mode active`,
        "No suitable charging stops found on this corridor",
        "Try lowering detour constraints or wait for availability updates",
      ],
    }
  }

  return {
    recommendedStations,
    mode,
    reason: buildReasons(mode, recommendedStations, input.batteryLevel, adapted),
  }
}

export function buildRoutePath(
  origin: GeoPoint,
  destination: GeoPoint,
  stations: StationWithEvoScore[],
): [number, number][] {
  const orderedStations = [...stations].sort(
    (left, right) =>
      distanceKm(
        origin.lat,
        origin.lng,
        left.location.lat,
        left.location.lng,
      ) -
      distanceKm(
        origin.lat,
        origin.lng,
        right.location.lat,
        right.location.lng,
      ),
  )

  return [
    [origin.lat, origin.lng],
    ...orderedStations.map(
      (station) =>
        [station.location.lat, station.location.lng] as [number, number],
    ),
    [destination.lat, destination.lng],
  ]
}
