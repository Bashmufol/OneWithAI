import { motion } from "framer-motion"
import { Activity, Flame, MapPin, Route } from "lucide-react"

import { StationMapPanel } from "@/components/stations/StationMapPanel"
import { Badge } from "@/components/ui/badge"
import { useSettings } from "@/hooks/useSettings"
import { fadeIn, slideUp } from "@/lib/motion"
import { cn } from "@/lib/utils"

const STATUS_BADGES = [
  {
    label: "Available",
    className:
      "bg-status-available/15 text-status-available ring-1 ring-status-available/30",
  },
  {
    label: "Busy",
    className: "bg-status-busy/15 text-status-busy ring-1 ring-status-busy/30",
  },
  {
    label: "Offline",
    className:
      "bg-status-offline/15 text-status-offline ring-1 ring-status-offline/30",
  },
] as const

const CAPABILITIES = [
  { icon: MapPin, label: "Live availability" },
  { icon: Activity, label: "EvoScore ranked" },
  { icon: Route, label: "Route intelligence" },
  { icon: Flame, label: "Demand heatmap" },
] as const

export function MapPage() {
  const { isReduceMotion } = useSettings()

  return (
    <div
      className={cn(
        "mx-auto flex w-full max-w-[1600px] flex-col",
        "gap-4 p-4 md:gap-5 md:p-6",
        "lg:h-[calc(100svh-3.5rem)] lg:min-h-0",
      )}
    >
      <motion.header
        variants={isReduceMotion ? undefined : slideUp}
        initial={isReduceMotion ? false : "hidden"}
        animate="visible"
        className="shrink-0 space-y-3"
      >
        <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
          <div className="space-y-1">
            <h2 className="text-xl font-semibold tracking-tight md:text-2xl">
              Nigeria Charging Map
            </h2>
            <p className="max-w-2xl text-sm text-muted-foreground">
              Explore stations nationwide, plan routes, and monitor live network
              changes across Nigeria.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            {STATUS_BADGES.map((badge) => (
              <Badge key={badge.label} className={badge.className}>
                {badge.label}
              </Badge>
            ))}
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          {CAPABILITIES.map(({ icon: Icon, label }) => (
            <span
              key={label}
              className="inline-flex items-center gap-1.5 rounded-full bg-elevated/50 px-2.5 py-1 text-xs text-muted-foreground ring-1 ring-border/60"
            >
              <Icon className="size-3 text-brand-cyan" />
              {label}
            </span>
          ))}
        </div>
      </motion.header>

      <motion.div
        variants={isReduceMotion ? undefined : fadeIn}
        initial={isReduceMotion ? false : "hidden"}
        animate="visible"
        className="min-h-0 flex-1 lg:overflow-hidden"
      >
        <StationMapPanel />
      </motion.div>
    </div>
  )
}
