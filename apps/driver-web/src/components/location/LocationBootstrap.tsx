import { useEffect } from "react"

import { useLocationStore } from "@/store/locationStore"

export function LocationBootstrap() {
  useEffect(() => {
    useLocationStore.getState().hydrateFromStorage()
  }, [])

  return null
}
