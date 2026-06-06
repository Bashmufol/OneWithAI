import { resolveRoadRouteForIntent } from "@/lib/roadRouteResolver"
import { useMapIntentStore } from "@/store/mapIntentStore"
import {
  useNavigationStore,
  type NavigationRoute,
} from "@/store/navigationStore"

export function getCurrentMapRoute(): NavigationRoute | null {
  const { activeRoute, routeDestination } = useMapIntentStore.getState()
  if (!activeRoute) return null

  return {
    from: activeRoute.from,
    to: activeRoute.to,
    destinationLabel: routeDestination?.label,
  }
}

export async function startNavigationFromMapRoute(options?: {
  fullscreen?: boolean
  userLocation?: { lat: number; lng: number } | null
}): Promise<boolean> {
  const route = getCurrentMapRoute()
  if (!route) return false

  const mapIntent = useMapIntentStore.getState()
  let routeCoordinates = mapIntent.routeGeometry

  if (!routeCoordinates || routeCoordinates.length < 2) {
    routeCoordinates = await resolveRoadRouteForIntent(route.from, route.to)
  }

  useNavigationStore.getState().startNavigation({
    route,
    routeCoordinates,
    routeDurationSeconds: mapIntent.routeDurationSeconds,
    userLocation: options?.userLocation ?? route.from,
    fullscreen: options?.fullscreen ?? false,
  })

  return true
}

let ignoreNextPopState = false

export function exitNavigationWithHistory(): void {
  const { isNavigationFullscreen, exitNavigation } =
    useNavigationStore.getState()

  exitNavigation()

  if (isNavigationFullscreen && window.history.state?.evoNavigation) {
    ignoreNextPopState = true
    window.history.back()
  }
}

export function shouldIgnoreNavigationPopState(): boolean {
  if (!ignoreNextPopState) return false
  ignoreNextPopState = false
  return true
}

export function pushNavigationHistoryState(): void {
  window.history.pushState({ evoNavigation: true }, "")
}
