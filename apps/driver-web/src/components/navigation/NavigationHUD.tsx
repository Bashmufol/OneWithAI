import { Clock, Crosshair, MapPin, X } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { formatDistanceKm } from "@/lib/distance"
import { exitNavigationWithHistory } from "@/lib/navigationActions"
import {
  isNavigationActive,
  useNavigationStore,
} from "@/store/navigationStore"
import { cn } from "@/lib/utils"

export function NavigationHUD() {
  const navigationMode = useNavigationStore((state) => state.navigationMode)
  const currentRoute = useNavigationStore((state) => state.currentRoute)
  const distanceRemainingKm = useNavigationStore(
    (state) => state.distanceRemainingKm,
  )
  const routeDurationSeconds = useNavigationStore(
    (state) => state.routeDurationSeconds,
  )
  const progressPercentage = useNavigationStore((state) => state.progressPercentage)
  const resumeFollow = useNavigationStore((state) => state.resumeFollow)
  const isNavigationFullscreen = useNavigationStore(
    (state) => state.isNavigationFullscreen,
  )

  if (!isNavigationActive(navigationMode)) {
    return null
  }

  const etaMinutes =
    routeDurationSeconds && progressPercentage < 100
      ? Math.max(
          1,
          Math.round((routeDurationSeconds / 60) * (1 - progressPercentage / 100)),
        )
      : distanceRemainingKm !== null
        ? Math.max(1, Math.round((distanceRemainingKm / 45) * 60))
        : null

  return (
    <div
      className={cn(
        "pointer-events-none absolute inset-x-0 top-0 z-[15] flex flex-col gap-2 p-3",
        isNavigationFullscreen && "pt-[max(0.75rem,env(safe-area-inset-top))]",
      )}
    >
      <Card className="pointer-events-auto border-border/80 bg-card/95 shadow-lg ring-border/60 backdrop-blur-md">
        <CardContent className="flex items-start justify-between gap-3 p-3">
          <div className="min-w-0 flex-1">
            <p className="text-[10px] font-medium tracking-wide text-brand-cyan uppercase">
              {navigationMode === "paused" ? "Navigation paused" : "Navigating"}
            </p>
            <p className="truncate text-sm font-semibold">
              {currentRoute?.destinationLabel ?? "Charging destination"}
            </p>
            <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-elevated">
              <div
                className="h-full rounded-full bg-brand-cyan transition-[width] duration-300 ease-out"
                style={{ width: `${Math.min(100, Math.max(0, progressPercentage))}%` }}
              />
            </div>
            <div className="mt-2 flex flex-wrap gap-3 text-xs text-muted-foreground">
              <span className="inline-flex items-center gap-1">
                <MapPin className="size-3" />
                {Math.round(progressPercentage)}% complete
              </span>
              {distanceRemainingKm !== null ? (
                <span className="inline-flex items-center gap-1">
                  {formatDistanceKm(distanceRemainingKm)} remaining
                </span>
              ) : null}
              {etaMinutes !== null ? (
                <span className="inline-flex items-center gap-1">
                  <Clock className="size-3" />~{etaMinutes} min ETA
                </span>
              ) : null}
            </div>
          </div>

          <div className="flex shrink-0 items-center gap-2">
            {navigationMode === "paused" ? (
              <Button
                type="button"
                size="sm"
                variant="outline"
                className="h-8 gap-1.5 border-brand-cyan/40 bg-brand-cyan/10 text-brand-cyan"
                onClick={resumeFollow}
              >
                <Crosshair className="size-3.5" />
                Re-center
              </Button>
            ) : null}
            <Button
              type="button"
              size="icon"
              variant="outline"
              className="size-8"
              aria-label="Exit navigation"
              onClick={exitNavigationWithHistory}
            >
              <X className="size-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
