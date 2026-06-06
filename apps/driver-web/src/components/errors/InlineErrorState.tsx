import { AlertTriangle, RefreshCw } from "lucide-react"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { FRIENDLY_INLINE } from "@/lib/errorUtils"

interface InlineErrorStateProps {
  title?: string
  description?: string
  onRetry?: () => void
  isRetrying?: boolean
  className?: string
  compact?: boolean
}

export function InlineErrorState({
  title = FRIENDLY_INLINE.title,
  description = FRIENDLY_INLINE.description,
  onRetry,
  isRetrying = false,
  className,
  compact = false,
}: InlineErrorStateProps) {
  return (
    <div
      role="alert"
      className={cn(
        "flex items-start gap-3 rounded-xl border border-status-offline/20 bg-card/80 ring-1 ring-border/60 backdrop-blur-sm",
        compact ? "p-3" : "p-5",
        className,
      )}
    >
      <div
        className={cn(
          "flex shrink-0 items-center justify-center rounded-lg bg-status-offline/10 ring-1 ring-status-offline/20",
          compact ? "size-8" : "size-10",
        )}
      >
        <AlertTriangle
          className={cn(
            "text-status-offline",
            compact ? "size-4" : "size-5",
          )}
          aria-hidden
        />
      </div>

      <div className="min-w-0 flex-1 space-y-2 text-left">
        <div className="space-y-1">
          <p className={cn("font-medium text-foreground", compact && "text-sm")}>
            {title}
          </p>
          <p className="text-sm leading-relaxed text-muted-foreground">
            {description}
          </p>
        </div>

        {onRetry ? (
          <Button
            type="button"
            variant="outline"
            size={compact ? "sm" : "default"}
            onClick={onRetry}
            disabled={isRetrying}
            className={compact ? "h-8" : undefined}
          >
            <RefreshCw
              className={cn("size-3.5", isRetrying && "animate-spin")}
              aria-hidden
            />
            {isRetrying ? "Retrying…" : "Retry"}
          </Button>
        ) : null}
      </div>
    </div>
  )
}
