import {
  getEvoScoreTier,
  getStationDemandPressure,
  getStationEvoScore,
  getStationReliabilityPercent,
  sortStationsByEvoScore,
  type EvoScoreTier,
  type StationWithEvoScore,
} from "@/lib/evoscore"

export interface EvoScoreDistribution {
  excellent: number
  good: number
  fair: number
  poor: number
  total: number
}

export interface EvoScoreComparison {
  station: StationWithEvoScore
  evoScore: ReturnType<typeof getStationEvoScore>
  reliabilityPercent: number
  demandPressure: ReturnType<typeof getStationDemandPressure>
  summary: string
}

const TIER_LABELS: Record<EvoScoreTier, string> = {
  excellent: "Excellent (80–100)",
  good: "Good (60–79)",
  fair: "Fair (40–59)",
  poor: "Poor (<40)",
}

export function getTierLabel(tier: EvoScoreTier): string {
  return TIER_LABELS[tier]
}

export function getEvoScoreDistribution(
  stations: StationWithEvoScore[],
): EvoScoreDistribution {
  const distribution: EvoScoreDistribution = {
    excellent: 0,
    good: 0,
    fair: 0,
    poor: 0,
    total: stations.length,
  }

  for (const station of stations) {
    const tier = getEvoScoreTier(station.evoScoreDetail.score)
    distribution[tier] += 1
  }

  return distribution
}

export function buildEvoScoreComparisons(
  stations: StationWithEvoScore[],
  limit = 3,
): EvoScoreComparison[] {
  return sortStationsByEvoScore(stations)
    .slice(0, limit)
    .map((station) => {
      const evoScore = getStationEvoScore(station)
      const reliabilityPercent = getStationReliabilityPercent(station)
      const demandPressure = getStationDemandPressure(station)

      return {
        station,
        evoScore,
        reliabilityPercent,
        demandPressure,
        summary: `${station.name} leads with EvoScore ${evoScore.score} thanks to ${station.status} status and ${demandPressure} demand pressure.`,
      }
    })
}
