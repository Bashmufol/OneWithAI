import L from "leaflet"
import { useEffect, useRef } from "react"
import { useMap } from "react-leaflet"

import {
  isNavigationActive,
  useNavigationStore,
} from "@/store/navigationStore"

function createVehicleIcon(bearing: number) {
  return L.divIcon({
    className: "navigation-vehicle-marker",
    html: `<div class="navigation-vehicle-icon-shell" style="transform: rotate(${bearing}deg)">
      <svg viewBox="0 0 24 24" width="28" height="28" aria-hidden="true">
        <path fill="#2563eb" stroke="#ffffff" stroke-width="1.5" d="M12 2c-2.2 0-4 1.8-4 4v2H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h1.1a2.5 2.5 0 0 0 4.8 0h2.2a2.5 2.5 0 0 0 4.8 0H18a2 2 0 0 0 2-2v-8a2 2 0 0 0-2-2h-2V6c0-2.2-1.8-4-4-4zm-2 6V6c0-1.1.9-2 2-2s2 .9 2 2v2h-4z"/>
      </svg>
    </div>`,
    iconSize: [28, 28],
    iconAnchor: [14, 14],
  })
}

export function NavigationVehicleMarker() {
  const map = useMap()
  const navigationMode = useNavigationStore((state) => state.navigationMode)
  const vehiclePosition = useNavigationStore((state) => state.vehiclePosition)
  const vehicleBearing = useNavigationStore((state) => state.vehicleBearing)
  const markerRef = useRef<L.Marker | null>(null)
  const displayedPositionRef = useRef<{ lat: number; lng: number } | null>(null)
  const animationFrameRef = useRef<number | null>(null)

  useEffect(() => {
    return () => {
      if (animationFrameRef.current !== null) {
        window.cancelAnimationFrame(animationFrameRef.current)
      }
      markerRef.current?.remove()
      markerRef.current = null
      displayedPositionRef.current = null
    }
  }, [map])

  useEffect(() => {
    if (!isNavigationActive(navigationMode) || !vehiclePosition) {
      markerRef.current?.remove()
      markerRef.current = null
      displayedPositionRef.current = null
      return
    }

    if (!markerRef.current) {
      markerRef.current = L.marker([vehiclePosition.lat, vehiclePosition.lng], {
        icon: createVehicleIcon(vehicleBearing),
        interactive: false,
        zIndexOffset: 1200,
      }).addTo(map)
      displayedPositionRef.current = vehiclePosition
      return
    }

    const start = displayedPositionRef.current ?? vehiclePosition
    const end = vehiclePosition
    const startTime = performance.now()
    const durationMs = 280

    if (animationFrameRef.current !== null) {
      window.cancelAnimationFrame(animationFrameRef.current)
    }

    const animate = (now: number) => {
      const progress = Math.min(1, (now - startTime) / durationMs)
      const eased = 1 - (1 - progress) ** 3
      const lat = start.lat + (end.lat - start.lat) * eased
      const lng = start.lng + (end.lng - start.lng) * eased

      markerRef.current?.setLatLng([lat, lng])
      markerRef.current?.setIcon(createVehicleIcon(vehicleBearing))

      if (progress < 1) {
        animationFrameRef.current = window.requestAnimationFrame(animate)
        return
      }

      displayedPositionRef.current = end
      animationFrameRef.current = null
    }

    animationFrameRef.current = window.requestAnimationFrame(animate)

    return () => {
      if (animationFrameRef.current !== null) {
        window.cancelAnimationFrame(animationFrameRef.current)
      }
    }
  }, [map, navigationMode, vehiclePosition, vehicleBearing])

  return null
}
