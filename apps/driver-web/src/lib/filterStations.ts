import type { Station } from "@evocharge/types"

import type { StationFilterState } from "@/components/stations/store"
import { sortByDistanceThenEvoScore } from "@/lib/distance"
import type { StationWithEvoScore } from "@/lib/evoscore"

export function normalizeSearchQuery(query: string): string {
  return query.trim().toLowerCase()
}

export function stationMatchesSearch(station: Station, query: string): boolean {
  const normalizedQuery = normalizeSearchQuery(query)
  if (!normalizedQuery) return true

  return (
    station.name.toLowerCase().includes(normalizedQuery) ||
    station.operator.toLowerCase().includes(normalizedQuery)
  )
}

export function applyStationFilters<T extends Station>(
  stations: T[],
  filters: StationFilterState,
  searchQuery = "",
): T[] {
  const normalizedQuery = normalizeSearchQuery(searchQuery)

  return stations.filter((station) => {
    if (normalizedQuery && !stationMatchesSearch(station, normalizedQuery)) {
      return false
    }

    if (
      filters.status.length > 0 &&
      !filters.status.includes(station.status)
    ) {
      return false
    }

    if (
      filters.operator.length > 0 &&
      !filters.operator.includes(station.operator)
    ) {
      return false
    }

    if (filters.connectorType.length > 0) {
      const hasConnector = station.connectors.some((connector) =>
        filters.connectorType.includes(connector.type),
      )
      if (!hasConnector) return false
    }

    return true
  })
}

export function getFilterOptions(stations: Station[]) {
  const operators = [...new Set(stations.map((station) => station.operator))].sort()
  const connectorTypes = [
    ...new Set(
      stations.flatMap((station) =>
        station.connectors.map((connector) => connector.type),
      ),
    ),
  ].sort()

  return { operators, connectorTypes }
}

const DEFAULT_SUGGESTION_LIMIT = 6

export function getStationSearchSuggestions(
  stations: StationWithEvoScore[],
  query: string,
  limit = DEFAULT_SUGGESTION_LIMIT,
  userLat?: number,
  userLng?: number,
): StationWithEvoScore[] {
  const normalizedQuery = normalizeSearchQuery(query)
  if (!normalizedQuery) return []

  const matches: StationWithEvoScore[] = []
  for (const station of stations) {
    if (stationMatchesSearch(station, normalizedQuery)) {
      matches.push(station)
    }
  }

  if (userLat !== undefined && userLng !== undefined) {
    return sortByDistanceThenEvoScore(matches, userLat, userLng).slice(0, limit)
  }

  return matches.slice(0, limit)
}

export function highlightSearchMatch(
  text: string,
  query: string,
): { before: string; match: string; after: string } | null {
  const normalizedQuery = normalizeSearchQuery(query)
  if (!normalizedQuery) return null

  const lowerText = text.toLowerCase()
  const index = lowerText.indexOf(normalizedQuery)
  if (index === -1) return null

  return {
    before: text.slice(0, index),
    match: text.slice(index, index + normalizedQuery.length),
    after: text.slice(index + normalizedQuery.length),
  }
}
