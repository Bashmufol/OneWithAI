import { AlertTriangle, RefreshCw, Zap } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"

interface ErrorStateProps {
  title?: string
  description?: string
  onRetry?: () => void
  isRetrying?: boolean
  className?: string
}

export function ErrorState({
  title = "Unable to load data",
  description = "Something went wrong while fetching station data. Try again.",
  onRetry,
  isRetrying = false,
  className,
}: ErrorStateProps) {
  return (
    <Card
      className={cn(
        "border-status-offline/25 bg-card ring-status-offline/15",
        className,
      )}
    >
      <CardContent className="flex min-h-48 flex-col items-center justify-center gap-4 p-8 text-center">
        <div className="relative flex size-16 items-center justify-center rounded-2xl bg-elevated ring-1 ring-border/60">
          <Zap className="size-7 text-brand-cyan/70" />
          <AlertTriangle className="absolute -top-1 -right-1 size-5 text-status-offline" />
        </div>
        <div className="max-w-sm space-y-1">
          <p className="font-medium">{title}</p>
          <p className="text-sm text-muted-foreground">{description}</p>
        </div>
        {onRetry ? (
          <Button
            type="button"
            variant="outline"
            onClick={onRetry}
            disabled={isRetrying}
          >
            <RefreshCw className={cn("size-4", isRetrying && "animate-spin")} />
            {isRetrying ? "Retrying…" : "Retry"}
          </Button>
        ) : null}
      </CardContent>
    </Card>
  )
}
