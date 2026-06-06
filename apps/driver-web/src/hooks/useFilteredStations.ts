import { useMemo } from "react"

import { useStationFiltersStore } from "@/components/stations/store"
import { useUserLocation } from "@/hooks/useUserLocation"
import { applyStationFilters } from "@/lib/filterStations"
import { sortStationsByDistance } from "@/lib/distance"
import type { StationWithEvoScore } from "@/lib/evoscore"

export function useFilteredStations(stations: StationWithEvoScore[]) {
  const filters = useStationFiltersStore((state) => state.filters)
  const searchQuery = useStationFiltersStore((state) => state.searchQuery)
  const { safeLocation } = useUserLocation()

  return useMemo(() => {
    const filtered = applyStationFilters(stations, filters, searchQuery)
    return sortStationsByDistance(
      filtered,
      safeLocation.lat,
      safeLocation.lng,
    )
  }, [filters, safeLocation.lat, safeLocation.lng, searchQuery, stations])
}
