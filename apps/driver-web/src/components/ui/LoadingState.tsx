import { motion } from "framer-motion"
import { Loader2 } from "lucide-react"

import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"

type LoadingVariant = "default" | "list" | "map"

interface LoadingStateProps {
  variant?: LoadingVariant
  title?: string
  description?: string
  className?: string
}

function PulseIndicator({ className }: { className?: string }) {
  return (
    <motion.div
      className={cn("flex items-center gap-2 text-sm text-muted-foreground", className)}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.25 }}
    >
      <Loader2 className="size-4 animate-spin text-brand-cyan" />
      <span>Loading…</span>
    </motion.div>
  )
}

function ListSkeleton() {
  return (
    <Card className="border-border/80 bg-card ring-border/60">
      <CardContent className="space-y-3 p-4">
        {Array.from({ length: 5 }).map((_, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0.4 }}
            animate={{ opacity: [0.4, 0.85, 0.4] }}
            transition={{
              duration: 1.4,
              repeat: Number.POSITIVE_INFINITY,
              delay: index * 0.12,
            }}
          >
            <Skeleton className="h-20 w-full rounded-lg" />
          </motion.div>
        ))}
      </CardContent>
    </Card>
  )
}

function MapShimmer({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "relative h-full min-h-[min(480px,52vh)] overflow-hidden rounded-xl ring-1 ring-border/60",
        className,
      )}
    >
      <motion.div
        className="absolute inset-0 bg-gradient-to-br from-elevated/80 via-card to-elevated/60"
        initial={{ opacity: 0.6 }}
        animate={{ opacity: [0.6, 0.9, 0.6] }}
        transition={{ duration: 1.6, repeat: Number.POSITIVE_INFINITY }}
      />
      <motion.div
        className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-brand-cyan/10 to-transparent"
        animate={{ translateX: ["-100%", "100%"] }}
        transition={{ duration: 2.2, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
      />
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-2">
        <PulseIndicator />
        <p className="text-xs text-muted-foreground">Preparing Lagos map</p>
      </div>
    </div>
  )
}

export function LoadingState({
  variant = "default",
  title = "Loading",
  description = "Fetching the latest charging network data…",
  className,
}: LoadingStateProps) {
  if (variant === "list") {
    return <ListSkeleton />
  }

  if (variant === "map") {
    return <MapShimmer className={className} />
  }

  return (
    <Card
      className={cn(
        "border-border/80 bg-card ring-border/60",
        className,
      )}
    >
      <CardContent className="flex min-h-40 flex-col items-center justify-center gap-3 p-8 text-center">
        <PulseIndicator />
        <div>
          <p className="font-medium">{title}</p>
          <p className="mt-1 text-sm text-muted-foreground">{description}</p>
        </div>
      </CardContent>
    </Card>
  )
}
