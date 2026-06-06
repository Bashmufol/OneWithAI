import { AlertTriangle, RefreshCw } from "lucide-react"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface DataFetchErrorProps {
  title?: string
  description?: string
  onRetry?: () => void
  className?: string
  compact?: boolean
}

export function DataFetchError({
  title = "Unable to load data",
  description = "Something went wrong while fetching station data. Your connection may still be fine — try again.",
  onRetry,
  className,
  compact = false,
}: DataFetchErrorProps) {
  return (
    <div
      role="alert"
      className={cn(
        "flex items-start gap-3 rounded-lg border border-status-busy/25 bg-status-busy/5 ring-1 ring-status-busy/15",
        compact ? "p-3" : "p-4",
        className,
      )}
    >
      <AlertTriangle className="mt-0.5 size-4 shrink-0 text-status-busy" />
      <div className="min-w-0 flex-1 space-y-1">
        <p className={cn("font-medium", compact ? "text-sm" : "text-base")}>
          {title}
        </p>
        <p className="text-xs text-muted-foreground sm:text-sm">{description}</p>
        {onRetry ? (
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="mt-2 h-8"
            onClick={onRetry}
          >
            <RefreshCw className="size-3.5" />
            Retry
          </Button>
        ) : null}
      </div>
    </div>
  )
}
