import type { StationStatus } from "@evocharge/types"

import { getSimulationRandom, isDemoModeEnabled } from "@/lib/demoMode"

export const SIMULATION_CYCLE_MIN_MS = 2_000
export const SIMULATION_CYCLE_MAX_MS = 10_000

export interface PulseEvent {
  stationId: string
  stationName: string
  previousStatus: StationStatus
  newStatus: StationStatus
  timestamp: number
  message: string
}

const WEIGHTED_TRANSITIONS: Record<
  StationStatus,
  { status: StationStatus; weight: number }[]
> = {
  available: [
    { status: "busy", weight: 0.65 },
    { status: "available", weight: 0.2 },
    { status: "offline", weight: 0.15 },
  ],
  busy: [
    { status: "available", weight: 0.45 },
    { status: "busy", weight: 0.3 },
    { status: "offline", weight: 0.25 },
  ],
  offline: [
    { status: "offline", weight: 0.75 },
    { status: "available", weight: 0.25 },
  ],
}

export function getSimulationCycleDelayMs(): number {
  const range = SIMULATION_CYCLE_MAX_MS - SIMULATION_CYCLE_MIN_MS
  return (
    SIMULATION_CYCLE_MIN_MS +
    Math.floor(getSimulationRandom() * (range + 1))
  )
}

export function pickRandomStationIndex(stationCount: number): number {
  if (stationCount <= 1) return 0
  return Math.floor(getSimulationRandom() * stationCount)
}

export function getNextStatus(current: StationStatus): StationStatus {
  const transitions = WEIGHTED_TRANSITIONS[current]
  const roll = getSimulationRandom()
  let cumulative = 0

  for (const transition of transitions) {
    cumulative += transition.weight
    if (roll <= cumulative) {
      if (
        isDemoModeEnabled() &&
        transition.status === current &&
        transitions.length > 1
      ) {
        const alternate = transitions.find(
          (entry) => entry.status !== current,
        )
        return alternate?.status ?? current
      }

      return transition.status
    }
  }

  return current
}

export function formatPulseMessage(
  stationName: string,
  previousStatus: StationStatus,
  newStatus: StationStatus,
): string {
  return `${stationName} went from ${previousStatus.toUpperCase()} → ${newStatus.toUpperCase()}`
}

export function createPulseEvent(
  stationId: string,
  stationName: string,
  previousStatus: StationStatus,
  newStatus: StationStatus,
): PulseEvent {
  return {
    stationId,
    stationName,
    previousStatus,
    newStatus,
    timestamp: Date.now(),
    message: formatPulseMessage(stationName, previousStatus, newStatus),
  }
}
