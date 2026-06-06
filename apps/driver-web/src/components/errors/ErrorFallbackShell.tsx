import { ArrowLeft, Home, RefreshCw, Zap } from "lucide-react"
import { Link } from "react-router-dom"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface ErrorFallbackShellProps {
  title: string
  description: string
  errorId?: string | null
  isRetrying?: boolean
  onRetry?: () => void
  onGoBack?: () => void
  showGoBack?: boolean
  primaryAction?: {
    label: string
    to: string
  }
  className?: string
  compact?: boolean
}

export function ErrorFallbackShell({
  title,
  description,
  errorId,
  isRetrying = false,
  onRetry,
  onGoBack,
  showGoBack = true,
  primaryAction,
  className,
  compact = false,
}: ErrorFallbackShellProps) {
  return (
    <div
      role="alert"
      className={cn(
        "flex flex-col items-center justify-center px-6 py-12 text-center",
        compact ? "min-h-[min(320px,40vh)] gap-4" : "min-h-[min(480px,60vh)] gap-6",
        className,
      )}
    >
      <div className="relative flex size-16 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-cyan/15 to-brand-violet/10 ring-1 ring-brand-cyan/20">
        <Zap className="size-8 text-brand-cyan" aria-hidden />
      </div>

      <div className="max-w-md space-y-2">
        <h1
          className={cn(
            "font-semibold tracking-tight text-foreground",
            compact ? "text-lg" : "text-2xl",
          )}
        >
          {title}
        </h1>
        <p className="text-sm leading-relaxed text-muted-foreground">
          {description}
        </p>
        {errorId ? (
          <p className="pt-1 text-xs text-muted-foreground/80">
            Reference: <span className="font-mono">{errorId}</span>
          </p>
        ) : null}
      </div>

      <div className="flex flex-wrap items-center justify-center gap-2">
        {onRetry ? (
          <Button type="button" onClick={onRetry} disabled={isRetrying}>
            <RefreshCw
              className={cn("size-4", isRetrying && "animate-spin")}
              aria-hidden
            />
            {isRetrying ? "Retrying…" : "Retry"}
          </Button>
        ) : null}

        {primaryAction ? (
          <Button type="button" asChild variant={onRetry ? "outline" : "default"}>
            <Link to={primaryAction.to}>{primaryAction.label}</Link>
          </Button>
        ) : (
          <Button type="button" asChild variant={onRetry ? "outline" : "default"}>
            <Link to="/">
              <Home className="size-4" aria-hidden />
              Go Home
            </Link>
          </Button>
        )}

        {showGoBack && onGoBack ? (
          <Button type="button" variant="ghost" onClick={onGoBack}>
            <ArrowLeft className="size-4" aria-hidden />
            Go Back
          </Button>
        ) : null}
      </div>
    </div>
  )
}
