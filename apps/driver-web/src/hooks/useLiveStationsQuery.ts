import { useMemo } from "react"

import { useStableStations } from "@/hooks/useStableStations"
import type { StationWithEvoScore } from "@/lib/evoscore"
import type { MapBounds } from "@/lib/geo"
import { filterStationsByBounds } from "@/lib/geo"
import { useLiveNetworkStore } from "@/lib/liveNetworkStore"
import { useStationsQuery } from "@/hooks/useStationsQuery"

export function useLiveStations(stations: StationWithEvoScore[]) {
  return useStableStations(stations)
}

function serializeBounds(bounds?: MapBounds): string | null {
  if (!bounds) return null

  return [
    bounds.north.toFixed(4),
    bounds.south.toFixed(4),
    bounds.east.toFixed(4),
    bounds.west.toFixed(4),
  ].join(":")
}

export function useLiveStationsQuery(bounds?: MapBounds) {
  const query = useStationsQuery()
  const boundsKey = serializeBounds(bounds)
  const liveAll = useLiveStations(query.data ?? [])

  const data = useMemo(() => {
    if (!bounds || !boundsKey) return liveAll
    return filterStationsByBounds(liveAll, bounds)
  }, [liveAll, bounds, boundsKey])

  return {
    ...query,
    data,
  }
}

export function usePulsingStationIds(): string[] {
  const recentlyChanged = useLiveNetworkStore((state) => state.recentlyChanged)
  return useMemo(() => Object.keys(recentlyChanged), [recentlyChanged])
}
