import { useCallback, useState } from "react"
import type { Map as LeafletMap } from "leaflet"

import type { MapBounds } from "@/lib/geo"
import { useDebouncedValue } from "@/hooks/useDebouncedValue"

export interface MapViewport {
  bounds: MapBounds
  zoom: number
}

export function useMapViewport(debounceMs = 300) {
  const [viewport, setViewport] = useState<MapViewport | null>(null)
  const debouncedViewport = useDebouncedValue(viewport, debounceMs)

  const syncViewport = useCallback((map: LeafletMap) => {
    const bounds = map.getBounds()

    setViewport({
      bounds: {
        north: bounds.getNorth(),
        south: bounds.getSouth(),
        east: bounds.getEast(),
        west: bounds.getWest(),
      },
      zoom: map.getZoom(),
    })
  }, [])

  return {
    viewport,
    debouncedViewport,
    syncViewport,
  }
}
