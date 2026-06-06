import type { Station } from "@evocharge/types"
import { CircleMarker, MapContainer, Marker } from "react-leaflet"

import { DynamicTileLayer } from "@/components/map/DynamicTileLayer"
import { createStationDivIcon } from "@/components/map/createStationIcon"
import { DEFAULT_MAP_CENTER, DEFAULT_MAP_ZOOM } from "@/lib/geo"
import { useMapStyleStore } from "@/store/mapStyleStore"

interface MiniMapPreviewProps {
  center?: [number, number]
  zoom?: number
  station?: Station
  stations?: Station[]
  highlightedStationIds?: string[]
  userPosition?: [number, number]
  className?: string
}

export function MiniMapPreview({
  center = DEFAULT_MAP_CENTER,
  zoom = DEFAULT_MAP_ZOOM + 2,
  station,
  stations = [],
  highlightedStationIds = [],
  userPosition,
  className,
}: MiniMapPreviewProps) {
  const mapStyle = useMapStyleStore((state) => state.currentMapStyle)

  const mapStations = station
    ? [station, ...stations.filter((entry) => entry.id !== station.id)]
    : stations
  const focusCenter: [number, number] = station
    ? [station.location.lat, station.location.lng]
    : center

  return (
    <div
      className={`leaflet-map-shell mini-map-preview map-surface overflow-hidden rounded-xl ring-1 ring-border/60 ${className ?? "h-56"}`}
      data-map-style={mapStyle}
    >
      <MapContainer
        center={focusCenter}
        zoom={zoom}
        className="leaflet-map-root h-full w-full"
        zoomControl={false}
        attributionControl
        scrollWheelZoom={false}
        dragging={false}
        doubleClickZoom={false}
      >
        <DynamicTileLayer />
        {userPosition ? (
          <CircleMarker
            center={userPosition}
            radius={8}
            pathOptions={{
              color: "#22d3ee",
              fillColor: "#22d3ee",
              fillOpacity: 0.85,
              weight: 2,
            }}
          />
        ) : null}
        {mapStations.map((mapStation, index) => {
          const isHighlighted =
            highlightedStationIds.includes(mapStation.id) ||
            mapStation.id === station?.id

          return (
            <Marker
              key={mapStation.id}
              position={[mapStation.location.lat, mapStation.location.lng]}
              icon={createStationDivIcon(
                mapStation.status,
                index,
                isHighlighted,
              )}
            />
          )
        })}
      </MapContainer>
    </div>
  )
}
