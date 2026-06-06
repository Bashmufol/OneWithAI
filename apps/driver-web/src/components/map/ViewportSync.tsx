import { useEffect } from "react"
import { useMap, useMapEvents } from "react-leaflet"
import type { Map as LeafletMap } from "leaflet"

interface ViewportSyncProps {
  onSync: (map: LeafletMap) => void
}

export function ViewportSync({ onSync }: ViewportSyncProps) {
  const map = useMap()

  useEffect(() => {
    onSync(map)
  }, [map, onSync])

  useMapEvents({
    moveend: () => onSync(map),
    zoomend: () => onSync(map),
  })

  return null
}
