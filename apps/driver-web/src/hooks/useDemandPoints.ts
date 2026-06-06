import { useEffect, useMemo, useState } from "react"

import { computeDemandPoints } from "@/lib/demandEngine"
import type { StationWithEvoScore } from "@/lib/evoscore"
import { useLiveNetworkStore } from "@/lib/liveNetworkStore"
import {
  getDemandRefreshIntervalMs,
  useSettingsStore,
} from "@/lib/settingsStore"

export function useDemandPoints(stations: StationWithEvoScore[]) {
  const pulseRevision = useLiveNetworkStore((state) => state.pulseEvents.length)
  const statusRevision = useLiveNetworkStore((state) =>
    Object.entries(state.statusById)
      .map(([id, status]) => `${id}:${status}`)
      .join("|"),
  )
  const demoMode = useSettingsStore((state) => state.demoMode)
  const liveSimulationSpeed = useSettingsStore(
    (state) => state.liveSimulationSpeed,
  )
  const [tick, setTick] = useState(() => Date.now())

  const stationSignature = useMemo(
    () => stations.map((station) => `${station.id}:${station.status}`).join("|"),
    [stations],
  )

  useEffect(() => {
    setTick(Date.now())
  }, [pulseRevision, statusRevision, stationSignature])

  useEffect(() => {
    const intervalMs = getDemandRefreshIntervalMs()
    const intervalId = window.setInterval(() => {
      setTick(Date.now())
    }, intervalMs)

    return () => window.clearInterval(intervalId)
  }, [demoMode, liveSimulationSpeed])

  return useMemo(
    () => computeDemandPoints(stations, tick),
    [stations, tick, stationSignature],
  )
}
