import { useEffect } from "react"
import { useMap } from "react-leaflet"
import type { Map as LeafletMap } from "leaflet"

interface MapRefCaptureProps {
  mapRef: React.RefObject<LeafletMap | null>
}

export function MapRefCapture({ mapRef }: MapRefCaptureProps) {
  const map = useMap()

  useEffect(() => {
    mapRef.current = map
    return () => {
      mapRef.current = null
    }
  }, [map, mapRef])

  return null
}
