import { create } from "zustand"

const STORAGE_KEY = "evocharge-settings-v1"

export type UIMode = "comfort" | "intelligence"
export type MapMode = "standard" | "heatmap-first"
export type NotificationLevel = "all" | "important" | "critical"
export type LiveSimulationSpeed = "slow" | "normal" | "fast"

export interface AppSettings {
  demoMode: boolean
  uiMode: UIMode
  mapMode: MapMode
  autoEnableHeatmap: boolean
  notificationLevel: NotificationLevel
  liveSimulationSpeed: LiveSimulationSpeed
  reduceMotion: boolean
}

interface SettingsStore extends AppSettings {
  setDemoMode: (enabled: boolean) => void
  setUIMode: (mode: UIMode) => void
  setMapMode: (mode: MapMode) => void
  setAutoEnableHeatmap: (enabled: boolean) => void
  setNotificationLevel: (level: NotificationLevel) => void
  setSimulationSpeed: (speed: LiveSimulationSpeed) => void
  setReduceMotion: (enabled: boolean) => void
  toggleReduceMotion: () => void
}

export const DEFAULT_SETTINGS: AppSettings = {
  demoMode: false,
  uiMode: "intelligence",
  mapMode: "standard",
  autoEnableHeatmap: false,
  notificationLevel: "important",
  liveSimulationSpeed: "normal",
  reduceMotion: false,
}

const SIMULATION_CYCLE_BOUNDS = {
  slow: {
    live: { min: 8_000, max: 15_000 },
    demo: { min: 4_000, max: 6_000 },
  },
  normal: {
    live: { min: 5_000, max: 10_000 },
    demo: { min: 2_000, max: 4_000 },
  },
  fast: {
    live: { min: 2_000, max: 5_000 },
    demo: { min: 1_000, max: 2_000 },
  },
} as const satisfies Record<
  LiveSimulationSpeed,
  { live: { min: number; max: number }; demo: { min: number; max: number } }
>

export const DEMAND_REFRESH_BY_SPEED = {
  slow: { live: 20_000, demo: 10_000 },
  normal: { live: 12_000, demo: 6_000 },
  fast: { live: 6_000, demo: 3_000 },
} as const satisfies Record<
  LiveSimulationSpeed,
  { live: number; demo: number }
>

function isValidUIMode(value: unknown): value is UIMode {
  return value === "comfort" || value === "intelligence"
}

function isValidMapMode(value: unknown): value is MapMode {
  return value === "standard" || value === "heatmap-first"
}

function isValidNotificationLevel(value: unknown): value is NotificationLevel {
  return value === "all" || value === "important" || value === "critical"
}

function isValidSimulationSpeed(value: unknown): value is LiveSimulationSpeed {
  return value === "slow" || value === "normal" || value === "fast"
}

function loadPersistedSettings(): Partial<AppSettings> {
  if (typeof window === "undefined") return {}

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return {}

    const parsed = JSON.parse(raw) as Partial<AppSettings>
    const next: Partial<AppSettings> = {}

    if (typeof parsed.demoMode === "boolean") next.demoMode = parsed.demoMode
    if (isValidUIMode(parsed.uiMode)) next.uiMode = parsed.uiMode
    if (isValidMapMode(parsed.mapMode)) next.mapMode = parsed.mapMode
    if (typeof parsed.autoEnableHeatmap === "boolean") {
      next.autoEnableHeatmap = parsed.autoEnableHeatmap
    }
    if (isValidNotificationLevel(parsed.notificationLevel)) {
      next.notificationLevel = parsed.notificationLevel
    }
    if (isValidSimulationSpeed(parsed.liveSimulationSpeed)) {
      next.liveSimulationSpeed = parsed.liveSimulationSpeed
    }
    if (typeof parsed.reduceMotion === "boolean") {
      next.reduceMotion = parsed.reduceMotion
    }

    return next
  } catch {
    return {}
  }
}

function persistSettings(settings: AppSettings): void {
  if (typeof window === "undefined") return

  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(settings))
  } catch {
    // Ignore quota / private browsing errors.
  }
}

function pickSettings(state: SettingsStore): AppSettings {
  return {
    demoMode: state.demoMode,
    uiMode: state.uiMode,
    mapMode: state.mapMode,
    autoEnableHeatmap: state.autoEnableHeatmap,
    notificationLevel: state.notificationLevel,
    liveSimulationSpeed: state.liveSimulationSpeed,
    reduceMotion: state.reduceMotion,
  }
}

export const useSettingsStore = create<SettingsStore>((set, get) => ({
  ...DEFAULT_SETTINGS,
  ...loadPersistedSettings(),

  setDemoMode: (demoMode) => {
    set({ demoMode })
    persistSettings(pickSettings(get()))
  },

  setUIMode: (uiMode) => {
    set({ uiMode })
    persistSettings(pickSettings(get()))
  },

  setMapMode: (mapMode) => {
    set({ mapMode })
    persistSettings(pickSettings(get()))
  },

  setAutoEnableHeatmap: (autoEnableHeatmap) => {
    set({ autoEnableHeatmap })
    persistSettings(pickSettings(get()))
  },

  setNotificationLevel: (notificationLevel) => {
    set({ notificationLevel })
    persistSettings(pickSettings(get()))
  },

  setSimulationSpeed: (liveSimulationSpeed) => {
    set({ liveSimulationSpeed })
    persistSettings(pickSettings(get()))
  },

  setReduceMotion: (reduceMotion) => {
    set({ reduceMotion })
    persistSettings(pickSettings(get()))
  },

  toggleReduceMotion: () => {
    set((state) => ({ reduceMotion: !state.reduceMotion }))
    persistSettings(pickSettings(get()))
  },
}))

export function getSettingsSnapshot(): AppSettings {
  return pickSettings(useSettingsStore.getState() as SettingsStore)
}

export function getSimulationCycleBounds(): { min: number; max: number } {
  const { demoMode, liveSimulationSpeed } = getSettingsSnapshot()
  const profile = SIMULATION_CYCLE_BOUNDS[liveSimulationSpeed]
  return demoMode ? profile.demo : profile.live
}

export function getDemandRefreshIntervalMs(): number {
  const { demoMode, liveSimulationSpeed } = getSettingsSnapshot()
  const profile = DEMAND_REFRESH_BY_SPEED[liveSimulationSpeed]
  return demoMode ? profile.demo : profile.live
}

export function isHeatmapDefaultEnabled(): boolean {
  const { mapMode, autoEnableHeatmap } = getSettingsSnapshot()
  return mapMode === "heatmap-first" || autoEnableHeatmap
}
