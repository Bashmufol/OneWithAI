import {
  getSettingsSnapshot,
  useSettingsStore,
} from "@/lib/settingsStore"

const DEMO_SEED = 42

function mulberry32(seed: number): () => number {
  let state = seed

  return () => {
    state += 0x6d2b79f5
    let value = state
    value = Math.imul(value ^ (value >>> 15), value | 1)
    value ^= value + Math.imul(value ^ (value >>> 7), value | 61)
    return ((value ^ (value >>> 14)) >>> 0) / 4_294_967_296
  }
}

let demoRandom = mulberry32(DEMO_SEED)

export function isDemoModeEnabled(): boolean {
  return getSettingsSnapshot().demoMode
}

export function getSimulationRandom(): number {
  return isDemoModeEnabled() ? demoRandom() : Math.random()
}

export function resetDemoSeed(): void {
  demoRandom = mulberry32(DEMO_SEED)
}

export function setDemoModeEnabled(enabled: boolean): void {
  if (enabled) {
    resetDemoSeed()
  }
  useSettingsStore.getState().setDemoMode(enabled)
}

export { getSimulationCycleBounds } from "@/lib/settingsStore"
