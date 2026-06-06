import { useCallback, useMemo } from "react"
import { useShallow } from "zustand/react/shallow"

import { resetDemoSeed } from "@/lib/demoMode"
import {
  type AppSettings,
  type LiveSimulationSpeed,
  type MapMode,
  type NotificationLevel,
  type UIMode,
  useSettingsStore,
} from "@/lib/settingsStore"

const selectSettings = (
  state: ReturnType<typeof useSettingsStore.getState>,
): AppSettings => ({
  demoMode: state.demoMode,
  uiMode: state.uiMode,
  mapMode: state.mapMode,
  autoEnableHeatmap: state.autoEnableHeatmap,
  notificationLevel: state.notificationLevel,
  liveSimulationSpeed: state.liveSimulationSpeed,
  reduceMotion: state.reduceMotion,
})

export function useSettings() {
  const settings = useSettingsStore(useShallow(selectSettings))

  const setDemoModeStore = useSettingsStore((state) => state.setDemoMode)
  const setDemoMode = useCallback(
    (enabled: boolean) => {
      if (enabled) {
        resetDemoSeed()
      }
      setDemoModeStore(enabled)
    },
    [setDemoModeStore],
  )
  const setUIMode = useSettingsStore((state) => state.setUIMode)
  const setMapMode = useSettingsStore((state) => state.setMapMode)
  const setAutoEnableHeatmap = useSettingsStore(
    (state) => state.setAutoEnableHeatmap,
  )
  const setNotificationLevel = useSettingsStore(
    (state) => state.setNotificationLevel,
  )
  const setSimulationSpeed = useSettingsStore((state) => state.setSimulationSpeed)
  const setReduceMotion = useSettingsStore((state) => state.setReduceMotion)
  const toggleReduceMotion = useSettingsStore((state) => state.toggleReduceMotion)

  const derived = useMemo(
    () => ({
      isDemoMode: settings.demoMode,
      isComfortMode: settings.uiMode === "comfort",
      isIntelligenceMode: settings.uiMode === "intelligence",
      isHeatmapDefault:
        settings.mapMode === "heatmap-first" || settings.autoEnableHeatmap,
      isReduceMotion: settings.reduceMotion,
    }),
    [
      settings.demoMode,
      settings.uiMode,
      settings.reduceMotion,
      settings.mapMode,
      settings.autoEnableHeatmap,
    ],
  )

  return {
    settings,
    ...derived,
    setDemoMode,
    setUIMode,
    setMapMode,
    setAutoEnableHeatmap,
    setNotificationLevel,
    setSimulationSpeed,
    setReduceMotion,
    toggleReduceMotion,
  }
}

export type {
  AppSettings,
  LiveSimulationSpeed,
  MapMode,
  NotificationLevel,
  UIMode,
}
