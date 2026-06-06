import { lazy, Suspense, useCallback, useEffect, useMemo } from "react"
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

const MapContainer = lazy(() =>
  import("@/components/map/MapContainer").then((module) => ({
    default: module.MapContainer,
  })),
)

export function StationMapPanel() {
  const { debouncedViewport, syncViewport } = useMapViewport(300)

  const {
    data: stations = [],
    isFetching,
    isLoading,
    isError,
    refetch,
  } = useLiveStationsQuery(debouncedViewport?.bounds)
  const pulsingStationIds = usePulsingStationIds()
  const { focusPulseId } = useMapIntentOrchestrator(stations, isLoading)

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

  if (isLoading && stations.length === 0) {
    return (
      <LoadingState variant="map" className="min-h-[min(480px,52vh)] lg:h-full" />
    )
  }

  const showFetchError = isError && stations.length === 0

  return (
    <div className="grid min-h-0 gap-4 lg:h-full lg:grid-cols-[minmax(0,1.4fr)_minmax(300px,380px)] lg:grid-rows-1">
      <section className="relative min-h-[min(480px,52vh)] lg:min-h-0 lg:h-full">
        {showFetchError ? (
          <ErrorState
            className="h-full"
            onRetry={() => {
              void refetch()
            }}
          />
        ) : (
          <Suspense fallback={<LoadingState variant="map" className="h-full" />}>
            <MapContainer
              stations={filteredStations}
              isFetching={isFetching}
              pulsingStationIds={mergedPulsingStationIds}
              onViewportSync={handleViewportSync}
              className="h-full"
            />
          </Suspense>
        )}
      </section>

      <aside className="map-sidebar-scroll flex min-w-0 flex-col gap-3 lg:max-h-full lg:min-h-0 lg:overflow-y-auto lg:overscroll-contain lg:pr-1">
        {isError && stations.length > 0 ? (
          <DataFetchError
            compact
            onRetry={() => {
              void refetch()
            }}
          />
        ) : null}
        <BatteryRoutePanel
          activeRoute={activeRoute}
          onSelectStation={(stationId) => {
            const station = stations.find((entry) => entry.id === stationId)
            if (station) selectStation(station)
          }}
        />
        <StationFilters stations={stations} />
        <StationList stations={filteredStations} isLoading={isLoading} />
      </aside>
    </div>
  )
}
