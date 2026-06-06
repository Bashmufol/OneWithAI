import { persistLastLocation } from "@/lib/locationPersistence"
import { useLocationStore } from "@/store/locationStore"

const GEOLOCATION_OPTIONS: PositionOptions = {
  enableHighAccuracy: false,
  timeout: 10_000,
  maximumAge: 60_000,
}

const HIGH_ACCURACY_OPTIONS: PositionOptions = {
  enableHighAccuracy: true,
  timeout: 15_000,
  maximumAge: 0,
}

const MAX_ATTEMPTS = 2

let initialRequestDone = false
let activeRequestId = 0
let requestInFlight = false

function handleLocationFailure() {
  const store = useLocationStore.getState()
  store.useFallbackLocation()
}

function applyGrantedCoords(coords: { lat: number; lng: number }) {
  const store = useLocationStore.getState()
  store.setCoords(coords)
  store.setLastKnownCoords(coords)
  persistLastLocation(coords)
  store.setStatus("granted")
}

function applyLastKnownFallback() {
  const store = useLocationStore.getState()
  const { lastKnownCoords } = store

  if (lastKnownCoords) {
    store.setCoords(lastKnownCoords)
    store.setStatus("granted")
    return true
  }

  return false
}

function handleLocationError(
  error: GeolocationPositionError,
  options?: { force?: boolean },
) {
  const store = useLocationStore.getState()
  const isPermissionDenied = error.code === error.PERMISSION_DENIED
  const isRecoverable =
    error.code === error.POSITION_UNAVAILABLE || error.code === error.TIMEOUT

  if (!isPermissionDenied && isRecoverable && applyLastKnownFallback()) {
    return
  }

  store.setStatus("denied")

  if (isPermissionDenied || options?.force) {
    return
  }

  handleLocationFailure()
}

function requestPosition(
  attempt: number,
  options?: { force?: boolean },
) {
  const requestId = ++activeRequestId
  const store = useLocationStore.getState()

  if (typeof navigator === "undefined" || !navigator.geolocation) {
    if (applyLastKnownFallback()) return
    store.setStatus("denied")
    if (!options?.force) handleLocationFailure()
    requestInFlight = false
    return
  }

  store.setStatus("loading")

  navigator.geolocation.getCurrentPosition(
    (position) => {
      if (requestId !== activeRequestId) return

      applyGrantedCoords({
        lat: position.coords.latitude,
        lng: position.coords.longitude,
      })
      requestInFlight = false
    },
    (error) => {
      if (requestId !== activeRequestId) return

      const canRetry =
        attempt < MAX_ATTEMPTS &&
        (error.code === error.POSITION_UNAVAILABLE ||
          error.code === error.TIMEOUT)

      if (canRetry) {
        requestPosition(attempt + 1, options)
        return
      }

      handleLocationError(error, options)
      requestInFlight = false
    },
    attempt === 0 ? GEOLOCATION_OPTIONS : HIGH_ACCURACY_OPTIONS,
  )
}

export function executeLocationRequest(options?: { force?: boolean }) {
  if (!options?.force && initialRequestDone) return
  if (!options?.force) initialRequestDone = true
  if (requestInFlight) {
    activeRequestId += 1
  }

  requestInFlight = true

  try {
    requestPosition(0, options)
  } catch {
    const store = useLocationStore.getState()
    if (applyLastKnownFallback()) {
      requestInFlight = false
      return
    }

    store.setStatus("denied")
    if (!options?.force) handleLocationFailure()
    requestInFlight = false
  }
}
