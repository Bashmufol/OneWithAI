import { motion } from "framer-motion"

import { NotificationSeverityBadge } from "@/components/notifications/NotificationSeverityBadge"
import { SearchHighlightText } from "@/components/stations/SearchHighlight"
import type { AppNotification } from "@/lib/notificationStore"
import { formatNotificationTime } from "@/lib/notificationUtils"
import { slideUp } from "@/lib/motion"
import { cn } from "@/lib/utils"

interface NotificationItemProps {
  notification: AppNotification
  onSelect?: (notification: AppNotification) => void
  compact?: boolean
  searchQuery?: string
  animate?: boolean
}

export function NotificationItem({
  notification,
  onSelect,
  compact = false,
  searchQuery = "",
  animate = true,
}: NotificationItemProps) {
  const content = (
    <button
      type="button"
      onClick={() => onSelect?.(notification)}
      className={cn(
        "w-full max-w-full overflow-hidden rounded-lg text-left transition-colors",
        compact ? "px-2.5 py-2" : "px-3 py-3",
        notification.read
          ? "bg-transparent hover:bg-elevated/50"
          : "bg-brand-cyan/5 hover:bg-brand-cyan/10 ring-1 ring-brand-cyan/15",
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <p
              className={cn(
                "truncate text-sm font-medium",
                !notification.read && "text-foreground",
              )}
            >
              <SearchHighlightText
                text={notification.title}
                query={searchQuery}
              />
            </p>
            {!compact ? (
              <NotificationSeverityBadge
                severity={notification.severity}
                showIcon={false}
                className="text-[10px]"
              />
            ) : null}
          </div>
          <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">
            <SearchHighlightText
              text={notification.message}
              query={searchQuery}
            />
          </p>
          <div className="mt-1.5 flex items-center gap-2 text-[10px] text-muted-foreground">
            <span className="capitalize">{notification.source}</span>
            <span>·</span>
            <span>{formatNotificationTime(notification.timestamp)}</span>
          </div>
        </div>
        {!notification.read ? (
          <span className="mt-1 size-2 shrink-0 rounded-full bg-brand-cyan shadow-[0_0_8px_oklch(0.789_0.154_194.769_/_50%)]" />
        ) : null}
      </div>
    </button>
  )

  if (!animate) return content

  return (
    <motion.div
      variants={slideUp}
      initial="hidden"
      animate="visible"
      className="min-w-0 overflow-hidden"
    >
      {content}
    </motion.div>
  )
}
