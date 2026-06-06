import type { StationStatus } from "@evocharge/types"

import type { PulseEvent } from "@/lib/networkPulseEngine"
import { subscribeToPulseEvents } from "@/lib/networkEventBus"
import { useNotificationStore } from "@/lib/notificationStore"
import type { NotificationSeverity } from "@/lib/notificationStore"

function getNetworkSeverity(
  previousStatus: StationStatus,
  newStatus: StationStatus,
): NotificationSeverity {
  if (newStatus === "offline") return "critical"
  if (newStatus === "busy") return "warning"
  if (newStatus === "available" && previousStatus !== "available") {
    return "success"
  }
  return "info"
}

function getNetworkTitle(newStatus: StationStatus): string {
  switch (newStatus) {
    case "offline":
      return "Station went offline"
    case "busy":
      return "Station now busy"
    case "available":
      return "Station available"
  }
}

export function bridgePulseEvent(event: PulseEvent): void {
  const severity = getNetworkSeverity(event.previousStatus, event.newStatus)

  useNotificationStore.getState().pushNotification({
    title: getNetworkTitle(event.newStatus),
    message: event.message,
    severity,
    source: "network",
    stationId: event.stationId,
    dedupeKey: `network:${event.stationId}:${event.newStatus}`,
    href: `/stations/${event.stationId}`,
  })
}

export function bridgeRouteNotification(input: {
  title: string
  message: string
  severity: NotificationSeverity
  stationId?: string
  dedupeKey: string
  href?: string
}): void {
  useNotificationStore.getState().pushNotification({
    title: input.title,
    message: input.message,
    severity: input.severity,
    source: "routing",
    stationId: input.stationId,
    dedupeKey: input.dedupeKey,
    href: input.href,
  })
}

export function bridgeAdvisorNotification(input: {
  title: string
  message: string
  severity?: NotificationSeverity
  stationId?: string
  dedupeKey: string
  href?: string
}): void {
  useNotificationStore.getState().pushNotification({
    title: input.title,
    message: input.message,
    severity: input.severity ?? "info",
    source: "advisor",
    stationId: input.stationId,
    dedupeKey: input.dedupeKey,
    href: input.href,
  })
}

export function bridgeSystemNotification(input: {
  title: string
  message: string
  severity?: NotificationSeverity
  dedupeKey: string
}): void {
  useNotificationStore.getState().pushNotification({
    title: input.title,
    message: input.message,
    severity: input.severity ?? "info",
    source: "system",
    dedupeKey: input.dedupeKey,
    href: "/settings",
  })
}

export function startNotificationEventBridge(): () => void {
  return subscribeToPulseEvents(bridgePulseEvent)
}
