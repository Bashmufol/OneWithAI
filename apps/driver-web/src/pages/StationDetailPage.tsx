import { AnimatePresence, motion } from "framer-motion"
import {
  ArrowLeft,
  Clock,
  MapPin,
  Radio,
  Sparkles,
  Zap,
} from "lucide-react"
import { useMemo } from "react"
import { Link, useNavigate, useParams } from "react-router-dom"

import { AnimatedCard } from "@/components/ev/AnimatedCard"
import { PageSection } from "@/components/ev/PageSection"
import { MiniMapPreview } from "@/components/map/MiniMapPreview"
import { EvoScoreBadge } from "@/components/stations/EvoScoreBadge"
import { EvoScoreBreakdownContent } from "@/components/stations/EvoScoreBreakdown"
import { useChargingRoute } from "@/hooks/useChargingRoute"
import { useLiveStationsQuery } from "@/hooks/useLiveStationsQuery"
import { useUserLocation } from "@/hooks/useUserLocation"
import { ErrorState } from "@/components/ui/ErrorState"
import { LoadingState } from "@/components/ui/LoadingState"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import {
  getEvoScoreExplanation,
  getEvoScoreTone,
  getStationDemandPressure,
  getStationEvoScore,
  getStationReliabilityPercent,
} from "@/lib/evoscore"
import { requestMapRouteWithDestination } from "@/lib/mapIntent"
import { useLiveNetworkStore } from "@/lib/liveNetworkStore"
import { slideUp, staggerContainer } from "@/lib/motion"
import {
  formatEstimatedWait,
  formatLastUpdated,
  getMaxPowerKw,
} from "@/lib/stationMetrics"
import { cn } from "@/lib/utils"

const STATUS_BADGE_CLASSES = {
  available:
    "bg-status-available/15 text-status-available ring-1 ring-status-available/30",
  busy: "bg-status-busy/15 text-status-busy ring-1 ring-status-busy/30",
  offline:
    "bg-status-offline/15 text-status-offline ring-1 ring-status-offline/30",
} as const

const SCORE_TONE_RING = {
  excellent: "ring-status-available/40 shadow-[0_0_24px_oklch(0.765_0.177_163.223_/_25%)]",
  good: "ring-status-busy/40 shadow-[0_0_24px_oklch(0.828_0.189_84.429_/_20%)]",
  poor: "ring-status-offline/40 shadow-[0_0_24px_oklch(0.704_0.191_22.216_/_20%)]",
} as const

