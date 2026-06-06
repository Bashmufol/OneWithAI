import type { StationStatus } from "@evocharge/types"

import {
  getStationEvoScore,
  type StationWithEvoScore,
} from "@/lib/evoscore"
import { formatDistanceKm as formatDistanceKmBase, getDistance } from "@/lib/distance"

export type NearbyStation = StationWithEvoScore & {
  distanceKm: number
}

const STATUS_PRIORITY: Record<StationStatus, number> = {
  available: 0,
  busy: 1,
  offline: 2,
}

export function sortNearbyStations(
  stations: StationWithEvoScore[],
  userLat: number,
  userLng: number,
): NearbyStation[] {
  return stations
    .map((station) => ({
      ...station,
      distanceKm: getDistance(
        userLat,
        userLng,
        station.location.lat,
        station.location.lng,
      ),
    }))
    .sort((left, right) => {
      const statusDiff =
        STATUS_PRIORITY[left.status] - STATUS_PRIORITY[right.status]

      if (
        statusDiff !== 0 &&
        left.distanceKm < 8 &&
        right.distanceKm < 8
      ) {
        return statusDiff
      }

      const distanceDiff = left.distanceKm - right.distanceKm
      if (Math.abs(distanceDiff) > 0.4) {
        return distanceDiff
      }

      return right.evoScoreDetail.score - left.evoScoreDetail.score
    })
}

export function getBestNearbyStation(
  stations: StationWithEvoScore[],
  userLat: number,
  userLng: number,
): NearbyStation | null {
  const sorted = sortNearbyStations(stations, userLat, userLng)
  return sorted[0] ?? null
}

export function buildNearbyRecommendationReason(
  station: NearbyStation,
): string {
  const evoScore = getStationEvoScore(station)

  return `${station.name} is ${station.distanceKm.toFixed(1)} km away, currently ${station.status}, with EvoScore ${evoScore.score} (${evoScore.label}).`
}

export function formatDistanceKm(distance: number): string {
  return formatDistanceKmBase(distance)
}
