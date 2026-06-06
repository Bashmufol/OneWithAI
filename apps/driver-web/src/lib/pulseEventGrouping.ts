import type { StationStatus } from "@evocharge/types"

import type { PulseEvent } from "@/lib/networkPulseEngine"

export interface GroupedPulseEvent {
  id: string
  stationId: string
  stationName: string
  latestStatus: StationStatus
  count: number
  latestTimestamp: number
  message: string
}

const GROUP_WINDOW_MS = 45_000

export function groupPulseEvents(events: PulseEvent[]): GroupedPulseEvent[] {
  const groups: GroupedPulseEvent[] = []

  for (const event of events) {
    const existing = groups.find(
      (group) =>
        group.stationId === event.stationId &&
        group.latestTimestamp - event.timestamp <= GROUP_WINDOW_MS,
    )

    if (existing) {
      existing.count += 1
      existing.latestStatus = event.newStatus
      existing.latestTimestamp = Math.max(existing.latestTimestamp, event.timestamp)
      existing.message = `${event.stationName} — ${existing.count} live updates (now ${event.newStatus.toUpperCase()})`
      continue
    }

    groups.push({
      id: `${event.stationId}-${event.timestamp}`,
      stationId: event.stationId,
      stationName: event.stationName,
      latestStatus: event.newStatus,
      count: 1,
      latestTimestamp: event.timestamp,
      message: event.message,
    })
  }

  return groups
}

export function getPulseEventOpacity(timestamp: number, now = Date.now()): number {
  const age = now - timestamp

  if (age > 120_000) return 0.42
  if (age > 60_000) return 0.68
  return 1
}
