import type { StationStatus } from "@evocharge/types"
import { create } from "zustand"

import { useMapStore } from "@/components/map/store"
import { enrichStationWithEvoScore, type StationWithEvoScore } from "@/lib/evoscore"
import type { PulseEvent } from "@/lib/networkPulseEngine"

const MAX_PULSE_EVENTS = 50
const PULSE_GLOW_MS = 1_500

interface LiveNetworkState {
  statusById: Record<string, StationStatus>
  pulseEvents: PulseEvent[]
  recentlyChanged: Record<string, number>
  stationNames: Record<string, string>
  applyStatusChange: (
    station: StationWithEvoScore,
    newStatus: StationStatus,
    event: PulseEvent,
  ) => void
  registerStations: (stations: StationWithEvoScore[]) => void
  getLiveStatus: (stationId: string, fallback: StationStatus) => StationStatus
}

export const useLiveNetworkStore = create<LiveNetworkState>((set, get) => ({
  statusById: {},
  pulseEvents: [],
  recentlyChanged: {},
  stationNames: {},

  registerStations: (stations) => {
    const stationNames = { ...get().stationNames }
    for (const station of stations) {
      stationNames[station.id] = station.name
    }
    set({ stationNames })
  },

  getLiveStatus: (stationId, fallback) =>
    get().statusById[stationId] ?? fallback,

  applyStatusChange: (station, newStatus, event) => {
    const enriched = enrichStationWithEvoScore({
      ...station,
      status: newStatus,
    })

    set((state) => ({
      statusById: { ...state.statusById, [station.id]: newStatus },
      pulseEvents: [event, ...state.pulseEvents].slice(0, MAX_PULSE_EVENTS),
      recentlyChanged: {
        ...state.recentlyChanged,
        [station.id]: Date.now(),
      },
    }))

    const mapStore = useMapStore.getState()
    if (mapStore.selectedStation?.id === station.id) {
      mapStore.setSelectedStation(enriched)
    }

    window.setTimeout(() => {
      set((state) => {
        if (!state.recentlyChanged[station.id]) return state
        const nextRecentlyChanged = { ...state.recentlyChanged }
        delete nextRecentlyChanged[station.id]
        return { recentlyChanged: nextRecentlyChanged }
      })
    }, PULSE_GLOW_MS)
  },
}))
