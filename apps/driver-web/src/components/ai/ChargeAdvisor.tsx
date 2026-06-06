import type { Station } from "@evocharge/types"
import { AnimatePresence, motion } from "framer-motion"
import { Bot, MapPin, Send, Sparkles, User } from "lucide-react"
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type FormEvent,
} from "react"
import { useNavigate } from "react-router-dom"

import { useRouteStore } from "@/components/route/store"
import { EvoScoreBadge } from "@/components/stations/EvoScoreBadge"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { InlineErrorState } from "@/components/errors/InlineErrorState"
import { ErrorState } from "@/components/ui/ErrorState"
import { LoadingState } from "@/components/ui/LoadingState"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useLiveStationsQuery } from "@/hooks/useLiveStationsQuery"
import { useQueryRetry } from "@/hooks/useQueryRetry"
import { useUserLocation } from "@/hooks/useUserLocation"
import {
  getAdvisorRecommendation,
  type AdvisorResponse,
  type RankedStation,
} from "@/lib/advisor"
import { formatDistanceLabel } from "@/lib/distance"
import { requestMapRouteWithDestination } from "@/lib/mapIntent"
import { bridgeAdvisorNotification } from "@/lib/notificationEventBridge"
import { getStationEvoScore } from "@/lib/evoscore"
import { slideUp } from "@/lib/motion"
import { useMapIntentStore } from "@/store/mapIntentStore"
import { cn } from "@/lib/utils"

const QUICK_PROMPTS = [
  "I have 20% battery",
  "Find nearest good charger",
  "Best station near me",
  "Chargers on my route",
] as const

const THINKING_DELAY_MS = 700

const STATUS_BADGE_CLASSES = {
  available:
    "bg-status-available/15 text-status-available ring-1 ring-status-available/30",
  busy: "bg-status-busy/15 text-status-busy ring-1 ring-status-busy/30",
  offline:
    "bg-status-offline/15 text-status-offline ring-1 ring-status-offline/30",
} as const

interface AdvisorMessage {
  id: string
  role: "user" | "assistant"
  content?: string
  response?: AdvisorResponse
}

