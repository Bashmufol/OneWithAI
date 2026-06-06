import { useEffect } from "react"

import { NavigationProgressEngine } from "@/components/navigation/NavigationProgressEngine"
import {
  exitNavigationWithHistory,
  pushNavigationHistoryState,
  shouldIgnoreNavigationPopState,
} from "@/lib/navigationActions"
import { getSafeLocation } from "@/lib/safeLocation"
import { useLocationStore } from "@/store/locationStore"
import {
  isNavigationActive,
  useNavigationStore,
} from "@/store/navigationStore"

export function NavigationBootstrap() {
  const navigationMode = useNavigationStore((state) => state.navigationMode)
  const syncProgressFromGps = useNavigationStore((state) => state.syncProgressFromGps)
  const isNavigationFullscreen = useNavigationStore(
    (state) => state.isNavigationFullscreen,
  )

  const locationStatus = useLocationStore((state) => state.status)
  const coords = useLocationStore((state) => state.coords)
  const lastKnownCoords = useLocationStore((state) => state.lastKnownCoords)
  const fallbackCoords = useLocationStore((state) => state.fallbackCoords)

  useEffect(() => {
    if (!isNavigationActive(navigationMode)) return

    const safe = getSafeLocation({
      status: locationStatus,
      coords,
      lastKnownCoords,
      fallbackCoords,
    })
    syncProgressFromGps(safe)
  }, [
    navigationMode,
    locationStatus,
    coords,
    lastKnownCoords,
    fallbackCoords,
    syncProgressFromGps,
  ])

  useEffect(() => {
    document.body.dataset.navigationFullscreen = isNavigationFullscreen
      ? "true"
      : "false"

    return () => {
      delete document.body.dataset.navigationFullscreen
    }
  }, [isNavigationFullscreen])

  useEffect(() => {
    if (!isNavigationActive(navigationMode)) return

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        exitNavigationWithHistory()
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [navigationMode])

  useEffect(() => {
    if (!isNavigationFullscreen) return

    pushNavigationHistoryState()

    const handlePopState = () => {
      if (shouldIgnoreNavigationPopState()) return
      useNavigationStore.getState().exitNavigation()
    }

    window.addEventListener("popstate", handlePopState)
    return () => window.removeEventListener("popstate", handlePopState)
  }, [isNavigationFullscreen])

  return (
    <>
      <NavigationProgressEngine />
    </>
  )
}
