import type { Station } from "@evocharge/types"

import type { StationWithEvoScore } from "@/lib/evoscore"

const EARTH_RADIUS_KM = 6371

export function getDistance(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number,
): number {
  const toRadians = (value: number) => (value * Math.PI) / 180
  const dLat = toRadians(lat2 - lat1)
  const dLng = toRadians(lng2 - lng1)
  const originLat = toRadians(lat1)
  const targetLat = toRadians(lat2)

  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(originLat) * Math.cos(targetLat) * Math.sin(dLng / 2) ** 2

  return EARTH_RADIUS_KM * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

export function formatDistanceKm(distanceKm: number): string {
  if (distanceKm < 1) {
    return `${Math.round(distanceKm * 1000)} m`
  }

  if (distanceKm >= 100) {
    return `~${Math.round(distanceKm)} km`
  }

  return `${distanceKm.toFixed(1)} km`
}

export function formatDistanceLabel(
  distanceKm: number,
  options?: { approximate?: boolean },
): string {
  const formatted = formatDistanceKm(distanceKm)
  if (options?.approximate) {
    return `~${formatted.replace(/^~/, "")} away`
  }

  return `${formatted} away`
}

export type StationWithDistance<T extends Station = Station> = T & {
  distanceKm: number
}

export function withDistanceFrom<T extends Station>(
  station: T,
  userLat: number,
  userLng: number,
): StationWithDistance<T> {
  return {
    ...station,
    distanceKm: getDistance(
      userLat,
      userLng,
      station.location.lat,
      station.location.lng,
    ),
  }
}

export function sortStationsByDistance<T extends Station>(
  stations: T[],
  userLat: number,
  userLng: number,
): StationWithDistance<T>[] {
  return stations
    .map((station) => withDistanceFrom(station, userLat, userLng))
    .sort((left, right) => left.distanceKm - right.distanceKm)
}

export function sortByDistanceThenEvoScore(
  stations: StationWithEvoScore[],
  userLat: number,
  userLng: number,
): StationWithDistance<StationWithEvoScore>[] {
  return sortStationsByDistance(stations, userLat, userLng).sort((left, right) => {
    const distanceGap = left.distanceKm - right.distanceKm
    if (Math.abs(distanceGap) > 0.5) {
      return distanceGap
    }

    return right.evoScoreDetail.score - left.evoScoreDetail.score
  })
}
