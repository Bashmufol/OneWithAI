import type { Map as LeafletMap } from "leaflet"
import { useCallback, useEffect } from "react"

import { useUserLocation } from "@/hooks/useUserLocation"
import { DEFAULT_MAP_ZOOM } from "@/lib/geo"
import { getSafeLocation } from "@/lib/safeLocation"
import { useLocationStore } from "@/store/locationStore"
import { useLocationUIStore } from "@/store/locationUIStore"

export function useMapControlActions(
  mapRef: React.RefObject<LeafletMap | null>,
) {
  const locationStatus = useLocationStore((state) => state.status)
  const locationCoords = useLocationStore((state) => state.coords)
  const lastKnownCoords = useLocationStore((state) => state.lastKnownCoords)
  const fallbackCoords = useLocationStore((state) => state.fallbackCoords)
  const { status } = useUserLocation()
  const openPermissionModal = useLocationUIStore(
    (state) => state.openPermissionModal,
  )
  const triggerSource = useLocationUIStore((state) => state.triggerSource)

  const safeCenter = getSafeLocation({
    status: locationStatus,
    coords: locationCoords,
    lastKnownCoords,
    fallbackCoords,
  })

  const recenterToSafeLocation = useCallback(() => {
    mapRef.current?.setView(
      [safeCenter.lat, safeCenter.lng],
      DEFAULT_MAP_ZOOM,
      { animate: true },
    )
  }, [mapRef, safeCenter.lat, safeCenter.lng])

  const handleMyLocation = () => {
    if (status === "granted") {
      recenterToSafeLocation()
      return
    }

    openPermissionModal("map")
  }

  useEffect(() => {
    if (status === "granted" && triggerSource === "map") {
      recenterToSafeLocation()
    }
  }, [recenterToSafeLocation, status, triggerSource])

  return {
    recenterToSafeLocation,
    handleMyLocation,
  }
}
