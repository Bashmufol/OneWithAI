import { useMemo } from "react"

import {
  enrichStationWithEvoScore,
  type StationWithEvoScore,
} from "@/lib/evoscore"
import { useLiveNetworkStore } from "@/lib/liveNetworkStore"

const stationCache = new Map<
  string,
  { revision: string; station: StationWithEvoScore }
>()

export function useStableStations(stations: StationWithEvoScore[]) {
  const statusById = useLiveNetworkStore((state) => state.statusById)

  return useMemo(() => {
    return stations.map((station) => {
      const liveStatus = statusById[station.id]
      const effectiveStatus = liveStatus ?? station.status
      const revision = `${station.id}:${effectiveStatus}`

      const cached = stationCache.get(station.id)
      if (cached?.revision === revision) {
        return cached.station
      }

      const next =
        liveStatus && liveStatus !== station.status
          ? enrichStationWithEvoScore({ ...station, status: liveStatus })
          : station

      stationCache.set(station.id, { revision, station: next })
      return next
    })
  }, [stations, statusById])
}
