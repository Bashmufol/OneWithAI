import { useMemo } from "react"

import { useUserLocation } from "@/hooks/useUserLocation"
import { useLiveStationsQuery } from "@/hooks/useLiveStationsQuery"
import { getStationSearchSuggestions } from "@/lib/filterStations"

const SUGGESTION_LIMIT = 6

export function useStationSearchSuggestions(query: string) {
  const { data: stations = [] } = useLiveStationsQuery()
  const { safeLocation } = useUserLocation()

  return useMemo(
    () =>
      getStationSearchSuggestions(
        stations,
        query,
        SUGGESTION_LIMIT,
        safeLocation.lat,
        safeLocation.lng,
      ),
    [query, safeLocation.lat, safeLocation.lng, stations],
  )
}
