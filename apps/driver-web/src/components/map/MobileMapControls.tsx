import {
  Check,
  Crosshair,
  Flame,
  Globe,
  Layers,
  Moon,
  Navigation,
  Satellite,
} from "lucide-react"
import type { Map as LeafletMap } from "leaflet"
import { useState } from "react"

import { useMapStore } from "@/components/map/store"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { Switch } from "@/components/ui/switch"
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

interface MobileMapControlsProps {
  mapRef: React.RefObject<LeafletMap | null>
}

export function MobileMapControls({ mapRef }: MobileMapControlsProps) {
  const [open, setOpen] = useState(false)
  const heatmapEnabled = useMapStore((state) => state.heatmapEnabled)
  const setHeatmapEnabled = useMapStore((state) => state.setHeatmapEnabled)
  const mapStyle = useMapStyleStore((state) => state.currentMapStyle)
  const setMapStyle = useMapStyleStore((state) => state.setMapStyle)
  const { recenterToSafeLocation, handleMyLocation } =
    useMapControlActions(mapRef)

  const runAndClose = (action: () => void) => {
    action()
    setOpen(false)
  }

  return (
    <div
      className={cn(
        "absolute z-[10] md:hidden",
        "top-[max(0.75rem,env(safe-area-inset-top))]",
        "right-[max(1rem,env(safe-area-inset-right))]",
      )}
    >
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>
          <Button
            type="button"
            variant="secondary"
            size="sm"
            className="h-10 gap-2 border-border/60 bg-card/95 px-3 text-foreground shadow-lg backdrop-blur-sm hover:bg-card hover:text-foreground"
          >
            <Layers className="size-4 text-brand-cyan" aria-hidden="true" />
            <span className="text-foreground">Map Controls</span>
          </Button>
        </SheetTrigger>

        <SheetContent
          side="bottom"
          className="rounded-t-2xl px-4 pb-[max(1.5rem,env(safe-area-inset-bottom))]"
        >
          <SheetHeader className="px-0 text-left">
            <SheetTitle>Map Controls</SheetTitle>
            <SheetDescription>
              Style, heatmap, and navigation actions
            </SheetDescription>
          </SheetHeader>

          <div className="space-y-5 pt-2">
            <section className="space-y-2">
              <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
                Map style
              </p>
              <div className="grid grid-cols-3 gap-2">
                {MAP_STYLE_OPTIONS.map((option) => {
                  const Icon = MAP_STYLE_ICONS[option.value]
                  const isActive = mapStyle === option.value

                  return (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => setMapStyle(option.value)}
                      className={cn(
                        "flex flex-col items-center gap-1.5 rounded-lg border px-2 py-3 text-xs font-medium transition-colors",
                        isActive
                          ? "border-brand-cyan/40 bg-brand-cyan/10 text-brand-cyan"
                          : "border-border/60 bg-elevated/40 text-foreground",
                      )}
                    >
                      <Icon className="size-4" />
                      <span>{option.label}</span>
                      {isActive ? (
                        <Check className="size-3 text-brand-cyan" />
                      ) : (
                        <span className="size-3" />
                      )}
                    </button>
                  )
                })}
              </div>
            </section>

            <Separator />

            <section className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="flex size-9 items-center justify-center rounded-lg bg-brand-cyan/10 ring-1 ring-brand-cyan/25">
                  <Flame className="size-4 text-brand-cyan" />
                </div>
                <div>
                  <Label htmlFor="mobile-heatmap-toggle" className="text-sm">
                    Demand heatmap
                  </Label>
                  <p className="text-xs text-muted-foreground">
                    {heatmapEnabled ? "Overlay active" : "Overlay off"}
                  </p>
                </div>
              </div>
              <Switch
                id="mobile-heatmap-toggle"
                checked={heatmapEnabled}
                onCheckedChange={setHeatmapEnabled}
              />
            </section>

            <Separator />

            <section className="grid gap-2">
              <Button
                type="button"
                variant="outline"
                className="h-11 justify-start gap-3"
                onClick={() => runAndClose(recenterToSafeLocation)}
              >
                <Crosshair className="size-4 text-brand-cyan" />
                Reset map view
              </Button>
              <Button
                type="button"
                variant="outline"
                className="h-11 justify-start gap-3"
                onClick={() => runAndClose(handleMyLocation)}
              >
                <Navigation className="size-4 text-brand-cyan" />
                My location
              </Button>
            </section>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  )
}
