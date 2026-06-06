import { motion } from "framer-motion"
import { AlertTriangle, Battery, Navigation, Sparkles } from "lucide-react"

import { LocationSearchDropdown } from "@/components/map/LocationSearchDropdown"
import { useRouteStore } from "@/components/route/store"
import { EvoScoreBadge } from "@/components/stations/EvoScoreBadge"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import type { ActiveChargingRoute } from "@/hooks/useChargingRoute"
import { getStationEvoScore } from "@/lib/evoscore"
import { getRouteMode } from "@/lib/routeEngine"
import { slideUp } from "@/lib/motion"
import { cn } from "@/lib/utils"

const MODE_STYLES = {
  emergency: {
    badge: "bg-status-offline/15 text-status-offline ring-1 ring-status-offline/30",
    accent: "border-status-offline/40 bg-status-offline/5",
    label: "Emergency",
  },
  conservative: {
    badge: "bg-status-busy/15 text-status-busy ring-1 ring-status-busy/30",
    accent: "border-status-busy/30 bg-status-busy/5",
    label: "Conservative",
  },
  normal: {
    badge: "bg-status-available/15 text-status-available ring-1 ring-status-available/30",
    accent: "border-brand-cyan/30 bg-brand-cyan/5",
    label: "Normal",
  },
} as const

interface BatteryRoutePanelProps {
  activeRoute: ActiveChargingRoute | null
  onSelectStation: (stationId: string) => void
}

export function BatteryRoutePanel({
  activeRoute,
  onSelectStation,
}: BatteryRoutePanelProps) {
  const batteryLevel = useRouteStore((state) => state.batteryLevel)
  const isRouteEnabled = useRouteStore((state) => state.isRouteEnabled)
  const setBatteryLevel = useRouteStore((state) => state.setBatteryLevel)
  const setRouteEnabled = useRouteStore((state) => state.setRouteEnabled)

  const mode = getRouteMode(batteryLevel)
  const modeStyle = MODE_STYLES[mode]
  const routeResult = activeRoute?.result

  return (
    <Card
      className={cn(
        "shrink-0 overflow-visible border-border/80 bg-card ring-border/60 transition-colors",
        isRouteEnabled && modeStyle.accent,
      )}
    >
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <div
              className={cn(
                "flex size-8 items-center justify-center rounded-lg ring-1",
                mode === "emergency"
                  ? "bg-status-offline/15 ring-status-offline/30"
                  : "bg-brand-cyan/15 ring-brand-cyan/25",
              )}
            >
              {mode === "emergency" ? (
                <AlertTriangle className="size-4 text-status-offline" />
              ) : (
                <Navigation className="size-4 text-brand-cyan" />
              )}
            </div>
            <div>
              <CardTitle className="text-sm">Route Intelligence</CardTitle>
              <p className="text-xs text-muted-foreground">
                Battery-aware charging navigation
              </p>
            </div>
          </div>
          <Badge className={cn("capitalize", modeStyle.badge)}>
            {modeStyle.label}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="space-y-2">
          <label
            htmlFor="battery-level"
            className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground"
          >
            <Battery className="size-3.5" />
            Battery level
          </label>
          <div className="flex items-center gap-2">
            <input
              id="battery-level"
              type="range"
              min={5}
              max={100}
              step={1}
              value={batteryLevel}
              onChange={(event) =>
                setBatteryLevel(Number.parseInt(event.target.value, 10))
              }
              className="h-2 min-w-0 flex-1 cursor-pointer accent-brand-cyan"
            />
            <span
              className={cn(
                "w-10 text-right text-sm font-semibold tabular-nums",
                mode === "emergency" && "text-status-offline",
              )}
            >
              {batteryLevel}%
            </span>
          </div>
        </div>

        <div className="space-y-2">
          <p className="text-xs font-medium text-muted-foreground">Destination</p>
          <LocationSearchDropdown />
        </div>

        <div className="flex items-center justify-between gap-2">
          <p className="text-xs text-muted-foreground">
            Live route adapts to status + demand
          </p>
          <Button
            type="button"
            size="sm"
            variant={isRouteEnabled ? "default" : "outline"}
            className="h-7 text-xs"
            onClick={() => setRouteEnabled(!isRouteEnabled)}
          >
            {isRouteEnabled ? "Route on" : "Route off"}
          </Button>
        </div>

        {isRouteEnabled && routeResult ? (
          <motion.div
            variants={slideUp}
            initial="hidden"
            animate="visible"
            className="space-y-3"
          >
            <Separator />

            {routeResult.recommendedStations.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No viable charging stops on this corridor right now.
              </p>
            ) : (
              <div className="space-y-2">
                <p className="text-xs font-medium text-muted-foreground">
                  Recommended stop
                  {routeResult.recommendedStations.length > 1 ? "s" : ""}
                </p>
                {routeResult.recommendedStations.map((station) => {
                  const evoScore = getStationEvoScore(station)
                  const isPrimary = station.id === activeRoute?.primaryStationId

                  return (
                    <button
                      key={station.id}
                      type="button"
                      onClick={() => onSelectStation(station.id)}
                      className={cn(
                        "w-full rounded-lg border border-border/60 bg-elevated/40 p-3 text-left transition-all duration-200 hover:border-primary/30 hover:bg-elevated/70",
                        isPrimary &&
                          "border-primary/40 bg-elevated/70 shadow-[0_0_20px_oklch(0.789_0.154_194.769_/_10%)] ring-1 ring-primary/25",
                      )}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="truncate text-sm font-semibold">
                              {station.name}
                            </p>
                            {isPrimary ? (
                              <Badge className="h-5 bg-brand-cyan/15 px-1.5 text-[10px] text-brand-cyan ring-1 ring-brand-cyan/30">
                                Best stop
                              </Badge>
                            ) : null}
                          </div>
                          <p className="truncate text-xs text-muted-foreground">
                            {station.operator} · {station.status}
                          </p>
                        </div>
                        <EvoScoreBadge evoScore={evoScore} showLabel={false} />
                      </div>
                    </button>
                  )
                })}
              </div>
            )}

            <div className="rounded-lg bg-elevated/40 px-3 py-2.5 ring-1 ring-border/50">
              <p className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                EvoScore reasoning
              </p>
              <ul className="mt-2 space-y-1.5">
                {routeResult.reason.map((line) => (
                  <li
                    key={line}
                    className="flex items-start gap-2 text-xs leading-relaxed text-muted-foreground"
                  >
                    <Sparkles className="mt-0.5 size-3 shrink-0 text-brand-cyan" />
                    <span>{line}</span>
                  </li>
                ))}
              </ul>
            </div>
          </motion.div>
        ) : null}
      </CardContent>
    </Card>
  )
}
