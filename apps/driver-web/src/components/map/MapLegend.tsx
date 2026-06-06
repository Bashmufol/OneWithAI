import { useMapStore } from "@/components/map/store"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"

export function MapLegend() {
  const heatmapEnabled = useMapStore((state) => state.heatmapEnabled)

  return (
    <Card className="pointer-events-none absolute bottom-[max(1rem,env(safe-area-inset-bottom))] left-[max(1rem,env(safe-area-inset-left))] z-10 max-w-[calc(100%-5.5rem)] border-border/80 bg-card/90 shadow-lg ring-border/60 backdrop-blur-sm md:max-w-none">
      <CardContent className="space-y-2 px-3 py-2">
        <div className="flex flex-wrap gap-2">
          <Badge className="bg-status-available/15 text-status-available ring-1 ring-status-available/30">
            Available
          </Badge>
          <Badge className="bg-status-busy/15 text-status-busy ring-1 ring-status-busy/30">
            Busy
          </Badge>
          <Badge className="bg-status-offline/15 text-status-offline ring-1 ring-status-offline/30">
            Offline
          </Badge>
        </div>

        {heatmapEnabled ? (
          <div className="space-y-1 border-t border-border/50 pt-2">
            <p className="text-[10px] font-medium tracking-wide text-muted-foreground uppercase">
              Demand intensity
            </p>
            <div className="h-1.5 w-36 rounded-full bg-gradient-to-r from-status-available via-status-busy to-status-offline opacity-80" />
            <p className="text-[10px] text-muted-foreground">Low → High demand</p>
          </div>
        ) : null}
      </CardContent>
    </Card>
  )
}
