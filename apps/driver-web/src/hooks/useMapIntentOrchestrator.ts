import type { Station } from "@evocharge/types"
import { useEffect, useState } from "react"

import { useMapStore } from "@/components/map/store"
import { useMapIntentStore } from "@/store/mapIntentStore"

const FOCUS_ZOOM = 14

export function useMapIntentOrchestrator(
  stations: Station[],
  isLoading: boolean,
) {
  const mode = useMapIntentStore((state) => state.mode)
  const selectedStationId = useMapIntentStore((state) => state.selectedStationId)
  const focusCoords = useMapIntentStore((state) => state.focusCoords)
  const routeFrom = useMapIntentStore((state) => state.routeFrom)
  const routeTo = useMapIntentStore((state) => state.routeTo)
  const clearIntent = useMapIntentStore((state) => state.clearIntent)
  const setActiveRoute = useMapIntentStore((state) => state.setActiveRoute)
  const selectStation = useMapStore((state) => state.selectStation)
  const setHighlightedStationId = useMapStore(
    (state) => state.setHighlightedStationId,
  )
  const [focusPulseId, setFocusPulseId] = useState<string | null>(null)

  useEffect(() => {
    if (isLoading || mode !== "focus") return
    if (!focusCoords) return

    const station = selectedStationId
      ? stations.find((entry) => entry.id === selectedStationId)
      : undefined

    if (station) {
      selectStation(station, { fly: true, openDialog: false })
      setFocusPulseId(station.id)
    } else {
      setHighlightedStationId(selectedStationId ?? null)
      useMapStore.setState({
        flyToRequest: {
          lat: focusCoords.lat,
          lng: focusCoords.lng,
          zoom: FOCUS_ZOOM,
        },
      })
      if (selectedStationId) {
        setFocusPulseId(selectedStationId)
      }
    }

    clearIntent()
  }, [
    clearIntent,
    focusCoords,
    isLoading,
    mode,
    selectStation,
    selectedStationId,
    setHighlightedStationId,
    stations,
  ])

  useEffect(() => {
    if (isLoading || mode !== "route") return
    if (!routeFrom || !routeTo) return

    setActiveRoute(routeFrom, routeTo)

    const destinationStation = stations.find(
      (station) =>
        Math.abs(station.location.lat - routeTo.lat) < 0.0001 &&
        Math.abs(station.location.lng - routeTo.lng) < 0.0001,
    )

    if (destinationStation) {
      setHighlightedStationId(destinationStation.id)
      setFocusPulseId(destinationStation.id)
    } else {
      setHighlightedStationId(null)
    }

    clearIntent()
  }, [
    clearIntent,
    isLoading,
    mode,
    routeFrom,
    routeTo,
    setActiveRoute,
    setHighlightedStationId,
    stations,
  ])

  useEffect(() => {
    if (!focusPulseId) return

    const timeoutId = window.setTimeout(() => {
      setFocusPulseId(null)
    }, 2800)

    return () => window.clearTimeout(timeoutId)
  }, [focusPulseId])

  return { focusPulseId }
}
