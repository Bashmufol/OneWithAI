import { useEffect } from "react"

import {
  bridgeSystemNotification,
  startNotificationEventBridge,
} from "@/lib/notificationEventBridge"

export function NotificationEventBridge() {
  useEffect(() => {
    bridgeSystemNotification({
      title: "Alert center online",
      message:
        "Network pulses, route changes, and advisor recommendations will surface here.",
      severity: "info",
      dedupeKey: "system:alert-center-online",
    })

    return startNotificationEventBridge()
  }, [])

  return null
}
