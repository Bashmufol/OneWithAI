import { AnimatePresence, motion } from "framer-motion"
import { Activity, Radio } from "lucide-react"
import { useEffect, useMemo, useRef, useState } from "react"

import { useAutoScrollFeed } from "@/hooks/useAutoScrollFeed"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useLiveNetworkStore } from "@/lib/liveNetworkStore"
import {
  getPulseEventOpacity,
  groupPulseEvents,
  type GroupedPulseEvent,
} from "@/lib/pulseEventGrouping"
import { slideUp } from "@/lib/motion"
import { cn } from "@/lib/utils"

const STATUS_BADGE_CLASSES = {
  available:
    "bg-status-available/15 text-status-available ring-1 ring-status-available/30",
  busy: "bg-status-busy/15 text-status-busy ring-1 ring-status-busy/30",
  offline:
    "bg-status-offline/15 text-status-offline ring-1 ring-status-offline/30",
} as const

function formatTimestamp(timestamp: number): string {
  return new Intl.DateTimeFormat(undefined, {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  }).format(new Date(timestamp))
}

function PulseEventRow({
  event,
  opacity,
}: {
  event: GroupedPulseEvent
  opacity: number
}) {
  return (
    <motion.li
      layout
      variants={slideUp}
      initial="hidden"
      animate="visible"
      exit={{ opacity: 0, y: -4 }}
      style={{ opacity }}
      className="flex items-start gap-3 rounded-lg border border-border/50 bg-elevated/30 px-3 py-2.5 transition-opacity duration-500"
    >
      <span className="relative mt-1.5 flex size-2 shrink-0">
        <span className="absolute inline-flex size-full animate-ping rounded-full bg-brand-cyan opacity-30" />
        <span className="relative inline-flex size-2 rounded-full bg-brand-cyan" />
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-sm leading-snug">{event.message}</p>
        <p className="mt-1 text-xs text-muted-foreground">
          {formatTimestamp(event.latestTimestamp)}
          {event.count > 1 ? ` · ${event.count} grouped updates` : ""}
        </p>
      </div>
      <Badge
        className={cn(
          "shrink-0 capitalize",
          STATUS_BADGE_CLASSES[event.latestStatus],
        )}
      >
        {event.latestStatus}
      </Badge>
    </motion.li>
  )
}

export function NetworkPulse() {
  const pulseEvents = useLiveNetworkStore((state) => state.pulseEvents)
  const feedScrollRef = useRef<HTMLDivElement>(null)
  const [now, setNow] = useState(() => Date.now())

  const groupedEvents = useMemo(
    () => groupPulseEvents(pulseEvents),
    [pulseEvents],
  )

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      setNow(Date.now())
    }, 15_000)

    return () => window.clearInterval(intervalId)
  }, [])

  useAutoScrollFeed(feedScrollRef, groupedEvents.length)

  return (
    <Card className="flex min-h-[min(520px,70vh)] flex-col border-border/80 bg-card ring-border/60">
      <CardHeader className="border-b border-border/60 pb-4">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <div className="flex size-9 items-center justify-center rounded-lg bg-brand-cyan/15 ring-1 ring-brand-cyan/25">
              <Activity className="size-5 text-brand-cyan" />
            </div>
            <div>
              <CardTitle className="text-base">Network Pulse</CardTitle>
              <p className="text-xs text-muted-foreground">
                Live station status stream · grouped activity
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="relative flex size-2.5">
              <span className="absolute inline-flex size-full animate-ping rounded-full bg-status-available opacity-50" />
              <span className="relative inline-flex size-2.5 rounded-full bg-status-available shadow-[0_0_8px_oklch(0.765_0.177_163.223_/_60%)]" />
            </span>
            <Badge
              variant="outline"
              className="border-border text-status-available"
            >
              <Radio className="mr-1 size-3" />
              LIVE
            </Badge>
          </div>
        </div>
      </CardHeader>

      <CardContent className="flex min-h-0 flex-1 flex-col p-0">
        <div ref={feedScrollRef} className="min-h-0 flex-1 overflow-hidden">
        <ScrollArea className="h-full min-h-0 flex-1 px-4 pt-4">
          {groupedEvents.length === 0 ? (
            <div className="flex min-h-[320px] flex-col items-center justify-center gap-2 px-4 text-center">
              <Activity className="size-8 text-muted-foreground/50" />
              <p className="font-medium">Waiting for network activity</p>
              <p className="text-sm text-muted-foreground">
                Station status changes will appear here in real time.
              </p>
            </div>
          ) : (
            <ul className="space-y-2 pb-4">
              <AnimatePresence initial={false}>
                {groupedEvents.map((event) => (
                  <PulseEventRow
                    key={event.id}
                    event={event}
                    opacity={getPulseEventOpacity(event.latestTimestamp, now)}
                  />
                ))}
              </AnimatePresence>
            </ul>
          )}
        </ScrollArea>
        </div>
      </CardContent>
    </Card>
  )
}
