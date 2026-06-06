import { useEffect } from "react"
import { useMap } from "react-leaflet"

import { useMapStore } from "@/components/map/store"

export function MapFlyTo() {
  const map = useMap()
  const flyToRequest = useMapStore((state) => state.flyToRequest)
  const clearFlyToRequest = useMapStore((state) => state.clearFlyToRequest)

  useEffect(() => {
    if (!flyToRequest) return

    map.flyTo([flyToRequest.lat, flyToRequest.lng], flyToRequest.zoom ?? 14, {
      animate: true,
      duration: 0.6,
    })
    clearFlyToRequest()
  }, [flyToRequest, map, clearFlyToRequest])

  return null
}
