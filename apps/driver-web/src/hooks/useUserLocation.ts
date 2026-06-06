import { useCallback, useMemo } from "react"

import { executeLocationRequest } from "@/lib/locationRequest"
import { getSafeLocation } from "@/lib/safeLocation"
import { useLocationStore } from "@/store/locationStore"
import type { Coordinates, LocationStatus } from "@/types/location"

export function useUserLocation() {
  const status = useLocationStore((state) => state.status)
  const coords = useLocationStore((state) => state.coords)
  const lastKnownCoords = useLocationStore((state) => state.lastKnownCoords)
  const fallbackCoords = useLocationStore((state) => state.fallbackCoords)
  const resetLocation = useLocationStore((state) => state.resetLocation)

  const locationState = useMemo(
    () => ({ status, coords, lastKnownCoords, fallbackCoords }),
    [status, coords, lastKnownCoords, fallbackCoords],
  )

  const safeLocation = useMemo(
    () => getSafeLocation(locationState),
    [locationState],
  )

  const requestLocation = useCallback(() => {
    executeLocationRequest()
  }, [])

  const requestLocationPermission = useCallback(() => {
    executeLocationRequest({ force: true })
  }, [])

  const usingFallback =
    safeLocation.lat === fallbackCoords.lat &&
    safeLocation.lng === fallbackCoords.lng

  return {
    status,
    coords,
    lastKnownCoords,
    fallbackCoords,
    safeLocation,
    requestLocation,
    requestLocationPermission,
    resetLocation,
    isLoading: status === "loading",
    usingFallback,
    hasGrantedLocation: status === "granted" && coords !== null,
    hasPersistedLocation: lastKnownCoords !== null,
  }
}

export type { Coordinates, LocationStatus }
