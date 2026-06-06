import { create } from "zustand"

import { passesNotificationLevel } from "@/lib/notificationFilter"
import { getSettingsSnapshot } from "@/lib/settingsStore"
import type {
  AppNotification,
  NotificationCounts,
  NotificationPageFilters,
  NotificationSource,
  NotificationSourceFilter,
  NotificationTypeFilter,
} from "@/types/notifications"

export type {
  AppNotification,
  NotificationCounts,
  NotificationPageFilters,
  NotificationSeverity,
  NotificationSource,
  NotificationSourceFilter,
  NotificationTypeFilter,
} from "@/types/notifications"

const STORAGE_KEY = "evocharge-notifications-v1"
const MAX_NOTIFICATIONS = 200
const DEDUPE_WINDOW_MS = 30_000
const DROPDOWN_PREVIEW_LIMIT = 8

interface NotificationStore {
  notifications: AppNotification[]
  pageFilters: NotificationPageFilters
  pageVisibleCount: number

  pushNotification: (
    notification: Omit<AppNotification, "id" | "read" | "timestamp"> & {
      id?: string
      read?: boolean
      timestamp?: number
    },
  ) => boolean
  markAsRead: (id: string) => void
  markAllAsRead: () => void
  clearAll: () => void
  setTypeFilter: (filter: NotificationTypeFilter) => void
  setSourceFilter: (filter: NotificationSourceFilter) => void
  setUnreadOnly: (enabled: boolean) => void
  setSearchQuery: (query: string) => void
  loadMore: () => void
  resetPageVisibleCount: () => void
}

export const DEFAULT_PAGE_FILTERS: NotificationPageFilters = {
  typeFilter: "all",
  sourceFilter: "all",
  unreadOnly: false,
  searchQuery: "",
}

