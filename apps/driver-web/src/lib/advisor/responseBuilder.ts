import type {
  AdvisorContext,
  AdvisorIntent,
  AdvisorResponse,
  RankedStation,
  StationReasoning,
} from "@/lib/advisor/types"
import { formatDistanceKm } from "@/lib/distance"
import { isStationOnRoute } from "@/lib/advisor/rankStations"
import {
  getStationDemandPressure,
  getStationEvoScore,
} from "@/lib/evoscore"

const TITLE_BY_INTENT: Record<AdvisorIntent, string> = {
  low_battery: "Low Battery Recommendation",
  nearest: "Nearest Charging Stations",
  best: "Best Charging Stations",
  route_based: "Route-Aware Charging Stops",
  general: "Top Charging Recommendations",
}

function buildStationReasons(
  station: RankedStation,
  context: AdvisorContext,
): string[] {
  const evoScore = getStationEvoScore(station)
  const demand = getStationDemandPressure(station)
  const distanceLabel = context.usingFallbackLocation
    ? `~${formatDistanceKm(station.distanceKm)} from Nigeria center fallback`
    : `${formatDistanceKm(station.distanceKm)} from your location`

  const reasons = [
    `Distance: ${distanceLabel}`,
    `Status: ${station.status}`,
    `EvoScore: ${evoScore.score} (${evoScore.label})`,
    `Demand pressure: ${demand}`,
    `Composite score: ${station.finalScore.toFixed(1)}`,
  ]

  if (context.activeRoute && isStationOnRoute(station, context.activeRoute)) {
    reasons.push("On your active route corridor (+20 route bonus applied)")
  }

  if (context.batteryLevel <= 20) {
    reasons.push("Low battery multiplier applied (1.3x urgency weighting)")
  } else if (context.batteryLevel <= 40) {
    reasons.push("Conservative battery multiplier applied (1.1x weighting)")
  }

  return reasons
}

export function buildResponse(
  intent: AdvisorIntent,
  topStations: RankedStation[],
  context: AdvisorContext,
): AdvisorResponse {
  if (topStations.length === 0) {
    return {
      intent,
      title: "No Matching Stations",
      topStations: [],
      reasoning: [
        {
          name: "Network scan",
          reason: [
            "No stations matched the current policy filters.",
            "Try adjusting your query or expanding the map viewport.",
          ],
        },
      ],
    }
  }

  const reasoning: StationReasoning[] = topStations.map((station) => ({
    name: station.name,
    reason: buildStationReasons(station, context),
  }))

  return {
    intent,
    title: TITLE_BY_INTENT[intent],
    topStations,
    reasoning,
  }
}
