import { useEffect, useRef } from "react"

import { useMapStore } from "@/store/mapStore"
import { useSettingsStore } from "@/lib/settingsStore"

export function SettingsRuntime() {
  const uiMode = useSettingsStore((state) => state.uiMode)
  const reduceMotion = useSettingsStore((state) => state.reduceMotion)
  const mapMode = useSettingsStore((state) => state.mapMode)
  const autoEnableHeatmap = useSettingsStore((state) => state.autoEnableHeatmap)
  const setHeatmapEnabled = useMapStore((state) => state.setHeatmapEnabled)
  const heatmapAppliedRef = useRef(false)

  useEffect(() => {
    const root = document.documentElement
    root.dataset.uiMode = uiMode
    root.dataset.reduceMotion = reduceMotion ? "true" : "false"
  }, [uiMode, reduceMotion])

  useEffect(() => {
    if (heatmapAppliedRef.current) return
    if (mapMode !== "heatmap-first" && !autoEnableHeatmap) return

    setHeatmapEnabled(true)
    heatmapAppliedRef.current = true
  }, [mapMode, autoEnableHeatmap, setHeatmapEnabled])

  return null
}
