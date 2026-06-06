import { motion } from "framer-motion"
import { MapPin, Navigation } from "lucide-react"
import { useMemo } from "react"
import { useNavigate } from "react-router-dom"

import { AnimatedCard } from "@/components/ev/AnimatedCard"
import { PageSection } from "@/components/ev/PageSection"
import { MiniMapPreview } from "@/components/map/MiniMapPreview"
import { requestMapRouteWithDestination } from "@/lib/mapIntent"
import { EvoScoreBadge } from "@/components/stations/EvoScoreBadge"
import { useUserLocation } from "@/hooks/useUserLocation"
import { useLiveStationsQuery } from "@/hooks/useLiveStationsQuery"
import { useQueryRetry } from "@/hooks/useQueryRetry"
import { InlineErrorState } from "@/components/errors/InlineErrorState"
import { ErrorState } from "@/components/ui/ErrorState"
import { LoadingState } from "@/components/ui/LoadingState"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { getStationEvoScore } from "@/lib/evoscore"
import { slideUp, staggerContainer } from "@/lib/motion"
import {
  buildNearbyRecommendationReason,
  formatDistanceKm,
  getBestNearbyStation,
  sortNearbyStations,
} from "@/lib/nearbyStations"
import { cn } from "@/lib/utils"

const STATUS_BADGE_CLASSES = {
  available:
    "bg-status-available/15 text-status-available ring-1 ring-status-available/30",
  busy: "bg-status-busy/15 text-status-busy ring-1 ring-status-busy/30",
  offline:
    "bg-status-offline/15 text-status-offline ring-1 ring-status-offline/30",
} as const