export function StationDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { safeLocation } = useUserLocation()

  const {
    data: stations = [],
    isLoading,
    isError,
    refetch,
  } = useLiveStationsQuery()

  const pulseEvents = useLiveNetworkStore((state) => state.pulseEvents)
  const recentlyChanged = useLiveNetworkStore((state) => state.recentlyChanged)
  const activeRoute = useChargingRoute(stations)

  const station = useMemo(
    () => stations.find((entry) => entry.id === id),
    [stations, id],
  )

  const latestPulse = useMemo(
    () => pulseEvents.find((event) => event.stationId === id),
    [pulseEvents, id],
  )

  const isRecommended = activeRoute?.primaryStationId === station?.id
  const isLiveUpdating = Boolean(id && recentlyChanged[id])

  if (isLoading && stations.length === 0) {
    return (
      <PageSection
        title="Station Detail"
        description="Loading live station intelligence…"
      >
        <LoadingState className="md:col-span-2 lg:col-span-3" />
      </PageSection>
    )
  }

  if (isError && stations.length === 0) {
    return (
      <PageSection title="Station Detail" description="Unable to load station.">
        <ErrorState
          className="md:col-span-2 lg:col-span-3"
          onRetry={() => {
            void refetch()
          }}
        />
      </PageSection>
    )
  }

  if (!station) {
    return (
      <PageSection
        title="Station not found"
        description="This station is not in the current network dataset."
      >
        <ErrorState
          title="Station not found"
          description="The station may be outside the loaded network scope."
          className="md:col-span-2 lg:col-span-3"
        />
      </PageSection>
    )
  }

  const evoScore = getStationEvoScore(station)
  const scoreTone = getEvoScoreTone(evoScore.score)
  const reliability = getStationReliabilityPercent(station)
  const demandPressure = getStationDemandPressure(station)
  const maxPower = getMaxPowerKw(station)

  const availabilityMetrics = [
    {
      label: "Availability",
      value: station.status,
      icon: Radio,
      key: "status",
    },
    {
      label: "Max power",
      value: `${maxPower} kW`,
      icon: Zap,
      key: "power",
    },
    {
      label: "Est. wait",
      value: formatEstimatedWait(station),
      icon: Clock,
      key: "wait",
    },
    {
      label: "Reliability",
      value: `${reliability}%`,
      icon: Sparkles,
      key: "reliability",
    },
    {
      label: "Demand",
      value: demandPressure,
      icon: Zap,
      key: "demand",
    },
    {
      label: "Connectors",
      value: station.connectors.map((c) => c.type).join(", "),
      icon: Zap,
      key: "connectors",
    },
  ] as const

  const handleViewOnMap = () => {
    requestMapRouteWithDestination(
      { lat: safeLocation.lat, lng: safeLocation.lng },
      {
        label: station.name,
        address: station.location.address,
        lat: station.location.lat,
        lng: station.location.lng,
        stationId: station.id,
        kind: "station",
      },
    )
    navigate("/")
  }

  return (
    <PageSection
      title={station.name}
      description={`${station.operator} · ${station.location.address}`}
      badge={isRecommended ? "Recommended" : "Live Station"}
      badgeVariant={isRecommended ? "default" : "outline"}
    >
      <motion.div
        variants={slideUp}
        className="flex flex-wrap items-center gap-2 md:col-span-2 lg:col-span-3"
      >
        <Button type="button" variant="outline" size="sm" asChild>
          <Link to="/">
            <ArrowLeft className="size-4" />
            Back to map
          </Link>
        </Button>
        {isLiveUpdating ? (
          <Badge
            variant="outline"
            className="border-brand-cyan/30 text-brand-cyan"
          >
            <Radio className="mr-1 size-3 animate-pulse" />
            Live update
          </Badge>
        ) : null}
        {isRecommended ? (
          <Badge className="bg-brand-violet/15 text-brand-violet ring-1 ring-brand-violet/30">
            Route recommended stop
          </Badge>
        ) : null}
      </motion.div>

      <motion.div
        variants={staggerContainer}
        className="grid gap-4 md:col-span-2 lg:col-span-3 lg:grid-cols-[minmax(0,1fr)_320px]"
      >
        <div className="space-y-4">
          <motion.div variants={slideUp}>
            <Card className="overflow-hidden border-border/80 bg-card ring-border/60">
              <CardContent className="p-0">
                <div className="grid gap-0 lg:grid-cols-[minmax(0,1fr)_auto]">
                  <div className="space-y-4 p-5">
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge
                        className={cn(
                          "capitalize",
                          STATUS_BADGE_CLASSES[station.status],
                        )}
                      >
                        {station.status}
                      </Badge>
                      <Badge
                        variant="outline"
                        className="border-border text-muted-foreground"
                      >
                        {station.operator}
                      </Badge>
                    </div>

                    <div className="flex flex-wrap items-end justify-between gap-4">
                      <div className="space-y-1">
                        <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
                          EvoScore intelligence
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {station.location.city} · Last updated{" "}
                          {formatLastUpdated(station.lastUpdated)}
                        </p>
                      </div>

                      <motion.div
                        className={cn(
                          "rounded-xl bg-elevated/50 px-4 py-3 ring-2",
                          SCORE_TONE_RING[scoreTone],
                        )}
                        animate={{
                          boxShadow: [
                            "0 0 0 0 oklch(0.789 0.154 194.769 / 0%)",
                            "0 0 20px 2px oklch(0.789 0.154 194.769 / 35%)",
                            "0 0 0 0 oklch(0.789 0.154 194.769 / 0%)",
                          ],
                        }}
                        transition={{
                          duration: 2.4,
                          repeat: Infinity,
                          ease: "easeInOut",
                        }}
                      >
                        <EvoScoreBadge
                          evoScore={evoScore}
                          size="md"
                          className="items-center"
                        />
                      </motion.div>
                    </div>

                    {latestPulse ? (
                      <p className="text-xs text-brand-cyan">
                        Latest pulse: {latestPulse.message}
                      </p>
                    ) : null}
                  </div>

                  <div className="flex items-center border-t border-border/60 bg-elevated/20 p-5 lg:border-t-0 lg:border-l">
                    <motion.div
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.97 }}
                    >
                      <Button
                        type="button"
                        className="bg-brand-cyan text-zinc-950 shadow-[0_0_20px_oklch(0.789_0.154_194.769_/_25%)] hover:bg-brand-cyan/90"
                        onClick={handleViewOnMap}
                      >
                        <MapPin className="size-4" />
                        View on map
                      </Button>
                    </motion.div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div variants={slideUp}>
            <AnimatedCard
              title="Live availability"
              description="Real-time station metrics with live network updates."
            >
              <motion.div
                variants={staggerContainer}
                initial="hidden"
                animate="visible"
                className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3"
              >
                {availabilityMetrics.map((metric) => (
                  <motion.div key={metric.key} variants={slideUp}>
                    <Card className="border-border/80 bg-elevated/30 ring-border/60 transition-colors hover:bg-elevated/45">
                      <CardContent className="space-y-2 p-4">
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <metric.icon className="size-3.5 text-brand-cyan" />
                          {metric.label}
                        </div>
                        <AnimatePresence mode="wait">
                          <motion.p
                            key={
                              metric.key === "status"
                                ? station.status
                                : metric.value
                            }
                            initial={{ opacity: 0, y: 6 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -6 }}
                            transition={{ duration: 0.22, ease: "easeOut" }}
                            className={cn(
                              "text-sm font-semibold capitalize",
                              metric.key === "status" &&
                                station.status === "available" &&
                                "text-status-available",
                              metric.key === "status" &&
                                station.status === "busy" &&
                                "text-status-busy",
                              metric.key === "status" &&
                                station.status === "offline" &&
                                "text-status-offline",
                            )}
                          >
                            {metric.value}
                          </motion.p>
                        </AnimatePresence>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </motion.div>
            </AnimatedCard>
          </motion.div>

          <motion.div variants={slideUp}>
            <AnimatedCard
              title="EvoScore breakdown"
              description={getEvoScoreExplanation(station)}
            >
              <div className="space-y-5">
                <div className="flex items-center justify-between rounded-lg bg-elevated/50 px-4 py-3 ring-1 ring-border/60">
                  <span className="text-sm font-medium">Final EvoScore</span>
                  <EvoScoreBadge evoScore={evoScore} size="md" />
                </div>
                <EvoScoreBreakdownContent
                  breakdown={evoScore.breakdown}
                  variant="detailed"
                />
              </div>
            </AnimatedCard>
          </motion.div>

          <motion.div variants={slideUp}>
            <AnimatedCard
              title="Connectors"
              description="Live connector capacity and types at this location."
            >
              <div className="grid gap-2 sm:grid-cols-2">
                {station.connectors.map((connector) => (
                  <div
                    key={connector.id}
                    className="rounded-lg bg-elevated/50 px-3 py-2 text-sm ring-1 ring-border/60"
                  >
                    <p className="font-medium">
                      {connector.type} · {connector.powerKw} kW
                    </p>
                    <p className="mt-0.5 text-xs capitalize text-muted-foreground">
                      {connector.status}
                    </p>
                  </div>
                ))}
              </div>
            </AnimatedCard>
          </motion.div>
        </div>

        <motion.div variants={slideUp} className="space-y-3">
          <AnimatedCard
            title="Location preview"
            description="Centered mini map with live status marker."
          >
            <MiniMapPreview
              station={station}
              zoom={14}
              className="h-64"
            />
          </AnimatedCard>
        </motion.div>
      </motion.div>
    </PageSection>
  )
}
