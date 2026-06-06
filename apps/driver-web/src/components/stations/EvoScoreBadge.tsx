import { motion } from "framer-motion"

import type { EvoScore, EvoScoreTone } from "@/lib/evoscore"
import { getEvoScoreTone } from "@/lib/evoscore"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

const TONE_CLASSES: Record<EvoScoreTone, string> = {
  excellent:
    "bg-status-available/15 text-status-available ring-1 ring-status-available/30",
  good: "bg-status-busy/15 text-status-busy ring-1 ring-status-busy/30",
  poor: "bg-status-offline/15 text-status-offline ring-1 ring-status-offline/30",
}

interface EvoScoreBadgeProps {
  evoScore: EvoScore
  size?: "sm" | "md"
  showLabel?: boolean
  className?: string
}

export function EvoScoreBadge({
  evoScore,
  size = "sm",
  showLabel = true,
  className,
}: EvoScoreBadgeProps) {
  const tone = getEvoScoreTone(evoScore.score)
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.92 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.2, ease: "easeOut" }}
      className={cn("flex shrink-0 flex-col items-end gap-0.5", className)}
    >
      <Badge
        className={cn(
          "tabular-nums",
          TONE_CLASSES[tone],
          size === "sm" ? "px-2 py-0.5 text-xs" : "px-2.5 py-1 text-sm",
        )}
      >
        <span className="font-semibold">{evoScore.score}</span>
        {showLabel ? (
          <span className="ml-1 font-normal opacity-80">{evoScore.label}</span>
        ) : null}
      </Badge>
    </motion.div>
  )
}
