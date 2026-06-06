import { motion } from "framer-motion"
import { Link } from "react-router-dom"
import { Sparkles } from "lucide-react"
import { useMemo } from "react"

import { AnimatedCard } from "@/components/ev/AnimatedCard"
import { PageSection } from "@/components/ev/PageSection"
import { EvoScoreBadge } from "@/components/stations/EvoScoreBadge"
import { EvoScoreBreakdownContent } from "@/components/stations/EvoScoreBreakdown"
import { useLiveStationsQuery } from "@/hooks/useLiveStationsQuery"
import { useQueryRetry } from "@/hooks/useQueryRetry"
import { ErrorState } from "@/components/ui/ErrorState"
import { DataFetchError } from "@/components/ui/DataFetchError"
import { LoadingState } from "@/components/ui/LoadingState"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  buildEvoScoreComparisons,
  getEvoScoreDistribution,
  getTierLabel,
} from "@/lib/evoscoreAnalytics"
import { getEvoScoreExplanation } from "@/lib/evoscore"
import { useLiveNetworkStore } from "@/lib/liveNetworkStore"
import { slideUp, staggerContainer } from "@/lib/motion"
import { cn } from "@/lib/utils"

const TIER_BAR_CLASSES = {
  excellent: "bg-status-available",
  good: "bg-status-busy",
  fair: "bg-brand-violet/70",
  poor: "bg-status-offline",
} as const

export function EvoScorePage() {
  const {
    data: stations = [],
    isLoading,
    isError,
    isRefetchError,
    refetch,
  } = useLiveStationsQuery()
  const { onRetry, isRetrying } = useQueryRetry(refetch)

  const pulseRevision = useLiveNetworkStore((state) => state.pulseEvents.length)

  const distribution = useMemo(
    () => getEvoScoreDistribution(stations),
    [stations, pulseRevision],
  )

  const comparisons = useMemo(
    () => buildEvoScoreComparisons(stations, 3),
    [stations, pulseRevision],
  )

  const maxBucket = Math.max(
    distribution.excellent,
    distribution.good,
    distribution.fair,
    distribution.poor,
    1,
  )

  if (isLoading && stations.length === 0) {
    return (
      <PageSection
        title="EvoScore"
        description="Loading network intelligence scores…"
        badge="Feature 5"
      >
        <LoadingState className="md:col-span-2 lg:col-span-3" />
      </PageSection>
    )
  }

  if (isError && stations.length === 0) {
    return (
      <PageSection title="EvoScore" description="Unable to load score data.">
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
      title="EvoScore"
      description="Understand how EvoCharge ranks stations using live availability, demand pressure, and reliability."
      badge="Live Intelligence"
    >
      {isRefetchError && stations.length > 0 ? (
        <motion.div variants={slideUp} className="md:col-span-2 lg:col-span-3">
          <DataFetchError onRetry={onRetry} isRetrying={isRetrying} />
        </motion.div>
      ) : null}
      <motion.div variants={slideUp} className="md:col-span-2 lg:col-span-3">
        <AnimatedCard
          title="What is EvoScore?"
          description="A real-time charging quality index from 0–100 that helps you pick the best station for your trip."
        >
          <div className="grid gap-3 md:grid-cols-3">
            {[
              "Availability weighs whether connectors are open right now.",
              "Demand pressure reflects how busy the network zone is.",
              "Reliability captures uptime and consistency signals.",
            ].map((line) => (
              <p
                key={line}
                className="rounded-lg bg-elevated/40 px-3 py-2 text-sm text-muted-foreground ring-1 ring-border/60"
              >
                {line}
              </p>
            ))}
          </div>
          <p className="mt-3 text-xs text-brand-cyan">
            Scores update automatically when the live network simulation changes
            station status.
          </p>
        </AnimatedCard>
      </motion.div>

      <motion.div variants={slideUp}>
        <AnimatedCard
          title="Score distribution"
          description={`Across ${distribution.total} Lagos stations in the network.`}
        >
          <div className="space-y-3">
            {(
              [
                ["excellent", distribution.excellent],
                ["good", distribution.good],
                ["fair", distribution.fair],
                ["poor", distribution.poor],
              ] as const
            ).map(([tier, count]) => (
              <div key={tier} className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">
                    {getTierLabel(tier)}
                  </span>
                  <span className="font-medium tabular-nums">{count}</span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-elevated">
                  <motion.div
                    className={cn("h-full rounded-full", TIER_BAR_CLASSES[tier])}
                    initial={{ width: 0 }}
                    animate={{ width: `${(count / maxBucket) * 100}%` }}
                    transition={{ duration: 0.5, ease: "easeOut" }}
                  />
                </div>
              </div>
            ))}
          </div>
        </AnimatedCard>
      </motion.div>

      <motion.div variants={slideUp}>
        <AnimatedCard
          title="Live network"
          description="Distribution recalculates as statuses change."
        >
          <div className="flex flex-wrap gap-2">
            <Badge className="bg-status-available/15 text-status-available ring-1 ring-status-available/30">
              {distribution.excellent} excellent
            </Badge>
            <Badge className="bg-status-busy/15 text-status-busy ring-1 ring-status-busy/30">
              {distribution.good} good
            </Badge>
            <Badge className="bg-brand-violet/15 text-brand-violet ring-1 ring-brand-violet/30">
              {distribution.fair} fair
            </Badge>
            <Badge className="bg-status-offline/15 text-status-offline ring-1 ring-status-offline/30">
              {distribution.poor} poor
            </Badge>
          </div>
        </AnimatedCard>
      </motion.div>

      <motion.div
        variants={staggerContainer}
        className="md:col-span-2 lg:col-span-3"
      >
        <AnimatedCard
          title="Why rankings differ"
          description="Three live examples showing how EvoScore breaks ties between stations."
        >
          <div className="grid gap-3 lg:grid-cols-3">
            {comparisons.map((comparison, index) => (
              <motion.div
                key={comparison.station.id}
                variants={slideUp}
                className="rounded-xl border border-border/60 bg-elevated/30 p-4"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="font-semibold">{comparison.station.name}</p>
                    <p className="text-xs text-muted-foreground">
                      #{index + 1} · {comparison.station.status}
                    </p>
                  </div>
                  <EvoScoreBadge evoScore={comparison.evoScore} />
                </div>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                  {comparison.summary}
                </p>
                <div className="mt-3 rounded-lg bg-card/60 p-3 ring-1 ring-border/50">
                  <p className="mb-2 text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                    Breakdown
                  </p>
                  <EvoScoreBreakdownContent
                    breakdown={comparison.evoScore.breakdown}
                  />
                </div>
                <p className="mt-3 text-xs leading-relaxed text-muted-foreground">
                  {getEvoScoreExplanation(comparison.station)}
                </p>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="mt-3 w-full"
                  asChild
                >
                  <Link to={`/stations/${comparison.station.id}`}>
                    <Sparkles className="size-3.5" />
                    View station
                  </Link>
                </Button>
              </motion.div>
            ))}
          </div>
        </AnimatedCard>
      </motion.div>
    </PageSection>
  )
}
