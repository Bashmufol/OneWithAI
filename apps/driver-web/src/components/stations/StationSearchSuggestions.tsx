import type { StationStatus } from "@evocharge/types"
import { AnimatePresence, motion } from "framer-motion"

import { EvoScoreBadge } from "@/components/stations/EvoScoreBadge"
import { SearchHighlightText } from "@/components/stations/SearchHighlight"
import { Card } from "@/components/ui/card"
import { getStationEvoScore, type StationWithEvoScore } from "@/lib/evoscore"
import { cn } from "@/lib/utils"

const STATUS_DOT_CLASSES: Record<StationStatus, string> = {
  available: "bg-status-available shadow-[0_0_6px_oklch(0.765_0.177_163.223_/_50%)]",
  busy: "bg-status-busy shadow-[0_0_6px_oklch(0.795_0.184_86.047_/_50%)]",
  offline: "bg-status-offline shadow-[0_0_6px_oklch(0.553_0.013_264.364_/_50%)]",
}

interface StationSearchSuggestionsProps {
  suggestions: StationWithEvoScore[]
  query: string
  activeIndex: number
  onSelect: (station: StationWithEvoScore) => void
  onHover: (index: number) => void
}

export function StationSearchSuggestions({
  suggestions,
  query,
  activeIndex,
  onSelect,
  onHover,
}: StationSearchSuggestionsProps) {
  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -6 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -6 }}
        transition={{ duration: 0.15, ease: "easeOut" }}
        className="absolute top-[calc(100%+6px)] right-0 left-0 z-[200]"
      >
        <Card className="overflow-hidden border-border/80 bg-popover py-1 shadow-lg ring-1 ring-foreground/10">
          <ul
            role="listbox"
            aria-label="Station suggestions"
            className="max-h-[min(320px,50vh)] overflow-y-auto"
          >
            {suggestions.map((station, index) => {
              const isActive = index === activeIndex
              const evoScore = getStationEvoScore(station)

              return (
                <li key={station.id} role="option" aria-selected={isActive}>
                  <button
                    id={`station-suggestion-${station.id}`}
                    type="button"
                    className={cn(
                      "flex w-full items-center gap-3 px-3 py-2.5 text-left transition-colors",
                      isActive
                        ? "bg-elevated/80"
                        : "hover:bg-elevated/60",
                    )}
                    onMouseDown={(event) => event.preventDefault()}
                    onMouseEnter={() => onHover(index)}
                    onClick={() => onSelect(station)}
                  >
                    <span
                      className={cn(
                        "size-2 shrink-0 rounded-full",
                        STATUS_DOT_CLASSES[station.status],
                      )}
                      aria-hidden
                    />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold">
                        <SearchHighlightText
                          text={station.name}
                          query={query}
                        />
                      </p>
                      <p className="truncate text-xs text-muted-foreground">
                        <SearchHighlightText
                          text={station.operator}
                          query={query}
                        />
                      </p>
                    </div>
                    <EvoScoreBadge
                      evoScore={evoScore}
                      showLabel={false}
                      className="shrink-0"
                    />
                  </button>
                </li>
              )
            })}
          </ul>
        </Card>
      </motion.div>
    </AnimatePresence>
  )
}
