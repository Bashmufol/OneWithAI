import { Navigation } from "lucide-react"

import { useUserLocation } from "@/hooks/useUserLocation"
import { Button } from "@/components/ui/button"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { useLocationUIStore } from "@/store/locationUIStore"

export function NavbarLocationButton() {
  const { status, requestLocationPermission, isLoading } = useUserLocation()
  const openPermissionModal = useLocationUIStore(
    (state) => state.openPermissionModal,
  )

  const handleClick = () => {
    if (status === "granted") {
      requestLocationPermission()
      return
    }

    openPermissionModal("manual")
  }

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="text-muted-foreground"
          aria-label="Locate me"
          onClick={handleClick}
          disabled={isLoading}
        >
          <Navigation className="size-4" />
        </Button>
      </TooltipTrigger>
      <TooltipContent>Locate me</TooltipContent>
    </Tooltip>
  )
}
