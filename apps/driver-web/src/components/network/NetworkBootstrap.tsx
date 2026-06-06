import { onlineManager } from "@tanstack/react-query"
import { useEffect } from "react"

import {
  syncNetworkStateFromNavigator,
  useNetworkStore,
} from "@/store/networkStore"

export function NetworkBootstrap() {
  useEffect(() => {
    syncNetworkStateFromNavigator()

    return onlineManager.setEventListener((setOnline) => {
      const sync = () => {
        const online = navigator.onLine
        setOnline(online)
        useNetworkStore.getState().setIsOnline(online)
      }

      window.addEventListener("online", sync)
      window.addEventListener("offline", sync)
      sync()

      return () => {
        window.removeEventListener("online", sync)
        window.removeEventListener("offline", sync)
      }
    })
  }, [])

  return null
}
