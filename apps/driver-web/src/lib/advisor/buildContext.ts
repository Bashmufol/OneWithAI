import { classifyIntent } from "@/lib/advisor/classifyIntent"
import type { AdvisorContext, AdvisorInput } from "@/lib/advisor/types"
import { NIGERIA_FALLBACK_COORDS } from "@/store/locationStore"

export function buildContext(input: AdvisorInput): AdvisorContext {
  const userLocation = {
    lat: Number.isFinite(input.userLocation.lat)
      ? input.userLocation.lat
      : NIGERIA_FALLBACK_COORDS.lat,
    lng: Number.isFinite(input.userLocation.lng)
      ? input.userLocation.lng
      : NIGERIA_FALLBACK_COORDS.lng,
  }

  const batteryLevel = Number.isFinite(input.batteryLevel)
    ? Math.min(100, Math.max(5, input.batteryLevel))
    : 35

  return {
    query: input.query.trim(),
    intent: classifyIntent(input.query),
    stations: input.stations ?? [],
    userLocation,
    batteryLevel,
    activeRoute: input.activeRoute ?? null,
    usingFallbackLocation: input.usingFallbackLocation ?? false,
  }
}
