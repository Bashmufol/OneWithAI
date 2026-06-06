import { keepPreviousData, useQuery } from "@tanstack/react-query"

import { apiClient } from "@/lib/api-client"
import { enrichStationsWithEvoScore } from "@/lib/evoscore"
import type { MapBounds } from "@/lib/geo"
import { filterStationsByBounds } from "@/lib/geo"
import { useIsOnline } from "@/hooks/useIsOnline"

export function useStationsQuery(bounds?: MapBounds) {
  const isOnline = useIsOnline()

  return useQuery({
    queryKey: ["stations", bounds],
    queryFn: () =>
      apiClient.stations.list(
        bounds
          ? {
              bounds: {
                north: bounds.north,
                south: bounds.south,
                east: bounds.east,
                west: bounds.west,
              },
            }
          : undefined,
      ),
    select: (stations) => {
      const scoped = bounds
        ? filterStationsByBounds(stations, bounds)
        : stations

      return enrichStationsWithEvoScore(scoped)
    },
    placeholderData: keepPreviousData,
    staleTime: 30_000,
    networkMode: "always",
    refetchOnWindowFocus: isOnline,
    refetchOnReconnect: isOnline,
  })
}
