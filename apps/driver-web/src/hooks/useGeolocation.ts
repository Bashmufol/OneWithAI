import { useUserLocation } from "@/hooks/useUserLocation"

/**
 * @deprecated Prefer `useUserLocation` for new code.
 * Kept for backward compatibility with existing Near Me integrations.
 */
export function useGeolocation() {
  const { safeLocation, status, isLoading, usingFallback } = useUserLocation()

  return {
    position: safeLocation,
    status:
      status === "unknown" || status === "fallback"
        ? usingFallback
          ? ("denied" as const)
          : ("loading" as const)
        : status === "loading"
          ? ("loading" as const)
          : status,
    isLoading,
    usingFallback,
  }
}
