import { MapPin } from "lucide-react"
import { useEffect } from "react"

import { useUserLocation } from "@/hooks/useUserLocation"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { useLocationStore } from "@/store/locationStore"
import { useLocationUIStore } from "@/store/locationUIStore"
import type { LocationStatus } from "@/types/location"
import { cn } from "@/lib/utils"

function getStatusLabel(status: LocationStatus): string {
  switch (status) {
    case "loading":
      return "Requesting location…"
    case "denied":
      return "Unable to get your position"
    case "fallback":
      return "Using Nigeria default location"
    case "granted":
      return "Location access enabled"
    case "unknown":
      return "Location not yet enabled"
  }
}

function getStatusBadgeClass(status: LocationStatus): string {
  switch (status) {
    case "granted":
      return "border-status-available/30 bg-status-available/10 text-status-available"
    case "denied":
      return "border-status-offline/30 bg-status-offline/10 text-status-offline"
    case "loading":
      return "border-brand-cyan/30 bg-brand-cyan/10 text-brand-cyan"
    case "fallback":
      return "border-status-busy/30 bg-status-busy/10 text-status-busy"
    case "unknown":
      return "border-border bg-elevated/50 text-muted-foreground"
  }
}

export function LocationPermissionModal() {
  const isOpen = useLocationUIStore((state) => state.isPermissionModalOpen)
  const closePermissionModal = useLocationUIStore(
    (state) => state.closePermissionModal,
  )
  const enableFallbackAccess = useLocationUIStore(
    (state) => state.enableFallbackAccess,
  )
  const { status, requestLocationPermission, isLoading } = useUserLocation()
  const applyFallbackLocation = useLocationStore(
    (state) => state.useFallbackLocation,
  )

  useEffect(() => {
    if (!isOpen) return

    if (status === "granted") {
      closePermissionModal()
    }
  }, [closePermissionModal, isOpen, status])

  const handleAllow = () => {
    requestLocationPermission()
  }

  const handleContinueWithout = () => {
    applyFallbackLocation()
    enableFallbackAccess()
    closePermissionModal()
  }

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) closePermissionModal()
      }}
    >
      <DialogContent className="gap-6 border-border bg-card p-6 sm:max-w-md sm:p-7">
        <DialogHeader className="gap-3 pr-10 sm:pr-12">
          <div className="flex items-start gap-3">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-brand-cyan/15 ring-1 ring-brand-cyan/25">
              <MapPin className="size-5 text-brand-cyan" />
            </div>
            <div className="min-w-0 space-y-2">
              <DialogTitle className="text-lg leading-snug">
                Enable Location Access
              </DialogTitle>
              <DialogDescription className="text-sm leading-relaxed">
                We use your location to show nearby charging stations, optimize
                routing, and improve EvoCharge recommendations.
              </DialogDescription>
            </div>
          </div>
          <Badge
            variant="outline"
            className={cn("w-fit capitalize", getStatusBadgeClass(status))}
          >
            {getStatusLabel(status)}
          </Badge>
        </DialogHeader>

        <DialogFooter className="-mx-6 -mb-6 gap-3 border-t border-border/60 bg-muted/30 px-6 py-4 sm:-mx-7 sm:-mb-7 sm:justify-end sm:px-7 sm:py-5">
          <Button
            type="button"
            variant="outline"
            onClick={handleContinueWithout}
            disabled={isLoading}
          >
            Continue without location
          </Button>
          <Button
            type="button"
            className="bg-brand-cyan text-zinc-950 hover:bg-brand-cyan/90"
            onClick={handleAllow}
            disabled={isLoading}
          >
            {isLoading ? "Requesting…" : "Allow Location Access"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
