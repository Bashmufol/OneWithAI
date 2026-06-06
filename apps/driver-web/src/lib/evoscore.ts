import type { Station, StationStatus } from "@evocharge/types"

export type EvoScoreLabel = "Excellent" | "Good" | "Fair" | "Poor"
export type DemandPressure = "low" | "medium" | "high"
export type EvoScoreTone = "excellent" | "good" | "poor"

export interface EvoScoreBreakdown {
  availability: number
  demand: number
  reliability: number
}

export interface EvoScore {
  score: number
  label: EvoScoreLabel
  breakdown: EvoScoreBreakdown
}

export type StationWithEvoScore = Station & {
  evoScoreDetail: EvoScore
}

type StationScoringFields = Station & {
  reliability?: number
  demandPressure?: DemandPressure
}

function stableHash(value: string): number {
  let hash = 0
  for (let index = 0; index < value.length; index += 1) {
    hash = (hash * 31 + value.charCodeAt(index)) >>> 0
  }
  return hash
}

function resolveReliability(station: StationScoringFields): number {
  if (typeof station.reliability === "number") {
    return Math.min(100, Math.max(0, station.reliability))
  }

  return 50 + (stableHash(station.id) % 51)
}

function resolveDemandPressure(station: StationScoringFields): DemandPressure {
  if (station.demandPressure) {
    return station.demandPressure
  }

  const hash = stableHash(`${station.id}:demand`)

  if (station.status === "offline") return "high"
  if (station.status === "busy") {
    return hash % 2 === 0 ? "high" : "medium"
  }

  return (["low", "medium", "high"] as const)[hash % 3]
}

function availabilityPoints(status: StationStatus): number {
  switch (status) {
    case "available":
      return 40
    case "busy":
      return 15
    case "offline":
      return 0
  }
}

function demandPoints(pressure: DemandPressure): number {
  switch (pressure) {
    case "low":
      return 20
    case "medium":
      return 10
    case "high":
      return -10
  }
}

function reliabilityPoints(reliability: number): number {
  return Math.round((reliability / 100) * 30)
}

function getScoreLabel(score: number): EvoScoreLabel {
  if (score >= 80) return "Excellent"
  if (score >= 60) return "Good"
  if (score >= 40) return "Fair"
  return "Poor"
}

export function getEvoScoreTone(score: number): EvoScoreTone {
  if (score >= 80) return "excellent"
  if (score >= 60) return "good"
  return "poor"
}

export function calculateEvoScore(station: Station): EvoScore {
  const scoringStation = station as StationScoringFields
  const reliability = resolveReliability(scoringStation)
  const demandPressure = resolveDemandPressure(scoringStation)

  const breakdown: EvoScoreBreakdown = {
    availability: availabilityPoints(station.status),
    demand: demandPoints(demandPressure),
    reliability: reliabilityPoints(reliability),
  }

  const rawScore =
    breakdown.availability + breakdown.demand + breakdown.reliability
  const score = Math.min(100, Math.max(0, rawScore))

  return {
    score,
    label: getScoreLabel(score),
    breakdown,
  }
}

export function enrichStationWithEvoScore(station: Station): StationWithEvoScore {
  const evoScoreDetail = calculateEvoScore(station)

  return {
    ...station,
    evoScore: evoScoreDetail.score,
    evoScoreDetail,
  }
}

export function enrichStationsWithEvoScore(
  stations: Station[],
): StationWithEvoScore[] {
  return stations.map(enrichStationWithEvoScore)
}

export function compareStationsByEvoScore(
  left: StationWithEvoScore,
  right: StationWithEvoScore,
): number {
  return right.evoScoreDetail.score - left.evoScoreDetail.score
}

export function sortStationsByEvoScore<T extends StationWithEvoScore>(
  stations: T[],
): T[] {
  return [...stations].sort(compareStationsByEvoScore)
}

export function getTopStations<T extends StationWithEvoScore>(
  stations: T[],
  limit = 3,
): T[] {
  return sortStationsByEvoScore(stations).slice(0, limit)
}

export function getStationEvoScore(station: Station): EvoScore {
  const enriched = station as StationWithEvoScore
  return enriched.evoScoreDetail ?? calculateEvoScore(station)
}

export function getStationReliabilityPercent(station: Station): number {
  return resolveReliability(station as StationScoringFields)
}

export function getStationDemandPressure(station: Station): DemandPressure {
  return resolveDemandPressure(station as StationScoringFields)
}

export type EvoScoreTier = "excellent" | "good" | "fair" | "poor"

export function getEvoScoreTier(score: number): EvoScoreTier {
  if (score >= 80) return "excellent"
  if (score >= 60) return "good"
  if (score >= 40) return "fair"
  return "poor"
}

export function getEvoScoreExplanation(station: Station): string {
  const evoScore = getStationEvoScore(station)
  const pressure = getStationDemandPressure(station)
  const reliability = getStationReliabilityPercent(station)

  return `EvoScore ${evoScore.score} (${evoScore.label}) combines ${station.status} availability (+${evoScore.breakdown.availability}), ${pressure} network demand (${evoScore.breakdown.demand >= 0 ? "+" : ""}${evoScore.breakdown.demand}), and ${reliability}% reliability (+${evoScore.breakdown.reliability}).`
}
