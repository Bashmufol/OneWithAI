import { MapPin } from "lucide-react"
import { useEffect } from "react"

import { hasLocationAccess, shouldPromptForLocation } from "@/lib/locationAccess"
import { useUserLocation } from "@/hooks/useUserLocation"
import { LoadingState } from "@/components/ui/LoadingState"
import { Button } from "@/components/ui/button"
import {
  type LocationTriggerSource,
  useLocationUIStore,
} from "@/store/locationUIStore"

interface RequireLocationProps {
  children: React.ReactNode
  source?: LocationTriggerSource
}

export function RequireLocation({
  children,
  source = "near-me",
}: RequireLocationProps) {
  const { status, hasPersistedLocation } = useUserLocation()
  const allowFallbackAccess = useLocationUIStore(
    (state) => state.allowFallbackAccess,
  )
  const isPermissionModalOpen = useLocationUIStore(
    (state) => state.isPermissionModalOpen,
  )
  const openPermissionModal = useLocationUIStore(
    (state) => state.openPermissionModal,
  )

  const canAccess = hasLocationAccess(
    status,
    allowFallbackAccess,
    hasPersistedLocation,
  )

  useEffect(() => {
    if (canAccess) return
    if (status === "loading") return
    if (isPermissionModalOpen) return

    if (
      shouldPromptForLocation(
        status,
        allowFallbackAccess,
        hasPersistedLocation,
      )
    ) {
      openPermissionModal(source)
    }
  }, [
    allowFallbackAccess,
    canAccess,
    hasPersistedLocation,
    isPermissionModalOpen,
    openPermissionModal,
    source,
    status,
  ])

  if (status === "loading" && !allowFallbackAccess && !hasPersistedLocation) {
    return (
      <LoadingState
        title="Finding your position"
        description="Requesting location access…"
      />
    )
  }

  if (!canAccess) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center p-6">
        <div className="max-w-md space-y-4 text-center">
          <LoadingState
            title="Location required"
            description="Enable location access or continue with Nigeria fallback to use this feature."
          />
          {!isPermissionModalOpen ? (
            <Button
              type="button"
              className="bg-brand-cyan text-zinc-950 hover:bg-brand-cyan/90"
              onClick={() => openPermissionModal(source)}
            >
              <MapPin className="size-4" />
              Enable location access
            </Button>
          ) : null}
        </div>
      </div>
    )
  }

  return children
}
