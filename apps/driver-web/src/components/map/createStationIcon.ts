import type { Station, StationStatus } from "@evocharge/types"
import L from "leaflet"

import { STATUS_MARKER_CLASSES } from "@/lib/geo"

export function createStationDivIcon(
  status: StationStatus,
  animationIndex = 0,
  highlighted = false,
  pulsing = false,
): L.DivIcon {
  const delay = Math.min(animationIndex * 30, 300)
  const highlightClass = highlighted ? "station-marker-dot--highlighted" : ""
  const pulseClass = pulsing ? "station-marker-dot--pulse" : ""

  return L.divIcon({
    className: "station-marker-leaflet",
    html: `<span class="station-marker-dot ${STATUS_MARKER_CLASSES[status]} ${highlightClass} ${pulseClass}" style="animation-delay:${delay}ms"></span>`,
    iconSize: highlighted ? [20, 20] : [16, 16],
    iconAnchor: highlighted ? [10, 10] : [8, 8],
  })
}

export function createClusterDivIcon(count: number): L.DivIcon {
  const size = count < 10 ? 36 : count < 25 ? 42 : 48

  return L.divIcon({
    className: "cluster-marker-leaflet",
    html: `<span class="cluster-marker-dot">${count}</span>`,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
  })
}

export function buildStationTooltipHtml(station: Station): string {
  const maxPower = Math.max(...station.connectors.map((c) => c.powerKw))
  const statusClass = `station-tooltip-status--${station.status}`

  return `
    <div class="station-leaflet-tooltip">
      <div class="station-leaflet-tooltip__header">
        <p class="station-leaflet-tooltip__title">${escapeHtml(station.name)}</p>
        <span class="station-leaflet-tooltip__badge ${statusClass}">${station.status}</span>
      </div>
      <p class="station-leaflet-tooltip__meta">${escapeHtml(station.operator)}</p>
      <p class="station-leaflet-tooltip__meta">Up to ${maxPower} kW · ${station.connectors.length} connector${station.connectors.length === 1 ? "" : "s"}</p>
    </div>
  `
}

function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
}
