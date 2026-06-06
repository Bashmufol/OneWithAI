import type { NotificationLevel } from "@/lib/settingsStore"

import type { NotificationSeverity } from "@/lib/notificationStore"

export type { NotificationSeverity }

export function passesNotificationLevel(
  level: NotificationLevel,
  severity: NotificationSeverity,
): boolean {
  if (level === "all") return true
  if (level === "critical") return severity === "critical"
  return severity !== "info"
}

/** @deprecated Use passesNotificationLevel */
export function shouldShowNotification(
  level: NotificationLevel,
  severity: "info" | "important" | "critical",
): boolean {
  if (severity === "important") {
    return passesNotificationLevel(level, "warning")
  }
  return passesNotificationLevel(level, severity)
}

export function getNotificationLevelLabel(level: NotificationLevel): string {
  switch (level) {
    case "all":
      return "All events"
    case "important":
      return "Important only"
    case "critical":
      return "Critical only"
  }
}

export function getSeverityLabel(severity: NotificationSeverity): string {
  switch (severity) {
    case "info":
      return "Info"
    case "success":
      return "Success"
    case "warning":
      return "Warning"
    case "critical":
      return "Critical"
  }
}

export function getSeverityOrder(severity: NotificationSeverity): number {
  switch (severity) {
    case "critical":
      return 0
    case "warning":
      return 1
    case "success":
      return 2
    case "info":
      return 3
  }
}
