import { Crosshair, Flame, Navigation } from "lucide-react"
import type { Map as LeafletMap } from "leaflet"
import { useEffect } from "react"

import { useMapStore } from "@/components/map/store"
import { useUserLocation } from "@/hooks/useUserLocation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Toggle } from "@/components/ui/toggle"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { DEFAULT_MAP_ZOOM } from "@/lib/geo"
import { getSafeLocation } from "@/lib/safeLocation"
import { useLocationStore } from "@/store/locationStore"
import { useLocationUIStore } from "@/store/locationUIStore"
import { cn } from "@/lib/utils"

interface MapControlsProps {
  mapRef: React.RefObject<LeafletMap | null>
}

export function MapControls({ mapRef }: MapControlsProps) {
  const heatmapEnabled = useMapStore((state) => state.heatmapEnabled)
  const setHeatmapEnabled = useMapStore((state) => state.setHeatmapEnabled)
  const locationStatus = useLocationStore((state) => state.status)
  const locationCoords = useLocationStore((state) => state.coords)
  const lastKnownCoords = useLocationStore((state) => state.lastKnownCoords)
  const fallbackCoords = useLocationStore((state) => state.fallbackCoords)
  const { status } = useUserLocation()
  const openPermissionModal = useLocationUIStore(
    (state) => state.openPermissionModal,
  )
  const triggerSource = useLocationUIStore((state) => state.triggerSource)

  const safeCenter = getSafeLocation({
    status: locationStatus,
    coords: locationCoords,
    lastKnownCoords,
    fallbackCoords,
  })

  const recenterToSafeLocation = () => {
    mapRef.current?.setView(
      [safeCenter.lat, safeCenter.lng],
      DEFAULT_MAP_ZOOM,
      { animate: true },
    )
  }

  const handleMyLocation = () => {
    if (status === "granted") {
      recenterToSafeLocation()
      return
    }

    openPermissionModal("map")
  }

  useEffect(() => {
    if (status === "granted" && triggerSource === "map") {
      recenterToSafeLocation()
    }
  }, [status, triggerSource])

  return (
    <div className="absolute top-4 right-4 z-[10] flex flex-col gap-2">
      <Card className="border-border/80 bg-card/90 shadow-lg ring-border/60 backdrop-blur-sm">
        <CardContent className="flex items-center gap-2.5 px-2.5 py-2">
          <Toggle
            pressed={heatmapEnabled}
            onPressedChange={setHeatmapEnabled}
            variant="outline"
            size="sm"
            aria-label="Toggle demand heatmap"
            className={cn(
              heatmapEnabled &&
                "border-brand-cyan/40 bg-brand-cyan/10 text-brand-cyan",
            )}
          >
            <Flame className="size-3.5" />
          </Toggle>
          <div className="min-w-0">
            <p className="text-xs font-medium leading-none">Demand Heatmap</p>
            <p className="mt-0.5 text-[10px] text-muted-foreground">
              {heatmapEnabled ? "Live intensity on" : "Tap to overlay"}
            </p>
          </div>
        </CardContent>
      </Card>

      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            type="button"
            variant="secondary"
            size="icon"
            className="size-9 bg-card/90 shadow-lg backdrop-blur-sm"
            onClick={handleMyLocation}
          >
            <Navigation className="size-4" />
            <span className="sr-only">Recenter to my location</span>
          </Button>
        </TooltipTrigger>
        <TooltipContent side="left">My location</TooltipContent>
      </Tooltip>

      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            type="button"
            variant="secondary"
            size="icon"
            className="size-9 bg-card/90 shadow-lg backdrop-blur-sm"
            onClick={recenterToSafeLocation}
          >
            <Crosshair className="size-4" />
            <span className="sr-only">Reset map view</span>
          </Button>
        </TooltipTrigger>
        <TooltipContent side="left">Reset map view</TooltipContent>
      </Tooltip>
    </div>
  )
}
