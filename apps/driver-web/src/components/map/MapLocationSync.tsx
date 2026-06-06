import { useEffect, useMemo, useRef } from "react"
import { useMap } from "react-leaflet"

import { DEFAULT_MAP_ZOOM, LOCAL_MAP_ZOOM } from "@/lib/geo"
import { getSafeLocation } from "@/lib/safeLocation"
import { useLocationStore } from "@/store/locationStore"

export function MapLocationSync() {
  const map = useMap()
  const status = useLocationStore((state) => state.status)
  const coords = useLocationStore((state) => state.coords)
  const lastKnownCoords = useLocationStore((state) => state.lastKnownCoords)
  const fallbackCoords = useLocationStore((state) => state.fallbackCoords)
  const lastSyncedKeyRef = useRef<string | null>(null)

  const safeLocation = useMemo(
    () =>
      getSafeLocation({ status, coords, lastKnownCoords, fallbackCoords }),
    [status, coords, lastKnownCoords, fallbackCoords],
  )

  useEffect(() => {
    const syncKey = `${safeLocation.lat},${safeLocation.lng}`
    if (lastSyncedKeyRef.current === syncKey) return

    const targetZoom =
      status === "granted"
        ? LOCAL_MAP_ZOOM
        : (map.getZoom() ?? DEFAULT_MAP_ZOOM)

    map.setView([safeLocation.lat, safeLocation.lng], targetZoom, {
      animate: status === "granted",
    })
    lastSyncedKeyRef.current = syncKey
  }, [map, safeLocation, status])

  return null
}
