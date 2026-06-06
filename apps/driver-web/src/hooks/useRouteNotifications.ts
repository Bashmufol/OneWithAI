import { useEffect, useRef } from "react"

import { useRouteStore } from "@/components/route/store"
import { bridgeRouteNotification } from "@/lib/notificationEventBridge"
import type { RouteMode } from "@/lib/routeEngine"

export function useRouteNotifications(
  activeRoute: {
    result: { mode: RouteMode; recommendedStations: { id: string; name: string }[] }
    primaryStationId: string | null
  } | null,
) {
  const batteryLevel = useRouteStore((state) => state.batteryLevel)
  const isRouteEnabled = useRouteStore((state) => state.isRouteEnabled)
  const previousPrimaryIdRef = useRef<string | null>(null)
  const previousModeRef = useRef<RouteMode | null>(null)

  useEffect(() => {
    if (!isRouteEnabled || !activeRoute) return

    const { mode, recommendedStations } = activeRoute.result
    const primaryStation = recommendedStations[0]

    if (mode === "emergency" && previousModeRef.current !== "emergency") {
      bridgeRouteNotification({
        title: "Emergency charging route",
        message: `Battery at ${batteryLevel}% — prioritizing nearest high-availability stop.`,
        severity: "critical",
        stationId: primaryStation?.id,
        dedupeKey: `routing:emergency:${primaryStation?.id ?? "none"}`,
        href: primaryStation ? `/stations/${primaryStation.id}` : "/",
      })
    }

    if (
      primaryStation &&
      previousPrimaryIdRef.current &&
      previousPrimaryIdRef.current !== primaryStation.id
    ) {
      bridgeRouteNotification({
        title: "Route recommendation updated",
        message: `Switched to ${primaryStation.name} based on live network changes.`,
        severity: "warning",
        stationId: primaryStation.id,
        dedupeKey: `routing:switch:${primaryStation.id}`,
        href: `/stations/${primaryStation.id}`,
      })
    } else if (
      primaryStation &&
      !previousPrimaryIdRef.current &&
      isRouteEnabled
    ) {
      bridgeRouteNotification({
        title: "Charging stop recommended",
        message: `${primaryStation.name} selected for your active route.`,
        severity: "success",
        stationId: primaryStation.id,
        dedupeKey: `routing:primary:${primaryStation.id}`,
        href: `/stations/${primaryStation.id}`,
      })
    }

    previousPrimaryIdRef.current = primaryStation?.id ?? null
    previousModeRef.current = mode
  }, [activeRoute, batteryLevel, isRouteEnabled])
}
