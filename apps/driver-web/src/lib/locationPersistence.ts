import type { Coordinates } from "@/types/location"

const STORAGE_KEY = "evocharge-last-location"

function isValidCoordinates(value: unknown): value is Coordinates {
  if (!value || typeof value !== "object") return false

  const candidate = value as Partial<Coordinates>
  return (
    typeof candidate.lat === "number" &&
    Number.isFinite(candidate.lat) &&
    typeof candidate.lng === "number" &&
    Number.isFinite(candidate.lng)
  )
}

export function persistLastLocation(coords: Coordinates): void {
  if (typeof window === "undefined") return

  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(coords))
  } catch {
    // Ignore quota / private browsing errors.
  }
}

export function readLastLocation(): Coordinates | null {
  if (typeof window === "undefined") return null

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return null

    const parsed: unknown = JSON.parse(raw)
    return isValidCoordinates(parsed) ? parsed : null
  } catch {
    return null
  }
}

export function clearLastLocation(): void {
  if (typeof window === "undefined") return

  try {
    window.localStorage.removeItem(STORAGE_KEY)
  } catch {
    // Ignore storage errors.
  }
}
