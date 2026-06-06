import { create } from "zustand"

interface RouteStore {
  batteryLevel: number
  isRouteEnabled: boolean
  setBatteryLevel: (batteryLevel: number) => void
  setRouteEnabled: (enabled: boolean) => void
}

export const useRouteStore = create<RouteStore>((set) => ({
  batteryLevel: 35,
  isRouteEnabled: true,

  setBatteryLevel: (batteryLevel) =>
    set({ batteryLevel: Math.min(100, Math.max(5, batteryLevel)) }),

  setRouteEnabled: (isRouteEnabled) => set({ isRouteEnabled }),
}))
