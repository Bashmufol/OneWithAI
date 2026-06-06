import { useEffect, useMemo, useState } from "react"

import { useRouteStore } from "@/components/route/store"
import { useDemandPoints } from "@/hooks/useDemandPoints"
import { useUserLocation } from "@/hooks/useUserLocation"
import type { StationWithEvoScore } from "@/lib/evoscore"
import {
  getBestChargingStops,
  type ChargingRouteResult,
} from "@/lib/routeEngine"
import { useMapIntentStore } from "@/store/mapIntentStore"

export interface ActiveChargingRoute {
  result: ChargingRouteResult
  primaryStationId: string | null
}

export function useChargingRoute(
  stations: StationWithEvoScore[],
): ActiveChargingRoute | null {
  const batteryLevel = useRouteStore((state) => state.batteryLevel)
  const isRouteEnabled = useRouteStore((state) => state.isRouteEnabled)
  const routeDestination = useMapIntentStore((state) => state.routeDestination)
  const { safeLocation } = useUserLocation()

  const demandPoints = useDemandPoints(stations)
  const [previousPrimaryIds, setPreviousPrimaryIds] = useState<string[]>([])

  const origin = useMemo(
    () => ({
      lat: safeLocation.lat,
      lng: safeLocation.lng,
      label: "Your location",
    }),
    [safeLocation.lat, safeLocation.lng],
  )

  const destination = useMemo(
    () =>
      routeDestination
        ? {
            lat: routeDestination.lat,
            lng: routeDestination.lng,
            label: routeDestination.label,
          }
        : null,
    [routeDestination],
  )

  const activeRoute = useMemo(() => {
    if (!isRouteEnabled || stations.length === 0 || !destination) return null

    const result = getBestChargingStops(
      {
        origin,
        destination,
        batteryLevel,
        stations,
        demandPoints,
      },
      {
        previousStationIds: previousPrimaryIds,
      },
    )

    return {
      result,
      primaryStationId: result.recommendedStations[0]?.id ?? null,
    }
  }, [
    batteryLevel,
    demandPoints,
    destination,
    isRouteEnabled,
    origin,
    previousPrimaryIds,
    stations,
  ])

  useEffect(() => {
    const id = activeRoute?.primaryStationId ?? null
    setPreviousPrimaryIds(id ? [id] : [])
  }, [activeRoute?.primaryStationId])

  return activeRoute
}