export function NearMePage() {
  const navigate = useNavigate()
  const {
    safeLocation,
    status,
    isLoading: isLocating,
    usingFallback,
    hasPersistedLocation,
  } = useUserLocation()

  const {
    data: stations = [],
    isLoading: isStationsLoading,
    isError,
    isRefetchError,
    refetch,
  } = useLiveStationsQuery()
  const { onRetry, isRetrying } = useQueryRetry(refetch)

  const nearbyStations = useMemo(
    () => sortNearbyStations(stations, safeLocation.lat, safeLocation.lng),
    [stations, safeLocation.lat, safeLocation.lng],
  )

  const bestNearby = useMemo(
    () => getBestNearbyStation(stations, safeLocation.lat, safeLocation.lng),
    [stations, safeLocation.lat, safeLocation.lng],
  )

  const topThreeIds = useMemo(
    () => nearbyStations.slice(0, 3).map((station) => station.id),
    [nearbyStations],
  )

  if ((isStationsLoading || isLocating) && stations.length === 0) {
    return (
      <PageSection
        title="Near Me"
        description="Locating you and ranking nearby chargers…"
        badge="Feature 4"
        badgeVariant="outline"
      >
        <LoadingState
          title="Finding your position"
          description="Using device GPS with Nigeria fallback if needed."
          className="md:col-span-2 lg:col-span-3"
        />
      </PageSection>
    )
  }

  if (isError && stations.length === 0) {
    return (
      <PageSection title="Near Me" description="Unable to load nearby stations.">
        <ErrorState
          className="md:col-span-2 lg:col-span-3"
          onRetry={onRetry}
          isRetrying={isRetrying}
        />
      </PageSection>
    )
  }

  return (
    <PageSection
      title="Near Me"
      description="Location-aware charging intelligence ranked by distance, availability, and EvoScore."
      badge="Feature 4"
      badgeVariant="outline"
    >
      {isRefetchError && stations.length > 0 ? (
        <motion.div variants={slideUp} className="md:col-span-2 lg:col-span-3">
          <InlineErrorState onRetry={onRetry} isRetrying={isRetrying} />
        </motion.div>
      ) : null}
      <motion.div variants={slideUp} className="md:col-span-2 lg:col-span-3">
        <Card className="border-border/80 bg-card ring-border/60">
          <CardContent className="flex flex-wrap items-center justify-between gap-3 p-4">
            <div>
              <p className="text-sm font-medium">Your position</p>
              <p className="font-mono text-sm text-brand-cyan">
                {safeLocation.lat.toFixed(4)}° N, {safeLocation.lng.toFixed(4)}° E
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                {status === "granted"
                  ? "GPS location active"
                  : status === "loading"
                    ? "Acquiring GPS location…"
                    : usingFallback
                      ? "Permission denied — using Nigeria center fallback"
                      : hasPersistedLocation
                        ? "Using last known location"
                        : "Using default Nigeria coordinates"}
              </p>
            </div>
            <Badge variant="outline" className="border-border text-brand-violet">
              <Navigation className="mr-1 size-3" />
              {nearbyStations.length} nearby
            </Badge>
          </CardContent>
        </Card>
      </motion.div>

      {bestNearby ? (
        <motion.div variants={slideUp} className="md:col-span-2">
          <AnimatedCard
            title="Best nearby charger"
            description={buildNearbyRecommendationReason(bestNearby)}
          >
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="font-semibold">{bestNearby.name}</p>
                <p className="text-sm text-muted-foreground">
                  {bestNearby.operator} ·{" "}
                  {formatDistanceKm(bestNearby.distanceKm)}
                </p>
              </div>
              <EvoScoreBadge
                evoScore={getStationEvoScore(bestNearby)}
                size="md"
              />
            </div>
            <Button
              type="button"
              className="mt-4"
              size="sm"
              onClick={() => {
                requestMapRouteWithDestination(
                  { lat: safeLocation.lat, lng: safeLocation.lng },
                  {
                    label: bestNearby.name,
                    address: bestNearby.location.address,
                    lat: bestNearby.location.lat,
                    lng: bestNearby.location.lng,
                    stationId: bestNearby.id,
                    kind: "station",
                  },
                )
                navigate("/")
              }}
            >
              <MapPin className="size-4" />
              Navigate to station
            </Button>
          </AnimatedCard>
        </motion.div>
      ) : null}

      <motion.div variants={slideUp}>
        <AnimatedCard
          title="Nearby map"
          description="Your position and top 3 recommended stations."
        >
          <MiniMapPreview
            center={[safeLocation.lat, safeLocation.lng]}
            stations={nearbyStations.slice(0, 12)}
            highlightedStationIds={topThreeIds}
            userPosition={[safeLocation.lat, safeLocation.lng]}
            zoom={12}
            className="h-64"
          />
        </AnimatedCard>
      </motion.div>

      <motion.div
        variants={staggerContainer}
        className="md:col-span-2 lg:col-span-3"
      >
        <AnimatedCard
          title="Nearby stations"
          description="Sorted by distance, availability priority, then EvoScore."
        >
          <ul className="space-y-2">
            {nearbyStations.slice(0, 10).map((station, index) => {
              const evoScore = getStationEvoScore(station)
              const isTopPick = index < 3

              return (
                <motion.li key={station.id} variants={slideUp}>
                  <button
                    type="button"
                    onClick={() => navigate(`/stations/${station.id}`)}
                    className={cn(
                      "flex w-full items-center justify-between gap-3 rounded-lg border border-border/60 bg-elevated/40 p-3 text-left transition-colors hover:border-primary/30 hover:bg-elevated/70",
                      isTopPick && "ring-1 ring-brand-cyan/20",
                    )}
                  >
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="truncate font-medium">{station.name}</p>
                        {isTopPick ? (
                          <Badge className="h-5 bg-brand-cyan/15 px-1.5 text-[10px] text-brand-cyan ring-1 ring-brand-cyan/30">
                            Top {index + 1}
                          </Badge>
                        ) : null}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {formatDistanceKm(station.distanceKm)} ·{" "}
                        {station.operator}
                      </p>
                    </div>
                    <div className="flex shrink-0 items-center gap-2">
                      <Badge
                        className={cn(
                          "capitalize",
                          STATUS_BADGE_CLASSES[station.status],
                        )}
                      >
                        {station.status}
                      </Badge>
                      <EvoScoreBadge
                        evoScore={evoScore}
                        showLabel={false}
                      />
                    </div>
                  </button>
                </motion.li>
              )
            })}
          </ul>
        </AnimatedCard>
      </motion.div>
    </PageSection>
  )
}