function createNotificationId(): string {
  return `notif-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
}

function loadPersistedNotifications(): AppNotification[] {
  if (typeof window === "undefined") return []

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return []

    const parsed = JSON.parse(raw) as AppNotification[]
    if (!Array.isArray(parsed)) return []

    return parsed
      .filter(
        (entry) =>
          typeof entry.id === "string" &&
          typeof entry.title === "string" &&
          typeof entry.message === "string" &&
          typeof entry.timestamp === "number",
      )
      .slice(0, MAX_NOTIFICATIONS)
  } catch {
    return []
  }
}

function persistNotifications(notifications: AppNotification[]): void {
  if (typeof window === "undefined") return

  try {
    window.localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(notifications.slice(0, MAX_NOTIFICATIONS)),
    )
  } catch {
    // Ignore storage errors.
  }
}

function computeCounts(notifications: AppNotification[]): NotificationCounts {
  const bySource: Record<NotificationSource, number> = {
    network: 0,
    routing: 0,
    advisor: 0,
    system: 0,
  }

  let unread = 0
  let critical = 0
  let warning = 0
  let info = 0
  let success = 0

  for (const notification of notifications) {
    bySource[notification.source] += 1
    if (!notification.read) unread += 1

    switch (notification.severity) {
      case "critical":
        critical += 1
        break
      case "warning":
        warning += 1
        break
      case "info":
        info += 1
        break
      case "success":
        success += 1
        break
    }
  }

  return {
    total: notifications.length,
    unread,
    critical,
    warning,
    info,
    success,
    bySource,
  }
}

function normalizeSearchQuery(query: string): string {
  return query.trim().toLowerCase()
}

function matchesSearch(notification: AppNotification, query: string): boolean {
  const normalized = normalizeSearchQuery(query)
  if (!normalized) return true

  return (
    notification.title.toLowerCase().includes(normalized) ||
    notification.message.toLowerCase().includes(normalized)
  )
}

function passesPageFilters(
  notification: AppNotification,
  filters: NotificationPageFilters,
): boolean {
  if (filters.unreadOnly && notification.read) return false
  if (
    filters.typeFilter !== "all" &&
    notification.severity !== filters.typeFilter
  ) {
    return false
  }
  if (
    filters.sourceFilter !== "all" &&
    notification.source !== filters.sourceFilter
  ) {
    return false
  }
  if (!matchesSearch(notification, filters.searchQuery)) return false
  return true
}

function isDuplicate(
  notifications: AppNotification[],
  candidate: Pick<
    AppNotification,
    "severity" | "source" | "stationId" | "dedupeKey" | "title"
  >,
  timestamp: number,
): boolean {
  const dedupeKey =
    candidate.dedupeKey ??
    `${candidate.source}:${candidate.severity}:${candidate.stationId ?? candidate.title}`

  return notifications.some((existing) => {
    const existingKey =
      existing.dedupeKey ??
      `${existing.source}:${existing.severity}:${existing.stationId ?? existing.title}`

    if (existingKey !== dedupeKey) return false
    return timestamp - existing.timestamp < DEDUPE_WINDOW_MS
  })
}

export function filterNotificationsForSettings(
  notifications: AppNotification[],
): AppNotification[] {
  const { notificationLevel } = getSettingsSnapshot()
  return notifications.filter((notification) =>
    passesNotificationLevel(notificationLevel, notification.severity),
  )
}

export function getNotificationCounts(
  notifications: AppNotification[],
): NotificationCounts {
  return computeCounts(filterNotificationsForSettings(notifications))
}

export function getDropdownNotifications(
  notifications: AppNotification[],
): AppNotification[] {
  return filterNotificationsForSettings(notifications).slice(
    0,
    DROPDOWN_PREVIEW_LIMIT,
  )
}

export function getFilteredPageNotifications(
  notifications: AppNotification[],
  filters: NotificationPageFilters,
  visibleCount: number,
): AppNotification[] {
  return filterNotificationsForSettings(notifications)
    .filter((notification) => passesPageFilters(notification, filters))
    .slice(0, visibleCount)
}

export function hasMorePageNotifications(
  notifications: AppNotification[],
  filters: NotificationPageFilters,
  visibleCount: number,
): boolean {
  const total = filterNotificationsForSettings(notifications).filter(
    (notification) => passesPageFilters(notification, filters),
  ).length
  return visibleCount < total
}

export const useNotificationStore = create<NotificationStore>((set, get) => ({
  notifications: loadPersistedNotifications(),
  pageFilters: DEFAULT_PAGE_FILTERS,
  pageVisibleCount: 20,

  pushNotification: (notification) => {
    const timestamp = notification.timestamp ?? Date.now()
    const nextNotification: AppNotification = {
      id: notification.id ?? createNotificationId(),
      title: notification.title,
      message: notification.message,
      severity: notification.severity,
      source: notification.source,
      timestamp,
      read: notification.read ?? false,
      stationId: notification.stationId,
      dedupeKey: notification.dedupeKey,
      href: notification.href,
    }

    if (!passesNotificationLevel(getSettingsSnapshot().notificationLevel, nextNotification.severity)) {
      return false
    }

    const { notifications } = get()
    if (isDuplicate(notifications, nextNotification, timestamp)) {
      return false
    }

    const next = [nextNotification, ...notifications].slice(0, MAX_NOTIFICATIONS)
    persistNotifications(next)
    set({ notifications: next })
    return true
  },

  markAsRead: (id) => {
    const next = get().notifications.map((notification) =>
      notification.id === id ? { ...notification, read: true } : notification,
    )
    persistNotifications(next)
    set({ notifications: next })
  },

  markAllAsRead: () => {
    const next = get().notifications.map((notification) => ({
      ...notification,
      read: true,
    }))
    persistNotifications(next)
    set({ notifications: next })
  },

  clearAll: () => {
    persistNotifications([])
    set({ notifications: [], pageVisibleCount: 20 })
  },

  setTypeFilter: (typeFilter) => {
    set((state) => ({
      pageFilters: { ...state.pageFilters, typeFilter },
      pageVisibleCount: 20,
    }))
  },

  setSourceFilter: (sourceFilter) => {
    set((state) => ({
      pageFilters: { ...state.pageFilters, sourceFilter },
      pageVisibleCount: 20,
    }))
  },

  setUnreadOnly: (unreadOnly) => {
    set((state) => ({
      pageFilters: { ...state.pageFilters, unreadOnly },
      pageVisibleCount: 20,
    }))
  },

  setSearchQuery: (searchQuery) => {
    set((state) => ({
      pageFilters: { ...state.pageFilters, searchQuery },
      pageVisibleCount: 20,
    }))
  },

  loadMore: () => {
    set((state) => ({ pageVisibleCount: state.pageVisibleCount + 20 }))
  },

  resetPageVisibleCount: () => {
    set({ pageVisibleCount: 20 })
  },
}))
