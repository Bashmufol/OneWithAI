import { Crosshair, Flame, Globe, Moon, Navigation, Satellite } from "lucide-react"
import type { Map as LeafletMap } from "leaflet"

import { useMapStore } from "@/components/map/store"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Toggle } from "@/components/ui/toggle"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { useMapControlActions } from "@/hooks/useMapControlActions"
import type { MapStyle } from "@/lib/mapTiles"
import { MAP_STYLE_OPTIONS } from "@/lib/mapTiles"
import { useMapStyleStore } from "@/store/mapStyleStore"
import { cn } from "@/lib/utils"

const MAP_STYLE_ICONS: Record<MapStyle, typeof Globe> = {
  standard: Globe,
  dark: Moon,
  satellite: Satellite,
}

interface MapControlsProps {
  mapRef: React.RefObject<LeafletMap | null>
}

export function MapControls({ mapRef }: MapControlsProps) {
  const heatmapEnabled = useMapStore((state) => state.heatmapEnabled)
  const setHeatmapEnabled = useMapStore((state) => state.setHeatmapEnabled)
  const mapStyle = useMapStyleStore((state) => state.currentMapStyle)
  const setMapStyle = useMapStyleStore((state) => state.setMapStyle)
  const { recenterToSafeLocation, handleMyLocation } =
    useMapControlActions(mapRef)

  return (
    <div className="absolute top-4 right-4 z-[10] hidden flex-col gap-2 md:flex">
      <Card className="border-border/80 bg-card/90 shadow-lg ring-border/60 backdrop-blur-sm">
        <CardContent className="space-y-2 px-2.5 py-2">
          <div className="min-w-0">
            <p className="text-xs font-medium leading-none">Map style</p>
            <p className="mt-0.5 text-[10px] text-muted-foreground">
              Switch base layer
            </p>
          </div>
          <ToggleGroup
            type="single"
            value={mapStyle}
            onValueChange={(value) => {
              if (value) setMapStyle(value as MapStyle)
            }}
            variant="outline"
            size="sm"
            className="grid w-full grid-cols-3 gap-1"
          >
            {MAP_STYLE_OPTIONS.map((option) => {
              const Icon = MAP_STYLE_ICONS[option.value]
              const isActive = mapStyle === option.value

              return (
                <ToggleGroupItem
                  key={option.value}
                  value={option.value}
                  aria-label={`${option.label} map`}
                  className={cn(
                    "flex h-8 flex-col gap-0.5 px-1 text-[9px] leading-none",
                    isActive &&
                      "border-brand-cyan/40 bg-brand-cyan/10 text-brand-cyan",
                  )}
                >
                  <Icon className="size-3.5" />
                  <span>{option.label}</span>
                </ToggleGroupItem>
              )
            })}
          </ToggleGroup>
        </CardContent>
      </Card>

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
