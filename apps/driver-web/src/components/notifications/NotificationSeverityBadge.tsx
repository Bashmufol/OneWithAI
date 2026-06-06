import { AlertTriangle, CheckCircle2, Info, Siren } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { getSeverityLabel } from "@/lib/notificationFilter"
import type { NotificationSeverity } from "@/lib/notificationStore"
import { cn } from "@/lib/utils"

const SEVERITY_STYLES: Record<
  NotificationSeverity,
  { className: string; icon: typeof Info }
> = {
  info: {
    className: "border-brand-cyan/30 bg-brand-cyan/10 text-brand-cyan",
    icon: Info,
  },
  success: {
    className:
      "border-status-available/30 bg-status-available/10 text-status-available",
    icon: CheckCircle2,
  },
  warning: {
    className: "border-status-busy/30 bg-status-busy/10 text-status-busy",
    icon: AlertTriangle,
  },
  critical: {
    className:
      "border-status-offline/30 bg-status-offline/10 text-status-offline",
    icon: Siren,
  },
}

interface NotificationSeverityBadgeProps {
  severity: NotificationSeverity
  className?: string
  showIcon?: boolean
}

export function NotificationSeverityBadge({
  severity,
  className,
  showIcon = true,
}: NotificationSeverityBadgeProps) {
  const config = SEVERITY_STYLES[severity]
  const Icon = config.icon

  return (
    <Badge
      variant="outline"
      className={cn("gap-1 capitalize", config.className, className)}
    >
      {showIcon ? <Icon className="size-3" /> : null}
      {getSeverityLabel(severity)}
    </Badge>
  )
}
