import type { Coordinates, LocationState } from "@/types/location"

export function getSafeLocation(
  locationState: Pick<
    LocationState,
    "status" | "coords" | "lastKnownCoords" | "fallbackCoords"
  >,
): Coordinates {
  if (locationState.status === "granted" && locationState.coords) {
    return locationState.coords
  }

  if (locationState.lastKnownCoords) {
    return locationState.lastKnownCoords
  }

  return locationState.fallbackCoords
}
