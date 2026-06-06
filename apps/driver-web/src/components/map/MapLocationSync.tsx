import { useEffect, useMemo, useRef } from "react"
import { useMap } from "react-leaflet"

import { DEFAULT_MAP_ZOOM, LOCAL_MAP_ZOOM } from "@/lib/geo"
import { getSafeLocation } from "@/lib/safeLocation"
import { useLocationStore } from "@/store/locationStore"
import { isNavigationActive, useNavigationStore } from "@/store/navigationStore"

export function MapLocationSync() {
  const map = useMap()
  const status = useLocationStore((state) => state.status)
  const coords = useLocationStore((state) => state.coords)
  const lastKnownCoords = useLocationStore((state) => state.lastKnownCoords)
  const fallbackCoords = useLocationStore((state) => state.fallbackCoords)
  const navigationMode = useNavigationStore((state) => state.navigationMode)
  const didFallbackSyncRef = useRef(false)
  const didGpsSyncRef = useRef(false)

  const safeLocation = useMemo(
    () =>
      getSafeLocation({ status, coords, lastKnownCoords, fallbackCoords }),
    [status, coords, lastKnownCoords, fallbackCoords],
  )

  useEffect(() => {
    if (isNavigationActive(navigationMode)) return

    if (status === "granted") {
      if (didGpsSyncRef.current) return

      map.setView([safeLocation.lat, safeLocation.lng], LOCAL_MAP_ZOOM, {
        animate: true,
      })
      didGpsSyncRef.current = true
      return
    }

    if (didFallbackSyncRef.current) return

    map.setView(
      [safeLocation.lat, safeLocation.lng],
      map.getZoom() ?? DEFAULT_MAP_ZOOM,
      { animate: false },
    )
    didFallbackSyncRef.current = true
  }, [map, navigationMode, safeLocation.lat, safeLocation.lng, status])

  return null
}
