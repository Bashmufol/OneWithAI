import { motion } from "framer-motion"

import { AnimatedCard } from "@/components/ev/AnimatedCard"
import { PageSection } from "@/components/ev/PageSection"
import { NetworkPulse } from "@/components/network/NetworkPulse"
import { Badge } from "@/components/ui/badge"
import { useLiveNetworkStore } from "@/lib/liveNetworkStore"
import { slideUp } from "@/lib/motion"

export function NetworkPage() {
  const pulseEvents = useLiveNetworkStore((state) => state.pulseEvents)
  const statusById = useLiveNetworkStore((state) => state.statusById)
  const liveChangeCount = Object.keys(statusById).length

  return (
    <PageSection
      title="Network Pulse"
      description="Real-time network health dashboard with live station status transitions across Lagos."
      badge="Feature 7"
    >
      <motion.div variants={slideUp} className="md:col-span-2 lg:col-span-3">
        <NetworkPulse />
      </motion.div>

      <motion.div variants={slideUp}>
        <AnimatedCard
          title="Live Stream"
          description="Simulated status transitions every 5–10 seconds per station."
        >
          <div className="flex items-center gap-2">
            <span className="relative flex size-2">
              <span className="absolute inline-flex size-full animate-ping rounded-full bg-status-available opacity-40" />
              <span className="relative inline-flex size-2 rounded-full bg-status-available" />
            </span>
            <span className="text-sm text-muted-foreground">
              {pulseEvents.length > 0 ? "Streaming events" : "Connected · awaiting events"}
            </span>
          </div>
        </AnimatedCard>
      </motion.div>

      <motion.div variants={slideUp}>
        <AnimatedCard
          title="Status Changes"
          description="Stations with live status overrides from the pulse engine."
        >
          <Badge className="bg-status-busy/15 text-status-busy ring-1 ring-status-busy/30">
            {liveChangeCount} active
          </Badge>
        </AnimatedCard>
      </motion.div>

      <motion.div variants={slideUp}>
        <AnimatedCard
          title="Network Stats"
          description="EvoScore and availability recalculate automatically on every pulse."
        />
      </motion.div>
    </PageSection>
  )
}
