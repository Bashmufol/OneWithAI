import { motion } from "framer-motion"
import { MapPin } from "lucide-react"
import { useEffect, useRef } from "react"

import { useMapStore } from "@/components/map/store"
import { EvoScoreBadge } from "@/components/stations/EvoScoreBadge"
import { SearchHighlightText } from "@/components/stations/SearchHighlight"
import { useStationFiltersStore } from "@/components/stations/store"
import { useUserLocation } from "@/hooks/useUserLocation"
import { formatDistanceLabel } from "@/lib/distance"
import { getStationEvoScore, type StationWithEvoScore } from "@/lib/evoscore"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { LoadingState } from "@/components/ui/LoadingState"
import { slideUp, staggerContainer } from "@/lib/motion"
import { cn } from "@/lib/utils"

interface StationListProps {
  stations: Array<StationWithEvoScore & { distanceKm: number }>
  isLoading?: boolean
  className?: string
}

const STATUS_BADGE_CLASSES = {
  available:
    "bg-status-available/15 text-status-available ring-1 ring-status-available/30",
  busy: "bg-status-busy/15 text-status-busy ring-1 ring-status-busy/30",
  offline:
    "bg-status-offline/15 text-status-offline ring-1 ring-status-offline/30",
} as const

export function StationList({
  stations,
  isLoading,
  className,
}: StationListProps) {
  const searchQuery = useStationFiltersStore((state) => state.searchQuery)
  const highlightedStationId = useMapStore(
    (state) => state.highlightedStationId,
  )
  const selectStation = useMapStore((state) => state.selectStation)
  const { usingFallback } = useUserLocation()
  const itemRefs = useRef<Record<string, HTMLButtonElement | null>>({})

  useEffect(() => {
    if (!highlightedStationId) return
    const element = itemRefs.current[highlightedStationId]
    element?.scrollIntoView({ behavior: "smooth", block: "nearest" })
  }, [highlightedStationId])

  if (isLoading) {
    return <LoadingState variant="list" />
  }

  if (stations.length === 0) {
    const hasSearch = searchQuery.trim().length > 0

    return (
      <Card className="border-border/80 bg-card ring-border/60">
        <CardContent className="flex min-h-48 flex-col items-center justify-center gap-2 p-6 text-center">
          <MapPin className="size-8 text-muted-foreground/60" />
          <p className="font-medium">
            {hasSearch ? "No results found" : "No stations match your filters"}
          </p>
          <p className="text-sm text-muted-foreground">
            {hasSearch
              ? `No stations match "${searchQuery}". Try a different name or operator.`
              : "Try adjusting filters or pan the map to explore more of Nigeria."}
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card
      className={cn(
        "shrink-0 overflow-visible border-border/80 bg-card ring-border/60",
        className,
      )}
    >
      <CardContent className="p-0">
        <div className="border-b border-border/60 px-4 py-3">
          <p className="text-sm font-medium">
            {stations.length} station{stations.length === 1 ? "" : "s"}
          </p>
          <p className="text-xs text-muted-foreground">
            Sorted by distance from your location
          </p>
        </div>

        <motion.ul
          className="space-y-2 p-3"
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
        >
          {stations.map((station) => {
            const isHighlighted = highlightedStationId === station.id
            const evoScore = getStationEvoScore(station)
            const maxPower = Math.max(
              ...station.connectors.map((connector) => connector.powerKw),
            )

            return (
              <motion.li key={station.id} variants={slideUp}>
                <motion.button
                  ref={(element) => {
                    itemRefs.current[station.id] = element
                  }}
                  type="button"
                  onClick={() => selectStation(station)}
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                  className={cn(
                    "w-full rounded-lg border border-border/60 bg-elevated/40 p-3 text-left transition-colors duration-200",
                    "hover:border-primary/30 hover:bg-elevated/70",
                    isHighlighted &&
                      "border-primary/40 bg-elevated ring-1 ring-primary/25 shadow-[0_0_20px_oklch(0.789_0.154_194.769_/_12%)]",
                  )}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-medium">
                        <SearchHighlightText
                          text={station.name}
                          query={searchQuery}
                        />
                      </p>
                      <p className="mt-0.5 truncate text-xs text-muted-foreground">
                        <SearchHighlightText
                          text={station.operator}
                          query={searchQuery}
                        />
                      </p>
                    </div>
                    <div className="flex shrink-0 flex-col items-end gap-1.5">
                      <EvoScoreBadge evoScore={evoScore} />
                      <Badge
                        className={cn(
                          "capitalize",
                          STATUS_BADGE_CLASSES[station.status],
                        )}
                      >
                        {station.status}
                      </Badge>
                    </div>
                  </div>

                  <div className="mt-2 flex items-center justify-between text-xs text-muted-foreground">
                    <span>Up to {maxPower} kW</span>
                    <span className="text-brand-cyan tabular-nums">
                      {formatDistanceLabel(station.distanceKm, {
                        approximate: usingFallback,
                      })}
                    </span>
                  </div>
                </motion.button>
              </motion.li>
            )
          })}
        </motion.ul>
      </CardContent>
    </Card>
  )
}
