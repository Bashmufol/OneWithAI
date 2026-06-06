import { isStationOnRoute } from "@/lib/advisor/rankStations"
import type { AdvisorContext, AdvisorIntent, RankedStation } from "@/lib/advisor/types"

const TOP_LIMIT = 3

export function applyPolicy(
  intent: AdvisorIntent,
  rankedStations: RankedStation[],
  context: AdvisorContext,
): RankedStation[] {
  switch (intent) {
    case "low_battery":
      return rankedStations
        .filter((station) => station.status !== "offline")
        .slice(0, TOP_LIMIT)

    case "nearest":
      return [...rankedStations]
        .sort((left, right) => left.distanceKm - right.distanceKm)
        .slice(0, TOP_LIMIT)

    case "best":
      return rankedStations.slice(0, TOP_LIMIT)

    case "route_based": {
      const routePool = context.activeRoute
        ? rankedStations.filter((station) =>
            isStationOnRoute(station, context.activeRoute!),
          )
        : rankedStations

      return (routePool.length > 0 ? routePool : rankedStations).slice(
        0,
        TOP_LIMIT,
      )
    }

    case "general":
    default:
      return rankedStations.slice(0, TOP_LIMIT)
  }
}
