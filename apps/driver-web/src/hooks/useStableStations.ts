import { useMemo, useRef } from "react"

import {
  enrichStationWithEvoScore,
  type StationWithEvoScore,
} from "@/lib/evoscore"
import { useLiveNetworkStore } from "@/lib/liveNetworkStore"

function buildStatusRevision(
  statusById: Record<string, string>,
): string {
  return Object.entries(statusById)
    .sort(([left], [right]) => left.localeCompare(right))
    .map(([id, status]) => `${id}:${status}`)
    .join("|")
}

export function useStableStations(stations: StationWithEvoScore[]) {
  const statusById = useLiveNetworkStore((state) => state.statusById)
  const cacheRef = useRef(
    new Map<string, { revision: string; station: StationWithEvoScore }>(),
  )

  const statusKey = buildStatusRevision(statusById)

  return useMemo(() => {
    const cache = cacheRef.current

    return stations.map((station) => {
      const liveStatus = statusById[station.id]
      const effectiveStatus = liveStatus ?? station.status
      const revision = `${station.id}:${effectiveStatus}`

      const cached = cache.get(station.id)
      if (cached?.revision === revision) {
        return cached.station
      }

      const next =
        liveStatus && liveStatus !== station.status
          ? enrichStationWithEvoScore({ ...station, status: liveStatus })
          : station

      cache.set(station.id, { revision, station: next })
      return next
    })
  }, [stations, statusKey, statusById])
}
