import type { StationStatus } from "@evocharge/types"

import type { StationWithEvoScore } from "@/lib/evoscore"

export interface DemandPoint {
  lat: number
  lng: number
  intensity: number
}

interface CityHotspot {
  lat: number
  lng: number
  weight: number
}

const CITY_HOTSPOTS: CityHotspot[] = [
  { lat: 6.4281, lng: 3.4214, weight: 0.82 },
  { lat: 6.4474, lng: 3.4703, weight: 0.78 },
  { lat: 6.5244, lng: 3.3792, weight: 0.7 },
  { lat: 6.6018, lng: 3.3515, weight: 0.68 },
  { lat: 6.455, lng: 3.394, weight: 0.74 },
  { lat: 6.4698, lng: 3.5852, weight: 0.62 },
]

function clamp01(value: number): number {
  return Math.min(1, Math.max(0, value))
}

function statusDemandFactor(status: StationStatus): number {
  switch (status) {
    case "busy":
      return 0.88
    case "available":
      return 0.32
    case "offline":
      return 0.08
  }
}

function hashOffset(seed: string, index: number): number {
  let hash = index
  for (let i = 0; i < seed.length; i += 1) {
    hash = (hash * 31 + seed.charCodeAt(i)) >>> 0
  }
  return (hash % 1000) / 1000 - 0.5
}

function countNearbyBusyStations(
  station: StationWithEvoScore,
  stations: StationWithEvoScore[],
): number {
  const radius = 0.025
  return stations.filter((candidate) => {
    if (candidate.id === station.id || candidate.status !== "busy") {
      return false
    }

    const dlat = candidate.location.lat - station.location.lat
    const dlng = candidate.location.lng - station.location.lng
    return Math.sqrt(dlat * dlat + dlng * dlng) <= radius
  }).length
}

export function computeDemandPoints(
  stations: StationWithEvoScore[],
  tick = Date.now(),
): DemandPoint[] {
  if (stations.length === 0) return []

  const points: DemandPoint[] = []
  const busyCount = stations.filter((station) => station.status === "busy").length
  const availabilityRatio =
    stations.filter((station) => station.status === "available").length /
    stations.length

  for (const station of stations) {
    const statusFactor = statusDemandFactor(station.status)
    const clusterBoost = countNearbyBusyStations(station, stations) * 0.06
    const demandPressureBoost =
      station.evoScoreDetail.breakdown.demand < 0 ? 0.12 : 0
    const availabilityBoost = (1 - availabilityRatio) * 0.18

    const intensity = clamp01(
      statusFactor +
        clusterBoost +
        demandPressureBoost +
        availabilityBoost -
        station.evoScoreDetail.breakdown.reliability / 100,
    )

    points.push({
      lat: station.location.lat,
      lng: station.location.lng,
      intensity,
    })

    if (station.status === "busy") {
      for (let index = 0; index < 3; index += 1) {
        points.push({
          lat:
            station.location.lat +
            hashOffset(`${station.id}:lat`, index + tick) * 0.012,
          lng:
            station.location.lng +
            hashOffset(`${station.id}:lng`, index + tick) * 0.012,
          intensity: clamp01(intensity * 0.65),
        })
      }
    }
  }

  for (const [index, hotspot] of CITY_HOTSPOTS.entries()) {
    const wave = Math.sin(tick / 28_000 + index) * 0.07
    const pulse = Math.cos(tick / 19_000 + hotspot.lat) * 0.04
    const hotspotIntensity = clamp01(hotspot.weight + wave + pulse)

    points.push({
      lat: hotspot.lat,
      lng: hotspot.lng,
      intensity: hotspotIntensity,
    })

    for (let spread = 0; spread < 2; spread += 1) {
      points.push({
        lat: hotspot.lat + hashOffset(`hotspot:${index}`, spread) * 0.018,
        lng: hotspot.lng + hashOffset(`hotspot:${index}:lng`, spread) * 0.018,
        intensity: clamp01(hotspotIntensity * 0.55),
      })
    }
  }

  if (busyCount >= 4) {
    const busyCentroid = stations
      .filter((station) => station.status === "busy")
      .reduce(
        (accumulator, station) => ({
          lat: accumulator.lat + station.location.lat,
          lng: accumulator.lng + station.location.lng,
        }),
        { lat: 0, lng: 0 },
      )

    points.push({
      lat: busyCentroid.lat / busyCount,
      lng: busyCentroid.lng / busyCount,
      intensity: clamp01(0.55 + busyCount * 0.04),
    })
  }

  return points
}
