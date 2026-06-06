import type { Station } from "@evocharge/types"

function stableHash(value: string): number {
  let hash = 0
  for (let index = 0; index < value.length; index += 1) {
    hash = (hash * 31 + value.charCodeAt(index)) >>> 0
  }
  return hash
}

export function getEstimatedWaitMinutes(station: Station): number | null {
  if (station.status === "available") return 0
  if (station.status === "offline") return null

  return 5 + (stableHash(station.id) % 18)
}

export function formatEstimatedWait(station: Station): string {
  const wait = getEstimatedWaitMinutes(station)
  if (wait === null) return "Unavailable"
  if (wait === 0) return "No wait"
  return `~${wait} min`
}

export function getMaxPowerKw(station: Station): number {
  return Math.max(...station.connectors.map((connector) => connector.powerKw))
}

export function formatLastUpdated(lastUpdated: string): string {
  return new Intl.DateTimeFormat(undefined, {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    month: "short",
    day: "numeric",
  }).format(new Date(lastUpdated))
}
