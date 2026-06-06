import { AnimatePresence, motion } from "framer-motion"
import { Bell, ChevronRight } from "lucide-react"
import { useState } from "react"
import { useNavigate } from "react-router-dom"

import { NotificationItem } from "@/components/notifications/NotificationItem"
import { NotificationSeverityBadge } from "@/components/notifications/NotificationSeverityBadge"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Popover,
  PopoverContent,
  PopoverHeader,
  PopoverTitle,
  PopoverTrigger,
} from "@/components/ui/popover"
import { useNotifications } from "@/hooks/useNotifications"
import { useSettings } from "@/hooks/useSettings"
import { groupNotificationsBySeverity } from "@/lib/notificationUtils"
import { fadeIn } from "@/lib/motion"
import { cn } from "@/lib/utils"

export function NotificationCenter() {
  const [open, setOpen] = useState(false)
  const navigate = useNavigate()
  const { isReduceMotion } = useSettings()
  const { dropdownItems, unreadCount, markAsRead } = useNotifications()

  const grouped = groupNotificationsBySeverity(dropdownItems)

  const handleSelect = (id: string, href?: string) => {
    markAsRead(id)
    if (href) {
      setOpen(false)
      navigate(href)
    }
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative text-muted-foreground"
          aria-label="Open notifications"
        >
          <Bell className="size-4" />
          {unreadCount > 0 ? (
            <Badge className="absolute -top-1 -right-1 flex size-4 items-center justify-center rounded-full border-0 bg-status-offline p-0 text-[9px] text-white">
              {unreadCount > 9 ? "9+" : unreadCount}
            </Badge>
          ) : null}
        </Button>
      </PopoverTrigger>

      <PopoverContent
        align="end"
        sideOffset={8}
        className="notification-popover flex w-[min(92vw,380px)] max-h-[min(85vh,480px)] flex-col overflow-hidden p-0"
      >
        <PopoverHeader className="shrink-0 border-b border-border/60 px-4 py-3">
          <div className="flex items-center justify-between gap-2">
            <PopoverTitle>Notifications</PopoverTitle>
            {unreadCount > 0 ? (
              <Badge variant="secondary">{unreadCount} unread</Badge>
            ) : (
              <span className="text-xs text-muted-foreground">All caught up</span>
            )}
          </div>
        </PopoverHeader>

        <div className="notification-popover-scroll min-h-0 flex-1 overflow-y-auto overscroll-contain">
          <AnimatePresence mode="wait">
            {dropdownItems.length === 0 ? (
              <motion.div
                key="empty"
                variants={isReduceMotion ? undefined : fadeIn}
                initial={isReduceMotion ? false : "hidden"}
                animate="visible"
                className="px-4 py-8 text-center text-sm text-muted-foreground"
              >
                No alerts match your current notification level.
              </motion.div>
            ) : (
              <motion.div
                key="list"
                variants={isReduceMotion ? undefined : fadeIn}
                initial={isReduceMotion ? false : "hidden"}
                animate="visible"
                className="space-y-2.5 px-2 py-2"
              >
                {grouped.map((group) => (
                  <div key={group.severity} className="min-w-0">
                    <div className="mb-1 flex items-center gap-2 px-2">
                      <NotificationSeverityBadge
                        severity={group.severity}
                        className="text-[10px]"
                      />
                      <span className="text-[10px] text-muted-foreground">
                        {group.items.length}
                      </span>
                    </div>
                    <div className="space-y-0.5">
                      {group.items.map((notification) => (
                        <NotificationItem
                          key={notification.id}
                          notification={notification}
                          compact
                          animate={!isReduceMotion}
                          onSelect={(item) =>
                            handleSelect(item.id, item.href)
                          }
                        />
                      ))}
                    </div>
                  </div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="shrink-0 border-t border-border/60 bg-popover p-3">
          <Button
            type="button"
            variant="secondary"
            className={cn(
              "w-full justify-between",
              "bg-gradient-to-r from-brand-cyan/10 to-brand-violet/10",
            )}
            onClick={() => {
              setOpen(false)
              navigate("/notifications")
            }}
          >
            View All Notifications
            <ChevronRight className="size-4" />
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  )
}
