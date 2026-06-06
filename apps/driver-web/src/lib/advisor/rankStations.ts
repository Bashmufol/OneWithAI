import type { AdvisorContext, RankedStation } from "@/lib/advisor/types"
import { isStationOnRoute } from "@/lib/advisor/routeUtils"
import { getDistance } from "@/lib/distance"
import {
  getStationDemandPressure,
  getStationEvoScore,
  type StationWithEvoScore,
} from "@/lib/evoscore"

function availabilityScore(status: StationWithEvoScore["status"]): number {
  switch (status) {
    case "available":
      return 40
    case "busy":
      return 15
    case "offline":
      return 0
  }
}

function demandScore(station: StationWithEvoScore): number {
  switch (getStationDemandPressure(station)) {
    case "low":
      return 20
    case "medium":
      return 10
    case "high":
      return -10
  }
}

function batteryMultiplier(batteryLevel: number): number {
  if (batteryLevel <= 20) return 1.3
  if (batteryLevel <= 40) return 1.1
  return 1
}

function computeFinalScore(
  station: StationWithEvoScore,
  distanceKm: number,
  context: AdvisorContext,
): number {
  const evoScore = getStationEvoScore(station).score
  const evoComponent = evoScore * 0.4
  const availabilityComponent = availabilityScore(station.status)
  const demandComponent = demandScore(station)
  const distanceComponent = Math.max(0, 100 - Math.min(distanceKm, 100)) * 0.3
  const routeBonus =
    context.activeRoute && isStationOnRoute(station, context.activeRoute) ? 20 : 0

  const baseScore =
    evoComponent +
    availabilityComponent +
    demandComponent +
    distanceComponent +
    routeBonus

  return Number((baseScore * batteryMultiplier(context.batteryLevel)).toFixed(2))
}

export function rankStations(context: AdvisorContext): RankedStation[] {
  const { stations, userLocation } = context

  return stations
    .map((station) => {
      const distanceKm = getDistance(
        userLocation.lat,
        userLocation.lng,
        station.location.lat,
        station.location.lng,
      )

      return {
        ...station,
        distanceKm,
        finalScore: computeFinalScore(station, distanceKm, context),
      }
    })
    .sort((left, right) => right.finalScore - left.finalScore)
}

export { isStationOnRoute }