function createMessageId(): string {
  return `msg-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
}

function ThinkingIndicator() {
  return (
    <motion.div
      variants={slideUp}
      initial="hidden"
      animate="visible"
      className="flex max-w-[85%] items-start gap-2"
    >
      <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-brand-violet/15 ring-1 ring-brand-violet/25">
        <Bot className="size-4 text-brand-violet" />
      </div>
      <div className="rounded-lg bg-card px-3 py-2.5 text-sm ring-1 ring-border/60">
        <span className="text-muted-foreground">Analyzing network</span>
        <span className="inline-flex w-6 animate-pulse text-brand-cyan">...</span>
      </div>
    </motion.div>
  )
}

function RecommendationCard({
  station,
  usingFallback,
  onSelect,
}: {
  station: RankedStation
  usingFallback: boolean
  onSelect: (station: Station) => void
}) {
  const evoScore = getStationEvoScore(station)
  const maxPower = Math.max(...station.connectors.map((c) => c.powerKw))

  return (
    <motion.button
      type="button"
      onClick={() => onSelect(station)}
      whileHover={{ scale: 1.01 }}
      whileTap={{ scale: 0.99 }}
      className="w-full rounded-lg border border-border/60 bg-elevated/40 p-3 text-left transition-colors hover:border-primary/30 hover:bg-elevated/70"
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <p className="truncate font-medium">{station.name}</p>
          <p className="mt-0.5 truncate text-xs text-muted-foreground">
            {station.operator} · {station.location.city}
          </p>
        </div>
        <EvoScoreBadge evoScore={evoScore} />
      </div>
      <div className="mt-2 flex flex-wrap items-center justify-between gap-2">
        <Badge
          className={cn("capitalize", STATUS_BADGE_CLASSES[station.status])}
        >
          {station.status}
        </Badge>
        <span className="text-xs text-brand-cyan tabular-nums">
          {formatDistanceLabel(station.distanceKm, {
            approximate: usingFallback,
          })}
        </span>
        <span className="text-xs text-muted-foreground">
          Up to {maxPower} kW · Score {station.finalScore.toFixed(1)}
        </span>
      </div>
    </motion.button>
  )
}

function AssistantMessage({
  message,
  usingFallback,
  onSelectStation,
}: {
  message: AdvisorMessage
  usingFallback: boolean
  onSelectStation: (station: Station) => void
}) {
  const response = message.response
  if (!response) return null

  return (
    <motion.div
      variants={slideUp}
      initial="hidden"
      animate="visible"
      className="flex max-w-[92%] items-start gap-2"
    >
      <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-brand-violet/15 ring-1 ring-brand-violet/25">
        <Bot className="size-4 text-brand-violet" />
      </div>
      <div className="min-w-0 flex-1 space-y-3">
        <div className="rounded-lg bg-card px-3.5 py-3 ring-1 ring-brand-violet/20">
          <p className="text-sm font-semibold text-foreground">{response.title}</p>
          <p className="mt-1 text-xs text-muted-foreground">
            Intent: {response.intent.replaceAll("_", " ")} ·{" "}
            {response.topStations.length} station
            {response.topStations.length === 1 ? "" : "s"} ranked
          </p>
        </div>

        {response.topStations.length > 0 ? (
          <div className="space-y-2">
            <p className="text-xs font-medium text-muted-foreground">
              Top recommendations
            </p>
            {response.topStations.map((station) => (
              <RecommendationCard
                key={station.id}
                station={station}
                usingFallback={usingFallback}
                onSelect={onSelectStation}
              />
            ))}
          </div>
        ) : null}

        {response.reasoning.length > 0 ? (
          <div className="space-y-2">
            <p className="text-xs font-medium text-muted-foreground">
              Explainability
            </p>
            {response.reasoning.map((entry) => (
              <div
                key={entry.name}
                className="rounded-lg bg-elevated/40 px-3 py-2.5 ring-1 ring-border/50"
              >
                <p className="text-xs font-semibold text-foreground">
                  {entry.name}
                </p>
                <ul className="mt-2 space-y-1.5">
                  {entry.reason.map((line) => (
                    <li
                      key={line}
                      className="flex items-start gap-2 text-xs leading-relaxed text-muted-foreground"
                    >
                      <Sparkles className="mt-0.5 size-3 shrink-0 text-brand-cyan" />
                      <span>{line}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        ) : null}
      </div>
    </motion.div>
  )
}

function UserMessage({ content }: { content: string }) {
  return (
    <motion.div
      variants={slideUp}
      initial="hidden"
      animate="visible"
      className="flex justify-end"
    >
      <div className="flex max-w-[85%] items-start gap-2">
        <div className="rounded-lg bg-elevated px-3 py-2.5 text-sm ring-1 ring-border/60">
          {content}
        </div>
        <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-brand-cyan/15 ring-1 ring-brand-cyan/25">
          <User className="size-4 text-brand-cyan" />
        </div>
      </div>
    </motion.div>
  )
}

export function ChargeAdvisor() {
  const navigate = useNavigate()
  const {
    data: stations = [],
    isLoading,
    isError,
    isRefetchError,
    refetch,
  } = useLiveStationsQuery()
  const { onRetry, isRetrying } = useQueryRetry(refetch)
  const { safeLocation, usingFallback } = useUserLocation()
  const batteryLevel = useRouteStore((state) => state.batteryLevel)
  const activeRoute = useMapIntentStore((state) => state.activeRoute)

  const [messages, setMessages] = useState<AdvisorMessage[]>([])
  const [inputValue, setInputValue] = useState("")
  const [isThinking, setIsThinking] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages, isThinking])

  const handleSelectStation = useCallback(
    (station: Station) => {
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
    },
    [navigate, safeLocation],
  )

  const submitQuery = useCallback(
    async (query: string) => {
      const trimmed = query.trim()
      if (!trimmed || isThinking) return

      setInputValue("")
      setMessages((current) => [
        ...current,
        { id: createMessageId(), role: "user", content: trimmed },
      ])
      setIsThinking(true)

      await new Promise((resolve) => window.setTimeout(resolve, THINKING_DELAY_MS))

      const recommendation = getAdvisorRecommendation({
        query: trimmed,
        stations,
        userLocation: safeLocation,
        batteryLevel,
        activeRoute,
        usingFallbackLocation: usingFallback,
      })

      setMessages((current) => [
        ...current,
        {
          id: createMessageId(),
          role: "assistant",
          response: recommendation,
        },
      ])

      const topStation = recommendation.topStations[0]
      bridgeAdvisorNotification({
        title: recommendation.title,
        message: topStation
          ? `${topStation.name} · ${topStation.finalScore.toFixed(1)} composite score`
          : "No stations matched your request.",
        severity: topStation ? "success" : "info",
        stationId: topStation?.id,
        dedupeKey: `advisor:${trimmed.toLowerCase()}:${topStation?.id ?? "none"}`,
        href: topStation ? `/stations/${topStation.id}` : "/advisor",
      })

      setIsThinking(false)
    },
    [
      activeRoute,
      batteryLevel,
      isThinking,
      safeLocation,
      stations,
      usingFallback,
    ],
  )

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault()
    void submitQuery(inputValue)
  }

  const isEmpty = messages.length === 0 && !isThinking

  if (isLoading && stations.length === 0) {
    return (
      <LoadingState
        title="Loading Charge Advisor"
        description="Preparing station intelligence for recommendations…"
      />
    )
  }

  if (isError && stations.length === 0) {
    return (
      <ErrorState onRetry={onRetry} isRetrying={isRetrying} />
    )
  }

  return (
    <Card className="flex min-h-[min(640px,75vh)] flex-col border-border/80 bg-card ring-border/60">
      {isRefetchError && stations.length > 0 ? (
        <div className="border-b border-border/60 p-4">
          <InlineErrorState compact onRetry={onRetry} isRetrying={isRetrying} />
        </div>
      ) : null}
      <CardHeader className="border-b border-border/60 pb-4">
        <div className="flex items-center gap-2">
          <div className="flex size-9 items-center justify-center rounded-lg bg-brand-violet/15 ring-1 ring-brand-violet/25">
            <Bot className="size-5 text-brand-violet" />
          </div>
          <div>
            <CardTitle className="text-base">Charge Advisor</CardTitle>
            <p className="text-xs text-muted-foreground">
              Deterministic EV engine · EvoScore + distance + battery context
            </p>
          </div>
        </div>
      </CardHeader>

      <CardContent className="flex min-h-0 flex-1 flex-col gap-4 p-0">
        <ScrollArea className="min-h-0 flex-1 px-4 pt-4">
          <div className="space-y-4 pb-4">
            {isEmpty ? (
              <motion.div
                variants={slideUp}
                initial="hidden"
                animate="visible"
                className="flex min-h-[280px] flex-col items-center justify-center gap-3 px-4 text-center"
              >
                <div className="flex size-12 items-center justify-center rounded-full bg-elevated ring-1 ring-border/60">
                  <MapPin className="size-6 text-brand-cyan" />
                </div>
                <div>
                  <p className="font-medium">Ask where you should charge</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Structured recommendations powered by EvoScore, your
                    location, battery level, and active route.
                  </p>
                </div>
                <div className="flex flex-wrap justify-center gap-2">
                  {QUICK_PROMPTS.map((prompt) => (
                    <Button
                      key={prompt}
                      type="button"
                      variant="outline"
                      size="sm"
                      className="text-xs"
                      onClick={() => void submitQuery(prompt)}
                    >
                      {prompt}
                    </Button>
                  ))}
                </div>
              </motion.div>
            ) : (
              <AnimatePresence initial={false}>
                {messages.map((message) =>
                  message.role === "user" ? (
                    <UserMessage
                      key={message.id}
                      content={message.content ?? ""}
                    />
                  ) : (
                    <AssistantMessage
                      key={message.id}
                      message={message}
                      usingFallback={usingFallback}
                      onSelectStation={handleSelectStation}
                    />
                  ),
                )}
                {isThinking ? <ThinkingIndicator key="thinking" /> : null}
              </AnimatePresence>
            )}
            <div ref={bottomRef} />
          </div>
        </ScrollArea>

        <form
          onSubmit={handleSubmit}
          className="flex items-center gap-2 border-t border-border/60 p-4"
        >
          <Input
            value={inputValue}
            onChange={(event) => setInputValue(event.target.value)}
            placeholder="Ask about charging near you..."
            disabled={isThinking}
            className="h-10 border-border bg-elevated/60"
          />
          <Button
            type="submit"
            size="icon"
            disabled={!inputValue.trim() || isThinking}
            aria-label="Send message"
          >
            <Send className="size-4" />
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
