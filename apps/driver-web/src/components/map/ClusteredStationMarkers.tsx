import type { Station } from "@evocharge/types"
import L from "leaflet"
import "leaflet.markercluster"
import { memo, useEffect, useRef } from "react"
import { useMap } from "react-leaflet"

import {
  buildStationTooltipHtml,
  createClusterDivIcon,
  createStationDivIcon,
} from "@/components/map/createStationIcon"
import { isReduceMotionEnabled } from "@/lib/motion"

interface ClusteredStationMarkersProps {
  stations: Station[]
  highlightedStationId?: string | null
  pulsingStationIds?: string[]
  onSelect: (station: Station) => void
}

export const ClusteredStationMarkers = memo(function ClusteredStationMarkers({
  stations,
  highlightedStationId = null,
  pulsingStationIds = [],
  onSelect,
}: ClusteredStationMarkersProps) {
  const map = useMap()
  const clusterGroupRef = useRef<L.MarkerClusterGroup | null>(null)
  const markersRef = useRef<Map<string, L.Marker>>(new Map())
  const signaturesRef = useRef<Map<string, string>>(new Map())
  const onSelectRef = useRef(onSelect)
  const pulsingSetRef = useRef(new Set<string>())

  onSelectRef.current = onSelect
  pulsingSetRef.current = new Set(pulsingStationIds)

  useEffect(() => {
    if (!clusterGroupRef.current) {
      const reduceMotion = isReduceMotionEnabled()
      clusterGroupRef.current = L.markerClusterGroup({
        maxClusterRadius: 56,
        spiderfyOnMaxZoom: true,
        showCoverageOnHover: false,
        animate: !reduceMotion,
        animateAddingMarkers: !reduceMotion,
        iconCreateFunction: (cluster) =>
          createClusterDivIcon(cluster.getChildCount()),
      })
      map.addLayer(clusterGroupRef.current)
    }

    const group = clusterGroupRef.current
    const markers = markersRef.current
    const nextStationIds = new Set(stations.map((station) => station.id))

    for (const [stationId, marker] of markers) {
      if (!nextStationIds.has(stationId)) {
        group.removeLayer(marker)
        markers.delete(stationId)
        signaturesRef.current.delete(stationId)
      }
    }

    stations.forEach((station, index) => {
      const isHighlighted = highlightedStationId === station.id
      const isPulsing = pulsingSetRef.current.has(station.id)
      const signature = `${station.status}:${isHighlighted}:${isPulsing}`
      const existingMarker = markers.get(station.id)
      const previousSignature = signaturesRef.current.get(station.id)

      if (existingMarker && previousSignature === signature) {
        return
      }

      const icon = createStationDivIcon(
        station.status,
        index,
        isHighlighted,
        isPulsing,
      )
      const tooltipHtml = buildStationTooltipHtml(station)

      if (existingMarker) {
        existingMarker.setIcon(icon)
        existingMarker.setTooltipContent(tooltipHtml)
        signaturesRef.current.set(station.id, signature)
        return
      }

      const marker = L.marker([station.location.lat, station.location.lng], {
        icon,
      })

      marker.bindTooltip(tooltipHtml, {
        direction: "top",
        offset: [0, -8],
        opacity: 1,
        className: "station-leaflet-tooltip-wrapper",
        sticky: false,
      })

      marker.on("click", () => onSelectRef.current(station))
      group.addLayer(marker)
      markers.set(station.id, marker)
      signaturesRef.current.set(station.id, signature)
    })
  }, [stations, highlightedStationId, pulsingStationIds, map])

  useEffect(() => {
    const markers = markersRef.current
    const signatures = signaturesRef.current

    return () => {
      if (clusterGroupRef.current) {
        map.removeLayer(clusterGroupRef.current)
        clusterGroupRef.current = null
      }
      markers.clear()
      signatures.clear()
    }
  }, [map])

  return null
})
