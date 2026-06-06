import { useEffect, useRef } from "react"

import { getSafeLocation } from "@/lib/safeLocation"
import { useLocationStore } from "@/store/locationStore"
import {
  isNavigationActive,
  useNavigationStore,
} from "@/store/navigationStore"

const SIMULATION_SPEED_MPS = 12

export function NavigationProgressEngine() {
  const navigationMode = useNavigationStore((state) => state.navigationMode)
  const syncProgressFromGps = useNavigationStore((state) => state.syncProgressFromGps)
  const advanceSimulation = useNavigationStore((state) => state.advanceSimulation)
  const lastGpsSyncRef = useRef<number>(0)

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
    lastGpsSyncRef.current = performance.now()
  }, [
    navigationMode,
    locationStatus,
    coords,
    lastKnownCoords,
    fallbackCoords,
    syncProgressFromGps,
  ])

  useEffect(() => {
    if (navigationMode !== "active") return

    let animationFrameId = 0
    let lastTime = performance.now()

    const tick = (now: number) => {
      const deltaSeconds = Math.min((now - lastTime) / 1000, 0.05)
      lastTime = now

      const state = useNavigationStore.getState()
      const route = state.currentRouteCoordinates
      if (route.length >= 2) {
        const gpsStaleMs = now - lastGpsSyncRef.current

        if (gpsStaleMs > 1200) {
          advanceSimulation(SIMULATION_SPEED_MPS * deltaSeconds)
        }
      }

      animationFrameId = window.requestAnimationFrame(tick)
    }

    animationFrameId = window.requestAnimationFrame(tick)
    return () => window.cancelAnimationFrame(animationFrameId)
  }, [navigationMode, advanceSimulation])

  return null
}
