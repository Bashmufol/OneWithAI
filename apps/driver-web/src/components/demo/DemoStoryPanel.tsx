import { AnimatePresence, motion } from "framer-motion"
import {
  Activity,
  ChevronLeft,
  ChevronRight,
  MapPin,
  Navigation,
  Sparkles,
  X,
} from "lucide-react"
import { useState } from "react"
import { Link } from "react-router-dom"

import { useSettings } from "@/hooks/useSettings"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"

const STORY_STEPS = [
  {
    title: "Finding nearby stations",
    description:
      "Search or pan the Lagos map to discover chargers synced to your viewport.",
    href: "/",
    icon: MapPin,
    highlight: "map-search",
  },
  {
    title: "Checking live availability",
    description:
      "Watch pins change color in real time as the network pulse engine updates status.",
    href: "/network",
    icon: Activity,
    highlight: "network-pulse",
  },
  {
    title: "AI recommending best charger",
    description:
      "Ask the Charge Advisor for EvoScore-ranked stops based on your situation.",
    href: "/advisor",
    icon: Sparkles,
    highlight: "ai-advisor",
  },
  {
    title: "Route optimization",
    description:
      "Set battery level and destination to get an intelligent charging corridor.",
    href: "/",
    icon: Navigation,
    highlight: "route-panel",
  },
  {
    title: "Live network updates",
    description:
      "EvoScore, heatmap demand, and routes adapt automatically as conditions shift.",
    href: "/network",
    icon: Activity,
    highlight: "live-system",
  },
] as const

export function DemoStoryPanel() {
  const { isDemoMode } = useSettings()
  const [isOpen, setIsOpen] = useState(false)
  const [stepIndex, setStepIndex] = useState(0)

  if (!isDemoMode) return null

  const step = STORY_STEPS[stepIndex]
  const StepIcon = step.icon

  return (
    <div className="pointer-events-none fixed right-4 bottom-4 z-[120] flex flex-col items-end gap-2">
      <AnimatePresence>
        {isOpen ? (
          <motion.div
            initial={{ opacity: 0, y: 12, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.98 }}
            className="pointer-events-auto w-[min(100vw-2rem,360px)]"
          >
            <Card className="border-brand-violet/25 bg-card/95 shadow-xl ring-brand-violet/20 backdrop-blur-sm">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <Badge
                      variant="outline"
                      className="mb-2 border-brand-violet/30 text-brand-violet"
                    >
                      Story Mode
                    </Badge>
                    <CardTitle className="text-base">{step.title}</CardTitle>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-xs"
                    onClick={() => setIsOpen(false)}
                    aria-label="Close story panel"
                  >
                    <X className="size-3.5" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start gap-3 rounded-lg bg-elevated/50 p-3 ring-1 ring-border/60">
                  <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-brand-cyan/15 ring-1 ring-brand-cyan/25">
                    <StepIcon className="size-4 text-brand-cyan" />
                  </div>
                  <p className="text-sm leading-relaxed text-muted-foreground">
                    {step.description}
                  </p>
                </div>

                <div className="flex items-center justify-between gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={stepIndex === 0}
                    onClick={() => setStepIndex((current) => current - 1)}
                  >
                    <ChevronLeft className="size-4" />
                    Back
                  </Button>
                  <span className="text-xs text-muted-foreground tabular-nums">
                    {stepIndex + 1} / {STORY_STEPS.length}
                  </span>
                  {stepIndex < STORY_STEPS.length - 1 ? (
                    <Button
                      type="button"
                      size="sm"
                      onClick={() => setStepIndex((current) => current + 1)}
                    >
                      Next
                      <ChevronRight className="size-4" />
                    </Button>
                  ) : (
                    <Button type="button" size="sm" asChild>
                      <Link to={step.href}>Explore</Link>
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ) : null}
      </AnimatePresence>

      <Button
        type="button"
        size="sm"
        className={cn(
          "pointer-events-auto shadow-lg",
          isOpen && "bg-brand-violet text-white hover:bg-brand-violet/90",
        )}
        onClick={() => setIsOpen((current) => !current)}
      >
        <Sparkles className="size-4" />
        Demo Guide
      </Button>
    </div>
  )
}
