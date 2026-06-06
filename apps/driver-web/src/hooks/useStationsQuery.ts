import { keepPreviousData, useQuery } from "@tanstack/react-query"

import { apiClient } from "@/lib/api-client"
import { enrichStationsWithEvoScore } from "@/lib/evoscore"
import { useIsOnline } from "@/hooks/useIsOnline"

export function useStationsQuery() {
  const isOnline = useIsOnline()

  return useQuery({
    queryKey: ["stations"],
    queryFn: () => apiClient.stations.list(),
    select: (stations) => enrichStationsWithEvoScore(stations),
    placeholderData: keepPreviousData,
    staleTime: 60_000,
    gcTime: 5 * 60_000,
    networkMode: "always",
    refetchOnWindowFocus: false,
    refetchOnReconnect: isOnline,
    refetchOnMount: false,
    retry: 1,
  })
}
