import { useEffect, useRef } from "react"

import { useIsOnline } from "@/hooks/useIsOnline"
import { useStationsQuery } from "@/hooks/useStationsQuery"
import { useLiveNetworkStore } from "@/lib/liveNetworkStore"
import { emitPulseEvent } from "@/lib/networkEventBus"
import {
  createPulseEvent,
  getNextStatus,
  getSimulationCycleDelayMs,
  pickRandomStationIndex,
} from "@/lib/networkPulseEngine"

export function useNetworkSimulation() {
  const isOnline = useIsOnline()
  const { data: stations = [] } = useStationsQuery()
  const registerStations = useLiveNetworkStore((state) => state.registerStations)
  const getLiveStatus = useLiveNetworkStore((state) => state.getLiveStatus)
  const applyStatusChange = useLiveNetworkStore(
    (state) => state.applyStatusChange,
  )
  const timeoutIdRef = useRef<number | null>(null)

  useEffect(() => {
    if (!isOnline) return
    if (stations.length === 0) return

    registerStations(stations)

    let cancelled = false

    const scheduleNextCycle = () => {
      const delay = getSimulationCycleDelayMs()

      timeoutIdRef.current = window.setTimeout(() => {
        if (cancelled) return

        const stationIndex = pickRandomStationIndex(stations.length)
        const station = stations[stationIndex]

        if (station) {
          const currentStatus = getLiveStatus(station.id, station.status)
          const nextStatus = getNextStatus(currentStatus)

          if (nextStatus !== currentStatus) {
            const event = createPulseEvent(
              station.id,
              station.name,
              currentStatus,
              nextStatus,
            )

            applyStatusChange(
              { ...station, status: currentStatus },
              nextStatus,
              event,
            )
            emitPulseEvent(event)
          }
        }

        scheduleNextCycle()
      }, delay)
    }

    scheduleNextCycle()

    return () => {
      cancelled = true
      if (timeoutIdRef.current !== null) {
        window.clearTimeout(timeoutIdRef.current)
        timeoutIdRef.current = null
      }
    }
  }, [isOnline, stations, registerStations, getLiveStatus, applyStatusChange])
}
