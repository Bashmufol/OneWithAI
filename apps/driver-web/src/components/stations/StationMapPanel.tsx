import { lazy, Suspense, useCallback, useEffect, useMemo, useState } from "react"
import type { Map as LeafletMap } from "leaflet"

import { useMapStore } from "@/components/map/store"
import { BatteryRoutePanel } from "@/components/route/BatteryRoutePanel"
import { StationFilters } from "@/components/stations/StationFilters"
import { StationList } from "@/components/stations/StationList"
import { ErrorState } from "@/components/ui/ErrorState"
import { DataFetchError } from "@/components/ui/DataFetchError"
import { LoadingState } from "@/components/ui/LoadingState"
import { useChargingRoute } from "@/hooks/useChargingRoute"
import { useFilteredStations } from "@/hooks/useFilteredStations"
import {
  useLiveStationsQuery,
  usePulsingStationIds,
} from "@/hooks/useLiveStationsQuery"
import { useMapIntentOrchestrator } from "@/hooks/useMapIntentOrchestrator"
import { useMapViewport } from "@/hooks/useMapViewport"
import { useRouteNotifications } from "@/hooks/useRouteNotifications"
import { useSettings } from "@/hooks/useSettings"
import { useQueryRetry } from "@/hooks/useQueryRetry"
import { useNavigationStore } from "@/store/navigationStore"
import { cn } from "@/lib/utils"

const MapContainer = lazy(() =>
  import("@/components/map/MapContainer").then((module) => ({
    default: module.MapContainer,
  })),
)

export function StationMapPanel() {
  const { debouncedViewport, syncViewport } = useMapViewport(300)
  const [hasLoadedOnce, setHasLoadedOnce] = useState(false)

  const {
    data: stations = [],
    isFetching,
    isLoading,
    isError,
    isRefetchError,
    isSuccess,
    refetch,
  } = useLiveStationsQuery(debouncedViewport?.bounds)
  const { onRetry, isRetrying } = useQueryRetry(refetch)
  const pulsingStationIds = usePulsingStationIds()
  const { focusPulseId } = useMapIntentOrchestrator(stations, isLoading)

  useEffect(() => {
    if (stations.length > 0 || isSuccess) {
      setHasLoadedOnce(true)
    }
  }, [isSuccess, stations.length])

  const mergedPulsingStationIds = useMemo(() => {
    if (!focusPulseId) return pulsingStationIds
    if (pulsingStationIds.includes(focusPulseId)) return pulsingStationIds
    return [...pulsingStationIds, focusPulseId]
  }, [focusPulseId, pulsingStationIds])

  const filteredStations = useFilteredStations(stations)
  const activeRoute = useChargingRoute(stations)
  useRouteNotifications(activeRoute)

  const setHighlightedStationId = useMapStore(
    (state) => state.setHighlightedStationId,
  )
  const selectStation = useMapStore((state) => state.selectStation)
  const setHeatmapEnabled = useMapStore((state) => state.setHeatmapEnabled)
  const { isHeatmapDefault } = useSettings()
  const isNavigationFullscreen = useNavigationStore(
    (state) => state.isNavigationFullscreen,
  )

  useEffect(() => {
    if (isHeatmapDefault) {
      setHeatmapEnabled(true)
    }
  }, [isHeatmapDefault, setHeatmapEnabled])

  useEffect(() => {
    if (!activeRoute?.primaryStationId) return

    setHighlightedStationId(activeRoute.primaryStationId)
  }, [activeRoute?.primaryStationId, setHighlightedStationId])

  const handleViewportSync = useCallback(
    (map: LeafletMap) => {
      syncViewport(map)
    },
    [syncViewport],
  )

  const showInitialLoading = isLoading && !hasLoadedOnce && stations.length === 0
  const showBlockingError =
    isError && !hasLoadedOnce && stations.length === 0 && !isFetching
  const showBackgroundSyncError = isRefetchError && stations.length > 0

  const mapSectionClassName = cn(
    "relative min-h-[min(480px,52vh)] lg:min-h-0 lg:h-full",
    isNavigationFullscreen && "min-h-0",
  )

  const mapContent = showInitialLoading ? (
    <LoadingState variant="map" className="h-full" />
  ) : showBlockingError ? (
    <ErrorState className="h-full" onRetry={onRetry} isRetrying={isRetrying} />
  ) : (
    <Suspense fallback={<LoadingState variant="map" className="h-full" />}>
      <MapContainer
        stations={filteredStations}
        isFetching={isFetching && hasLoadedOnce}
        pulsingStationIds={mergedPulsingStationIds}
        onViewportSync={handleViewportSync}
        className="h-full min-h-0"
      />
    </Suspense>
  )

  if (isNavigationFullscreen) {
    return <div className="h-full min-h-0">{mapContent}</div>
  }

  return (
    <div className="grid min-h-0 gap-4 lg:h-full lg:grid-cols-[minmax(0,1.4fr)_minmax(300px,380px)] lg:grid-rows-1">
      <section className={mapSectionClassName}>{mapContent}</section>

      <aside className="map-sidebar-scroll flex min-w-0 flex-col gap-3 lg:max-h-full lg:min-h-0 lg:overflow-y-auto lg:overscroll-contain lg:pr-1">
        {showBackgroundSyncError ? (
          <DataFetchError compact onRetry={onRetry} isRetrying={isRetrying} />
        ) : null}
        <BatteryRoutePanel
          activeRoute={activeRoute}
          onSelectStation={(stationId) => {
            const station = stations.find((entry) => entry.id === stationId)
            if (station) selectStation(station)
          }}
        />
        <StationFilters stations={stations} />
        <StationList
          stations={filteredStations}
          isLoading={isLoading && !hasLoadedOnce}
        />
      </aside>
    </div>
  )
}
