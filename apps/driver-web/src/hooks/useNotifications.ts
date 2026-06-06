import { useMemo } from "react"
import { useShallow } from "zustand/react/shallow"

import {
  getDropdownNotifications,
  getFilteredPageNotifications,
  getNotificationCounts,
  hasMorePageNotifications,
  useNotificationStore,
} from "@/lib/notificationStore"

export function useNotifications() {
  const notifications = useNotificationStore((state) => state.notifications)

  const pageFilters = useNotificationStore(useShallow((state) => state.pageFilters))
  const pageVisibleCount = useNotificationStore((state) => state.pageVisibleCount)

  const markAsRead = useNotificationStore((state) => state.markAsRead)
  const markAllAsRead = useNotificationStore((state) => state.markAllAsRead)
  const clearAll = useNotificationStore((state) => state.clearAll)
  const setTypeFilter = useNotificationStore((state) => state.setTypeFilter)
  const setSourceFilter = useNotificationStore((state) => state.setSourceFilter)
  const setUnreadOnly = useNotificationStore((state) => state.setUnreadOnly)
  const setSearchQuery = useNotificationStore((state) => state.setSearchQuery)
  const loadMore = useNotificationStore((state) => state.loadMore)

  const derived = useMemo(() => {
    const counts = getNotificationCounts(notifications)
    const dropdownItems = getDropdownNotifications(notifications)
    const pageItems = getFilteredPageNotifications(
      notifications,
      pageFilters,
      pageVisibleCount,
    )
    const hasMore = hasMorePageNotifications(
      notifications,
      pageFilters,
      pageVisibleCount,
    )
    const unreadDropdownCount = dropdownItems.filter((item) => !item.read).length

    return {
      counts,
      dropdownItems,
      pageItems,
      hasMore,
      unreadCount: counts.unread,
      unreadDropdownCount,
    }
  }, [notifications, pageFilters, pageVisibleCount])

  return {
    notifications,
    pageFilters,
    pageVisibleCount,
    ...derived,
    markAsRead,
    markAllAsRead,
    clearAll,
    setTypeFilter,
    setSourceFilter,
    setUnreadOnly,
    setSearchQuery,
    loadMore,
  }
}
