import { motion } from "framer-motion"

import type { EvoScoreBreakdown } from "@/lib/evoscore"
import { slideUp } from "@/lib/motion"
import { cn } from "@/lib/utils"

interface EvoScoreBreakdownContentProps {
  breakdown: EvoScoreBreakdown
  variant?: "compact" | "detailed"
}

const BREAKDOWN_ROWS = [
  {
    key: "availability" as const,
    label: "Availability",
    max: 40,
    color: "bg-status-available",
  },
  {
    key: "demand" as const,
    label: "Demand pressure",
    max: 20,
    color: "bg-brand-violet",
    signed: true,
  },
  {
    key: "reliability" as const,
    label: "Reliability",
    max: 30,
    color: "bg-brand-cyan",
  },
]

function formatBreakdownValue(key: keyof EvoScoreBreakdown, value: number) {
  if (key === "demand") {
    return `${value >= 0 ? "+" : ""}${value}`
  }

  return `+${value}`
}

export function EvoScoreBreakdownContent({
  breakdown,
  variant = "compact",
}: EvoScoreBreakdownContentProps) {
  if (variant === "compact") {
    return (
      <div className="space-y-1.5 text-xs">
        {BREAKDOWN_ROWS.map((row) => (
          <div
            key={row.key}
            className="flex items-center justify-between gap-4"
          >
            <span className="text-muted-foreground">{row.label}</span>
            <span className="font-medium tabular-nums">
              {formatBreakdownValue(row.key, breakdown[row.key])}
            </span>
          </div>
        ))}
      </div>
    )
  }

  return (
    <motion.div
      variants={slideUp}
      initial="hidden"
      animate="visible"
      className="space-y-4"
    >
      {BREAKDOWN_ROWS.map((row, index) => {
        const value = breakdown[row.key]
        const magnitude = row.signed ? Math.abs(value) : value
        const widthPercent = Math.min(100, (magnitude / row.max) * 100)
        const isNegativeDemand = row.signed && value < 0

        return (
          <motion.div
            key={row.key}
            variants={slideUp}
            custom={index}
            className="space-y-2"
          >
            <div className="flex items-center justify-between gap-3 text-sm">
              <span className="font-medium text-foreground">{row.label}</span>
              <span
                className={cn(
                  "font-semibold tabular-nums",
                  isNegativeDemand
                    ? "text-status-offline"
                    : "text-brand-cyan",
                )}
              >
                {formatBreakdownValue(row.key, value)}
              </span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-elevated/80 ring-1 ring-border/60">
              <motion.div
                className={cn(
                  "h-full rounded-full",
                  isNegativeDemand ? "bg-status-offline/80" : row.color,
                )}
                initial={{ width: 0 }}
                animate={{ width: `${widthPercent}%` }}
                transition={{
                  duration: 0.45,
                  ease: "easeOut",
                  delay: index * 0.08,
                }}
              />
            </div>
            <p className="text-xs text-muted-foreground">
              Max contribution: {row.signed ? "±" : "+"}
              {row.max} pts
            </p>
          </motion.div>
        )
      })}
    </motion.div>
  )
}
