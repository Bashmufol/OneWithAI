import type { Station, StationStatus } from "@evocharge/types"

interface CityConfig {
  name: string
  lat: number
  lng: number
  share: number
  jitter: number
  region: string
}

const NIGERIA_CITIES: CityConfig[] = [
  { name: "Lagos", lat: 6.5244, lng: 3.3792, share: 32, jitter: 0.16, region: "Southwest" },
  { name: "Ibadan", lat: 7.3775, lng: 3.947, share: 12, jitter: 0.14, region: "Southwest" },
  { name: "Abeokuta", lat: 7.1608, lng: 3.3515, share: 6, jitter: 0.12, region: "Southwest" },
  { name: "Abuja", lat: 9.0765, lng: 7.3986, share: 12, jitter: 0.14, region: "North Central" },
  { name: "Kano", lat: 12.0022, lng: 8.592, share: 8, jitter: 0.14, region: "North" },
  { name: "Kaduna", lat: 10.5105, lng: 7.4165, share: 6, jitter: 0.13, region: "North" },
  { name: "Jos", lat: 9.8965, lng: 8.8583, share: 5, jitter: 0.12, region: "North" },
  { name: "Port Harcourt", lat: 4.8156, lng: 7.0498, share: 8, jitter: 0.13, region: "South-South" },
  { name: "Warri", lat: 5.516, lng: 5.75, share: 5, jitter: 0.12, region: "South-South" },
  { name: "Benin City", lat: 6.335, lng: 5.6037, share: 6, jitter: 0.12, region: "South-South" },
  { name: "Enugu", lat: 6.4402, lng: 7.4943, share: 6, jitter: 0.12, region: "Southeast" },
  { name: "Owerri", lat: 5.4836, lng: 7.0333, share: 4, jitter: 0.11, region: "Southeast" },
]

const OPERATORS = [
  "EvoCharge",
  "GridPower NG",
  "VoltNG",
  "ChargeNova",
  "PowerRoute NG",
  "GreenCharge Africa",
  "NaijaCharge",
]

const STATION_PREFIXES = [
  "Central",
  "Express",
  "Metro",
  "Hub",
  "Fast Charge",
  "Supercharger",
  "Plaza",
  "Gateway",
  "Park",
  "Terminal",
  "Rapid",
  "Urban",
]

const CONNECTOR_TYPES = ["CCS2", "Type2", "CHAdeMO"] as const

function createSeededRandom(seed: number) {
  let state = seed >>> 0

  return () => {
    state = (state * 1_664_525 + 1_013_904_223) >>> 0
    return state / 0xffffffff
  }
}

function slugify(value: string) {
  return value.toLowerCase().replaceAll(/[^a-z0-9]+/g, "-")
}

function pickWeightedStatus(random: () => number): StationStatus {
  const value = random()
  if (value < 0.55) return "available"
  if (value < 0.85) return "busy"
  return "offline"
}

function buildConnectors(
  stationId: string,
  random: () => number,
  stationStatus: StationStatus,
) {
  const connectorCount = random() > 0.55 ? 2 : 1

  return Array.from({ length: connectorCount }, (_, index) => {
    const type = CONNECTOR_TYPES[Math.floor(random() * CONNECTOR_TYPES.length)]
    const powerKw =
      type === "CCS2"
        ? [100, 120, 150][Math.floor(random() * 3)]
        : type === "CHAdeMO"
          ? 50
          : 22

    return {
      id: `${stationId}-conn-${index + 1}`,
      type,
      powerKw,
      status:
        stationStatus === "offline"
          ? "offline"
          : pickWeightedStatus(random),
    }
  })
}

function allocateCityCounts(totalCount: number) {
  const counts = NIGERIA_CITIES.map((city) => ({
    city,
    count: Math.floor((city.share / 100) * totalCount),
  }))

  let assigned = counts.reduce((sum, entry) => sum + entry.count, 0)
  let index = 0

  while (assigned < totalCount) {
    counts[index % counts.length].count += 1
    assigned += 1
    index += 1
  }

  return counts
}

export function generateNigeriaStations(totalCount = 250): Station[] {
  const random = createSeededRandom(20260607)
  const cityCounts = allocateCityCounts(totalCount)
  const stations: Station[] = []
  let stationIndex = 0

  for (const { city, count } of cityCounts) {
    for (let localIndex = 0; localIndex < count; localIndex += 1) {
      stationIndex += 1
      const stationId = `station-${slugify(city.name)}-${String(stationIndex).padStart(3, "0")}`
      const lat = city.lat + (random() - 0.5) * city.jitter
      const lng = city.lng + (random() - 0.5) * city.jitter
      const prefix =
        STATION_PREFIXES[Math.floor(random() * STATION_PREFIXES.length)]
      const operator = OPERATORS[Math.floor(random() * OPERATORS.length)]
      const status = pickWeightedStatus(random)
      const evoScore = Math.round(45 + random() * 50)
      const district = `${prefix} ${localIndex + 1}`

      stations.push({
        id: stationId,
        name: `${city.name} ${prefix} EV`,
        operator,
        location: {
          lat: Number(lat.toFixed(4)),
          lng: Number(lng.toFixed(4)),
          address: `${district}, ${city.name}`,
          city: city.name,
        },
        connectors: buildConnectors(stationId, random, status),
        status,
        evoScore,
        lastUpdated: new Date(
          Date.now() - Math.floor(random() * 3_600_000),
        ).toISOString(),
      })
    }
  }

  return stations
}
