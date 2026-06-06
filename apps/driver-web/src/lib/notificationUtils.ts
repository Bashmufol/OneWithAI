import type { AppNotification } from "@/lib/notificationStore"
import { getSeverityOrder } from "@/lib/notificationFilter"

export type NotificationDateGroup = "today" | "yesterday" | "earlier"

export interface GroupedNotifications {
  group: NotificationDateGroup
  label: string
  items: AppNotification[]
}

function startOfDay(date: Date): Date {
  const next = new Date(date)
  next.setHours(0, 0, 0, 0)
  return next
}

export function getNotificationDateGroup(
  timestamp: number,
  now = Date.now(),
): NotificationDateGroup {
  const todayStart = startOfDay(new Date(now)).getTime()
  const yesterdayStart = todayStart - 86_400_000

  if (timestamp >= todayStart) return "today"
  if (timestamp >= yesterdayStart) return "yesterday"
  return "earlier"
}

const GROUP_LABELS: Record<NotificationDateGroup, string> = {
  today: "Today",
  yesterday: "Yesterday",
  earlier: "Earlier",
}

export function groupNotificationsByDate(
  notifications: AppNotification[],
): GroupedNotifications[] {
  const buckets = new Map<NotificationDateGroup, AppNotification[]>()

  for (const notification of notifications) {
    const group = getNotificationDateGroup(notification.timestamp)
    const existing = buckets.get(group) ?? []
    existing.push(notification)
    buckets.set(group, existing)
  }

  const order: NotificationDateGroup[] = ["today", "yesterday", "earlier"]

  return order
    .filter((group) => buckets.has(group))
    .map((group) => ({
      group,
      label: GROUP_LABELS[group],
      items: buckets.get(group) ?? [],
    }))
}

export function groupNotificationsBySeverity(
  notifications: AppNotification[],
): Array<{ severity: AppNotification["severity"]; items: AppNotification[] }> {
  const order: AppNotification["severity"][] = [
    "critical",
    "warning",
    "success",
    "info",
  ]

  return order
    .map((severity) => ({
      severity,
      items: notifications.filter(
        (notification) => notification.severity === severity,
      ),
    }))
    .filter((entry) => entry.items.length > 0)
    .sort((a, b) => getSeverityOrder(a.severity) - getSeverityOrder(b.severity))
}

export function formatNotificationTime(timestamp: number): string {
  const date = new Date(timestamp)
  const now = new Date()
  const isToday = date.toDateString() === now.toDateString()

  const time = date.toLocaleTimeString(undefined, {
    hour: "numeric",
    minute: "2-digit",
  })

  if (isToday) return time

  return date.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  })
}
