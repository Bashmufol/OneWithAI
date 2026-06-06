import type { Station } from "@evocharge/types"
import { motion } from "framer-motion"
import { useMemo, useRef, useState } from "react"
import { MapContainer as LeafletMap, TileLayer, useMapEvents } from "react-leaflet"
import type { Map as LeafletMapType } from "leaflet"

import { ClusteredStationMarkers } from "@/components/map/ClusteredStationMarkers"
import { DemandHeatmapLayer } from "@/components/map/DemandHeatmapLayer"
import { MapControls } from "@/components/map/MapControls"
import { MapLocationSync } from "@/components/map/MapLocationSync"
import { IntentRouteOverlay } from "@/components/map/IntentRouteOverlay"
import { MapFlyTo } from "@/components/map/MapFlyTo"
import { MapLegend } from "@/components/map/MapLegend"
import { MapRefCapture } from "@/components/map/MapRefCapture"
import { StationPreviewDialog } from "@/components/map/StationPreviewDialog"
import { useMapStore } from "@/components/map/store"
import { ViewportSync } from "@/components/map/ViewportSync"
import {
  DARK_TILE_URL,
  DEFAULT_MAP_ZOOM,
  TILE_ATTRIBUTION,
} from "@/lib/geo"
import { getSafeLocation } from "@/lib/safeLocation"
import { useLocationStore } from "@/store/locationStore"
import { useDemandPoints } from "@/hooks/useDemandPoints"
import type { StationWithEvoScore } from "@/lib/evoscore"
import { useSettings } from "@/hooks/useSettings"
import { fadeIn, getReducedMotionVariants } from "@/lib/motion"
import { cn } from "@/lib/utils"

interface LeafletMapContainerProps {
  stations: Station[]
  isFetching?: boolean
  pulsingStationIds?: string[]
  onViewportSync: (map: LeafletMapType) => void
  className?: string
}

function MapTileErrorListener({
  onTileError,
}: {
  onTileError: () => void
}) {
  useMapEvents({
    tileerror: () => {
      onTileError()
    },
  })

  return null
}

export function LeafletMapContainer({
  stations,
  isFetching = false,
  pulsingStationIds = [],
  onViewportSync,
  className,
}: LeafletMapContainerProps) {
  const mapRef = useRef<LeafletMapType | null>(null)
  const [mapTilesDegraded, setMapTilesDegraded] = useState(false)
  const selectStation = useMapStore((state) => state.selectStation)
  const highlightedStationId = useMapStore(
    (state) => state.highlightedStationId,
  )
  const heatmapEnabled = useMapStore((state) => state.heatmapEnabled)
  const demandPoints = useDemandPoints(stations as StationWithEvoScore[])
  const { isReduceMotion } = useSettings()
  const fadeVariants = getReducedMotionVariants(fadeIn)
  const locationStatus = useLocationStore((state) => state.status)
  const locationCoords = useLocationStore((state) => state.coords)
  const lastKnownCoords = useLocationStore((state) => state.lastKnownCoords)
  const fallbackCoords = useLocationStore((state) => state.fallbackCoords)

  const mapCenter = useMemo<[number, number]>(() => {
    const safe = getSafeLocation({
      status: locationStatus,
      coords: locationCoords,
      lastKnownCoords,
      fallbackCoords,
    })
    return [safe.lat, safe.lng]
  }, [locationStatus, locationCoords, lastKnownCoords, fallbackCoords])

  return (
    <>
      <motion.div
        className={cn(
          "map-surface relative h-full min-h-[min(480px,52vh)] rounded-xl ring-1 ring-border/60",
          className,
        )}
        variants={fadeVariants}
        initial={isReduceMotion ? false : "hidden"}
        animate="visible"
      >
        <div className="leaflet-map-shell h-full overflow-hidden rounded-xl">
          <LeafletMap
            center={mapCenter}
            zoom={DEFAULT_MAP_ZOOM}
            className="leaflet-map-root h-full w-full"
            zoomControl={false}
            attributionControl={false}
          >
            <TileLayer url={DARK_TILE_URL} attribution={TILE_ATTRIBUTION} />
            <MapTileErrorListener onTileError={() => setMapTilesDegraded(true)} />
            <MapRefCapture mapRef={mapRef} />
            <ViewportSync onSync={onViewportSync} />
            <MapFlyTo />
            <IntentRouteOverlay />
            <MapLocationSync />
            <DemandHeatmapLayer
              points={demandPoints}
              enabled={heatmapEnabled}
            />
            <ClusteredStationMarkers
              stations={stations}
              highlightedStationId={highlightedStationId}
              pulsingStationIds={pulsingStationIds}
              onSelect={(station) => selectStation(station)}
            />
          </LeafletMap>
        </div>

        <MapLegend />
        <MapControls mapRef={mapRef} />

        {isFetching ? (
          <div className="pointer-events-none absolute top-4 left-1/2 z-[10] -translate-x-1/2 rounded-full bg-card/90 px-3 py-1 text-xs text-muted-foreground shadow-lg backdrop-blur-sm">
            Syncing stations…
          </div>
        ) : null}

        {mapTilesDegraded ? (
          <div className="pointer-events-none absolute bottom-14 left-1/2 z-[10] max-w-[90%] -translate-x-1/2 rounded-lg bg-card/90 px-3 py-2 text-center text-xs text-muted-foreground shadow-lg backdrop-blur-sm">
            Map tiles unavailable — markers and routes still work
          </div>
        ) : null}
      </motion.div>

      <StationPreviewDialog />
    </>
  )
}
