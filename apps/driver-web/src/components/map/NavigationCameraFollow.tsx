import { useEffect, useRef } from "react"
import { useMap } from "react-leaflet"

import {
  enableNavigationFollow,
  getCameraFollowTarget,
  panMapToVehicle,
} from "@/lib/mapCameraFollow"
import { isMapContainerReady, runWhenMapReady } from "@/lib/mapReady"
import {
  isNavigationFollowing,
  useNavigationStore,
} from "@/store/navigationStore"

export function NavigationCameraFollow() {
  const map = useMap()
  const navigationMode = useNavigationStore((state) => state.navigationMode)
  const vehiclePosition = useNavigationStore((state) => state.vehiclePosition)
  const vehicleBearing = useNavigationStore((state) => state.vehicleBearing)
  const pauseFollow = useNavigationStore((state) => state.pauseFollow)
  const controllerRef = useRef<ReturnType<typeof enableNavigationFollow> | null>(
    null,
  )
  const hasInitialCenterRef = useRef(false)
  const panFrameRef = useRef<number | null>(null)

  useEffect(() => {
    controllerRef.current?.stop()
    controllerRef.current = null
    hasInitialCenterRef.current = false

    if (!isNavigationFollowing(navigationMode)) {
      return
    }

    let cancelled = false

    const startFollow = () => {
      if (cancelled || !isMapContainerReady(map)) return

      if (!hasInitialCenterRef.current && vehiclePosition) {
        const target = getCameraFollowTarget(vehiclePosition, vehicleBearing)
        map.flyTo(target.position, Math.max(map.getZoom(), 15), {
          animate: true,
          duration: 0.9,
        })
        hasInitialCenterRef.current = true
      }

      controllerRef.current?.stop()
      controllerRef.current = enableNavigationFollow(
        map,
        () =>
          vehiclePosition
            ? {
                position: [vehiclePosition.lat, vehiclePosition.lng],
                bearing: vehicleBearing,
              }
            : null,
        pauseFollow,
      )
    }

    const stopWatching = runWhenMapReady(map, startFollow)

    return () => {
      cancelled = true
      stopWatching()
      controllerRef.current?.stop()
      controllerRef.current = null
    }
  }, [navigationMode, map, pauseFollow, vehiclePosition, vehicleBearing])

  useEffect(() => {
    if (navigationMode !== "active" || !vehiclePosition) return

    const schedulePan = () => {
      if (!isMapContainerReady(map)) return

      if (panFrameRef.current !== null) {
        window.cancelAnimationFrame(panFrameRef.current)
      }

      panFrameRef.current = window.requestAnimationFrame(() => {
        panMapToVehicle(map, vehiclePosition, vehicleBearing)
        panFrameRef.current = null
      })
    }

    if (isMapContainerReady(map)) {
      schedulePan()
      return () => {
        if (panFrameRef.current !== null) {
          window.cancelAnimationFrame(panFrameRef.current)
          panFrameRef.current = null
        }
      }
    }

    const stopWatching = runWhenMapReady(map, schedulePan)

    return () => {
      stopWatching()
      if (panFrameRef.current !== null) {
        window.cancelAnimationFrame(panFrameRef.current)
        panFrameRef.current = null
      }
    }
  }, [navigationMode, vehiclePosition, vehicleBearing, map])

  return null
}
