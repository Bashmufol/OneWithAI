import L from "leaflet"
import "leaflet.heat"
import { useEffect, useRef } from "react"
import { useMap } from "react-leaflet"

import type { DemandPoint } from "@/lib/demandEngine"

const HEAT_GRADIENT: Record<number, string> = {
  0: "rgba(52, 211, 153, 0.35)",
  0.45: "rgba(234, 179, 8, 0.48)",
  0.72: "rgba(251, 146, 60, 0.58)",
  1: "rgba(248, 113, 113, 0.62)",
}

const TARGET_OPACITY = 0.56
const FADE_MS = 420

type HeatLayerWithCanvas = L.HeatLayer & {
  _canvas?: HTMLCanvasElement
}

interface DemandHeatmapLayerProps {
  points: DemandPoint[]
  enabled: boolean
}

function toHeatCoords(points: DemandPoint[]): [number, number, number][] {
  return points.map((point) => [point.lat, point.lng, point.intensity])
}

function getCanvas(layer: HeatLayerWithCanvas | null): HTMLCanvasElement | null {
  return layer?._canvas ?? null
}

export function DemandHeatmapLayer({
  points,
  enabled,
}: DemandHeatmapLayerProps) {
  const map = useMap()
  const layerRef = useRef<HeatLayerWithCanvas | null>(null)
  const fadeFrameRef = useRef<number | null>(null)

  const setCanvasOpacity = (opacity: number) => {
    const canvas = getCanvas(layerRef.current)
    if (canvas) {
      canvas.style.opacity = String(opacity)
    }
  }

  const animateOpacity = (from: number, to: number) => {
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
  }

  useEffect(() => {
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
    if (canvas) {
      canvas.classList.add("demand-heatmap-canvas")
      canvas.style.pointerEvents = "none"
      canvas.style.opacity = "0"
    }

    layerRef.current = layer

    return () => {
      if (fadeFrameRef.current !== null) {
        window.cancelAnimationFrame(fadeFrameRef.current)
      }
      map.removeLayer(layer)
      layerRef.current = null
    }
  }, [map])

  useEffect(() => {
    const layer = layerRef.current
    if (!layer || !map.getContainer()) return
    if (!map.hasLayer(layer)) return

    try {
      layer.setLatLngs(toHeatCoords(points))
    } catch {
      // Heatmap redraw can race map teardown in hidden containers.
    }
  }, [enabled, map, points])

  useEffect(() => {
    const layer = layerRef.current
    const canvas = getCanvas(layer)
    if (!layer || !canvas || !map.getContainer()) return

    const currentOpacity = Number.parseFloat(canvas.style.opacity || "0")

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
  }, [enabled, map])

  return null
}
