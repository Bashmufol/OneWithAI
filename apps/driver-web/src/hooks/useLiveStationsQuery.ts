import { useMemo } from "react"

import { useStableStations } from "@/hooks/useStableStations"
import type { StationWithEvoScore } from "@/lib/evoscore"
import type { MapBounds } from "@/lib/geo"
import { useLiveNetworkStore } from "@/lib/liveNetworkStore"
import { useStationsQuery } from "@/hooks/useStationsQuery"

export function useLiveStations(stations: StationWithEvoScore[]) {
  return useStableStations(stations)
}

export function useLiveStationsQuery(bounds?: MapBounds) {
  const query = useStationsQuery(bounds)
  const liveData = useLiveStations(query.data ?? [])

  return {
    ...query,
    data: liveData,
  }
}

export function usePulsingStationIds(): string[] {
  const recentlyChanged = useLiveNetworkStore((state) => state.recentlyChanged)
  return useMemo(() => Object.keys(recentlyChanged), [recentlyChanged])
}
