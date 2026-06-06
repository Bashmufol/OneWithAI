import { create } from "zustand"

interface NetworkState {
  isOnline: boolean
  lastOnline: number
  lastOffline: number
  setIsOnline: (online: boolean) => void
}

function readNavigatorOnline(): boolean {
  if (typeof navigator === "undefined") return true
  return navigator.onLine
}

const initiallyOnline = readNavigatorOnline()
const now = Date.now()

export const useNetworkStore = create<NetworkState>((set) => ({
  isOnline: initiallyOnline,
  lastOnline: initiallyOnline ? now : 0,
  lastOffline: initiallyOnline ? 0 : now,

  setIsOnline: (online) => {
    set((state) => {
      if (state.isOnline === online) return state

      const timestamp = Date.now()
      return {
        isOnline: online,
        lastOnline: online ? timestamp : state.lastOnline,
        lastOffline: online ? state.lastOffline : timestamp,
      }
    })
  },
}))

export function syncNetworkStateFromNavigator(): void {
  useNetworkStore.getState().setIsOnline(readNavigatorOnline())
}
