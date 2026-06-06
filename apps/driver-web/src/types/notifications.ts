export type NotificationSeverity = "info" | "success" | "warning" | "critical"
export type NotificationSource = "network" | "routing" | "advisor" | "system"
export type NotificationTypeFilter = "all" | NotificationSeverity
export type NotificationSourceFilter = "all" | NotificationSource

export interface AppNotification {
  id: string
  title: string
  message: string
  severity: NotificationSeverity
  source: NotificationSource
  timestamp: number
  read: boolean
  stationId?: string
  dedupeKey?: string
  href?: string
}

export interface NotificationCounts {
  total: number
  unread: number
  critical: number
  warning: number
  info: number
  success: number
  bySource: Record<NotificationSource, number>
}

export interface NotificationPageFilters {
  typeFilter: NotificationTypeFilter
  sourceFilter: NotificationSourceFilter
  unreadOnly: boolean
  searchQuery: string
}
