import type { LocationStatus } from "@/types/location"

export function hasLocationAccess(
  status: LocationStatus,
  allowFallbackAccess: boolean,
  hasPersistedLocation = false,
): boolean {
  if (status === "granted" || allowFallbackAccess) return true

  if (
    hasPersistedLocation &&
    (status === "unknown" || status === "denied")
  ) {
    return true
  }

  return false
}

export function shouldPromptForLocation(
  status: LocationStatus,
  allowFallbackAccess: boolean,
  hasPersistedLocation = false,
): boolean {
  if (allowFallbackAccess) return false

  if (hasPersistedLocation && status === "unknown") return false

  return status === "unknown" || status === "denied" || status === "fallback"
}
