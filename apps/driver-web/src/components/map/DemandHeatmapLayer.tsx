import L from "leaflet"
import "leaflet.heat"
import { useCallback, useEffect, useRef, useState } from "react"
import { useMap } from "react-leaflet"

import type { DemandPoint } from "@/lib/demandEngine"
import {
  isCanvasReady,
  isMapContainerReady,
  runWhenMapReady,
} from "@/lib/mapReady"

const HEAT_GRADIENT: Record<number, string> = {
  0: "rgba(16, 185, 129, 0.42)",
  0.45: "rgba(234, 179, 8, 0.55)",
  0.72: "rgba(251, 146, 60, 0.68)",
  1: "rgba(239, 68, 68, 0.78)",
}

const TARGET_OPACITY = 0.62
const FADE_MS = 420

type HeatLayerWithCanvas = L.HeatLayer & {
  _canvas?: HTMLCanvasElement
}

interface DemandHeatmapLayerProps {
  points: DemandPoint[]
  enabled: boolean
}

function toHeatCoords(points: DemandPoint[]): [number, number, number][] {
  if (!Array.isArray(points) || points.length === 0) return []

  return points
    .filter(
      (point) =>
        Number.isFinite(point.lat) &&
        Number.isFinite(point.lng) &&
        Number.isFinite(point.intensity),
    )
    .map((point) => [point.lat, point.lng, point.intensity])
}

function getCanvas(layer: HeatLayerWithCanvas | null): HTMLCanvasElement | null {
  return layer?._canvas ?? null
}

function safeSetHeatLatLngs(
  layer: HeatLayerWithCanvas,
  map: L.Map,
  coords: [number, number, number][],
): boolean {
  if (!isMapContainerReady(map)) return false

  try {
    layer.setLatLngs(coords)
    return true
  } catch {
    return false
  }
}

export function DemandHeatmapLayer({
  points,
  enabled,
}: DemandHeatmapLayerProps) {
  const map = useMap()
  const layerRef = useRef<HeatLayerWithCanvas | null>(null)
  const fadeFrameRef = useRef<number | null>(null)
  const pointsRef = useRef(points)
  const [mapReady, setMapReady] = useState(false)

  pointsRef.current = points

  const setCanvasOpacity = useCallback((opacity: number) => {
    const canvas = getCanvas(layerRef.current)
    if (!isCanvasReady(canvas)) return
    canvas.style.opacity = String(opacity)
  }, [])

  const applyHeatData = useCallback(() => {
    const layer = layerRef.current
    if (!layer || !isMapContainerReady(map)) return
    safeSetHeatLatLngs(layer, map, toHeatCoords(pointsRef.current))
  }, [map])

  const animateOpacity = useCallback(
    (from: number, to: number) => {
      if (fadeFrameRef.current !== null) {
        window.cancelAnimationFrame(fadeFrameRef.current)
      }

      const start = performance.now()

      const step = (now: number) => {
        const progress = Math.min(1, (now - start) / FADE_MS)
        setCanvasOpacity(from + (to - from) * progress)

        if (progress < 1) {
          fadeFrameRef.current = window.requestAnimationFrame(step)
        } else {
          fadeFrameRef.current = null
        }
      }

      fadeFrameRef.current = window.requestAnimationFrame(step)
    },
    [setCanvasOpacity],
  )

  useEffect(() => {
    let cancelled = false

    const syncReadyState = () => {
      if (!cancelled && isMapContainerReady(map)) {
        setMapReady(true)
      }
    }

    const stopWatching = runWhenMapReady(map, syncReadyState)

    return () => {
      cancelled = true
      stopWatching()
      setMapReady(false)
    }
  }, [map])

  useEffect(() => {
    if (!mapReady || !isMapContainerReady(map)) return

    const layer = L.heatLayer([], {
      radius: 30,
      blur: 24,
      maxZoom: 16,
      max: 1,
      minOpacity: 0.16,
      gradient: HEAT_GRADIENT,
    }) as HeatLayerWithCanvas

    layer.addTo(map)

    const canvas = getCanvas(layer)
    if (isCanvasReady(canvas)) {
      canvas.classList.add("demand-heatmap-canvas")
      canvas.style.pointerEvents = "none"
      canvas.style.opacity = "0"
    }

    layerRef.current = layer
    applyHeatData()

    return () => {
      if (fadeFrameRef.current !== null) {
        window.cancelAnimationFrame(fadeFrameRef.current)
      }
      map.removeLayer(layer)
      layerRef.current = null
    }
  }, [applyHeatData, map, mapReady])

  useEffect(() => {
    if (!mapReady) return
    applyHeatData()
  }, [applyHeatData, enabled, mapReady, points])

  useEffect(() => {
    if (!mapReady) return

    const handleMoveEnd = () => {
      applyHeatData()
    }

    map.on("moveend", handleMoveEnd)
    map.on("resize", handleMoveEnd)

    return () => {
      map.off("moveend", handleMoveEnd)
      map.off("resize", handleMoveEnd)
    }
  }, [applyHeatData, map, mapReady])

  useEffect(() => {
    const layer = layerRef.current
    const canvas = getCanvas(layer)
    if (!layer || !mapReady || !isMapContainerReady(map)) return
    if (canvas && !isCanvasReady(canvas)) return

    const currentOpacity = Number.parseFloat(canvas?.style.opacity || "0")

    if (enabled) {
      if (!map.hasLayer(layer)) {
        layer.addTo(map)
      }
      animateOpacity(Number.isNaN(currentOpacity) ? 0 : currentOpacity, TARGET_OPACITY)
      return
    }

    animateOpacity(
      Number.isNaN(currentOpacity) ? TARGET_OPACITY : currentOpacity,
      0,
    )
  }, [animateOpacity, enabled, map, mapReady])

  if (!mapReady || !isMapContainerReady(map)) {
    return null
  }

  return null
}
