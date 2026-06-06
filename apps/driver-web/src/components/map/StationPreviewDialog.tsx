import type { Station } from "@evocharge/types"
import { Info } from "lucide-react"
import { Link } from "react-router-dom"

import { useMapStore } from "@/components/map/store"
import { EvoScoreBadge } from "@/components/stations/EvoScoreBadge"
import { EvoScoreBreakdownContent } from "@/components/stations/EvoScoreBreakdown"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { getStationEvoScore } from "@/lib/evoscore"
import { cn } from "@/lib/utils"

const STATUS_BADGE_CLASSES = {
  available:
    "bg-status-available/15 text-status-available ring-1 ring-status-available/30",
  busy: "bg-status-busy/15 text-status-busy ring-1 ring-status-busy/30",
  offline:
    "bg-status-offline/15 text-status-offline ring-1 ring-status-offline/30",
} as const

export function StationPreviewDialog() {
  const selectedStation = useMapStore((state) => state.selectedStation)
  const setSelectedStation = useMapStore((state) => state.setSelectedStation)

  return (
    <Dialog
      open={selectedStation !== null}
      onOpenChange={(open) => {
        if (!open) setSelectedStation(null)
      }}
    >
      {selectedStation ? (
        <StationPreviewContent
          station={selectedStation}
          onViewDetails={() => setSelectedStation(null)}
        />
      ) : null}
    </Dialog>
  )
}

function StationPreviewContent({
  station,
  onViewDetails,
}: {
  station: Station
  onViewDetails: () => void
}) {
  const maxPower = Math.max(...station.connectors.map((c) => c.powerKw))
  const evoScore = getStationEvoScore(station)

  return (
    <DialogContent className="gap-6 border-border bg-card p-6 sm:max-w-md sm:p-7">
      <DialogHeader className="gap-3 pr-10 sm:pr-12">
        <div className="flex flex-wrap items-center gap-2.5">
          <DialogTitle className="text-lg leading-snug">
            {station.name}
          </DialogTitle>
          <Badge
            className={cn(
              "capitalize",
              STATUS_BADGE_CLASSES[station.status],
            )}
          >
            {station.status}
          </Badge>
        </div>
        <DialogDescription className="text-sm">
          {station.operator}
        </DialogDescription>
      </DialogHeader>

      <div className="space-y-4 text-sm">
        <p className="leading-relaxed text-muted-foreground">
          {station.location.address}
        </p>

        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-lg bg-elevated/60 px-3.5 py-3 ring-1 ring-border/60">
            <p className="text-xs text-muted-foreground">Max power</p>
            <p className="mt-1 font-medium">{maxPower} kW</p>
          </div>
          <div className="rounded-lg bg-elevated/60 px-3.5 py-3 ring-1 ring-border/60">
            <div className="flex items-center justify-between gap-2">
              <p className="text-xs text-muted-foreground">EvoScore</p>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    type="button"
                    className="text-muted-foreground transition-colors hover:text-foreground"
                    aria-label="EvoScore breakdown"
                  >
                    <Info className="size-3.5" />
                  </button>
                </TooltipTrigger>
                <TooltipContent side="top" className="w-44">
                  <p className="mb-2 font-medium">Score breakdown</p>
                  <EvoScoreBreakdownContent breakdown={evoScore.breakdown} />
                </TooltipContent>
              </Tooltip>
            </div>
            <div className="mt-1.5">
              <EvoScoreBadge
                evoScore={evoScore}
                size="md"
                className="items-start"
              />
            </div>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          {station.connectors.map((connector) => (
            <Badge key={connector.id} variant="outline" className="text-xs">
              {connector.type} · {connector.powerKw} kW
            </Badge>
          ))}
        </div>
      </div>

      <DialogFooter className="-mx-6 -mb-6 gap-3 border-t border-border/60 bg-muted/30 px-6 py-4 sm:-mx-7 sm:-mb-7 sm:justify-end sm:px-7 sm:py-5">
        <DialogClose asChild>
          <Button type="button" variant="outline">
            Close
          </Button>
        </DialogClose>
        <Button type="button" asChild>
          <Link to={`/stations/${station.id}`} onClick={onViewDetails}>
            View details
          </Link>
        </Button>
      </DialogFooter>
    </DialogContent>
  )
}
