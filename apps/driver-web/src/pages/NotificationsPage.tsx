import { motion } from "framer-motion"
import {
  AlertTriangle,
  Bell,
  CheckCheck,
  Filter,
  Search,
  Siren,
  Trash2,
} from "lucide-react"
import { useEffect, useMemo, useState } from "react"
import { useNavigate } from "react-router-dom"

import { NotificationItem } from "@/components/notifications/NotificationItem"
import { PageSection } from "@/components/ev/PageSection"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useDebouncedValue } from "@/hooks/useDebouncedValue"
import { useNotifications } from "@/hooks/useNotifications"
import { useSettings } from "@/hooks/useSettings"
import { getNotificationLevelLabel } from "@/lib/notificationFilter"
import type {
  NotificationSourceFilter,
  NotificationTypeFilter,
} from "@/lib/notificationStore"
import { groupNotificationsByDate } from "@/lib/notificationUtils"
import { slideUp } from "@/lib/motion"

const TYPE_FILTERS: Array<{ value: NotificationTypeFilter; label: string }> = [
  { value: "all", label: "All" },
  { value: "info", label: "Info" },
  { value: "success", label: "Success" },
  { value: "warning", label: "Warning" },
  { value: "critical", label: "Critical" },
]

const SOURCE_FILTERS: Array<{
  value: NotificationSourceFilter
  label: string
}> = [
  { value: "all", label: "All sources" },
  { value: "network", label: "Network" },
  { value: "routing", label: "Routing" },
  { value: "advisor", label: "Advisor" },
  { value: "system", label: "System" },
]

export function NotificationsPage() {
  const navigate = useNavigate()
  const { settings } = useSettings()
  const {
    counts,
    pageItems,
    pageFilters,
    hasMore,
    markAsRead,
    markAllAsRead,
    clearAll,
    setTypeFilter,
    setSourceFilter,
    setUnreadOnly,
    setSearchQuery,
    loadMore,
  } = useNotifications()

  const [searchInput, setSearchInput] = useState(pageFilters.searchQuery)
  const [clearDialogOpen, setClearDialogOpen] = useState(false)
  const debouncedSearch = useDebouncedValue(searchInput, 250)

  useEffect(() => {
    setSearchQuery(debouncedSearch)
  }, [debouncedSearch, setSearchQuery])

  const grouped = useMemo(
    () => groupNotificationsByDate(pageItems),
    [pageItems],
  )

  return (
    <PageSection
      title="Notification Center"
      description="Full alert history across network pulses, route intelligence, advisor recommendations, and system events."
      badge="Operations"
      badgeVariant="outline"
      className="max-w-5xl"
    >
      <motion.div variants={slideUp} className="md:col-span-2 lg:col-span-3">
        <div className="grid gap-3 sm:grid-cols-3">
          <Card className="border-border/80 bg-card/80 ring-border/60">
            <CardContent className="flex items-center gap-3 px-4 py-4">
              <div className="rounded-lg bg-brand-cyan/10 p-2 ring-1 ring-brand-cyan/20">
                <Bell className="size-4 text-brand-cyan" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Total alerts</p>
                <p className="text-2xl font-semibold">{counts.total}</p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/80 bg-card/80 ring-border/60">
            <CardContent className="flex items-center gap-3 px-4 py-4">
              <div className="rounded-lg bg-brand-violet/10 p-2 ring-1 ring-brand-violet/20">
                <CheckCheck className="size-4 text-brand-violet" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Unread</p>
                <p className="text-2xl font-semibold">{counts.unread}</p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/80 bg-card/80 ring-border/60">
            <CardContent className="flex items-center gap-3 px-4 py-4">
              <div className="rounded-lg bg-status-offline/10 p-2 ring-1 ring-status-offline/20">
                <Siren className="size-4 text-status-offline" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Critical</p>
                <p className="text-2xl font-semibold">{counts.critical}</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </motion.div>

      <motion.div variants={slideUp} className="md:col-span-2 lg:col-span-3">
        <Card className="border-border/80 bg-card ring-border/60">
          <CardContent className="space-y-4 px-4 py-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Filter className="size-4" />
                <span>
                  Global filter:{" "}
                  <span className="font-medium text-foreground">
                    {getNotificationLevelLabel(settings.notificationLevel)}
                  </span>
                </span>
              </div>

              <div className="flex flex-wrap gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={markAllAsRead}
                  disabled={counts.unread === 0}
                >
                  <CheckCheck className="size-3.5" />
                  Mark all read
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setClearDialogOpen(true)}
                  disabled={counts.total === 0}
                >
                  <Trash2 className="size-3.5" />
                  Clear all
                </Button>
              </div>
            </div>

            <div className="relative">
              <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={searchInput}
                onChange={(event) => setSearchInput(event.target.value)}
                placeholder="Search by title or message…"
                className="pl-9"
              />
            </div>

            <Tabs
              value={pageFilters.typeFilter}
              onValueChange={(value) =>
                setTypeFilter(value as NotificationTypeFilter)
              }
            >
              <TabsList className="grid w-full grid-cols-5">
                {TYPE_FILTERS.map((filter) => (
                  <TabsTrigger key={filter.value} value={filter.value}>
                    {filter.label}
                  </TabsTrigger>
                ))}
              </TabsList>
            </Tabs>

            <div className="flex flex-wrap items-center gap-3">
              <Select
                value={pageFilters.sourceFilter}
                onValueChange={(value) =>
                  setSourceFilter(value as NotificationSourceFilter)
                }
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {SOURCE_FILTERS.map((filter) => (
                    <SelectItem key={filter.value} value={filter.value}>
                      {filter.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <div className="flex items-center gap-2 rounded-lg bg-muted/40 px-3 py-2 ring-1 ring-border/60">
                <Switch
                  checked={pageFilters.unreadOnly}
                  onCheckedChange={setUnreadOnly}
                  aria-label="Show unread only"
                />
                <span className="text-sm text-muted-foreground">Unread only</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <motion.div variants={slideUp} className="md:col-span-2 lg:col-span-3">
        <Card className="border-border/80 bg-card ring-border/60">
          <CardContent className="px-2 py-2">
            {pageItems.length === 0 ? (
              <div className="flex flex-col items-center gap-3 px-4 py-12 text-center">
                <AlertTriangle className="size-8 text-muted-foreground/60" />
                <div>
                  <p className="font-medium">No notifications found</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Adjust filters or wait for live network events.
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-5 py-2">
                {grouped.map((group) => (
                  <section key={group.group}>
                    <div className="sticky top-0 z-[1] bg-card/95 px-3 py-2 backdrop-blur-sm">
                      <h3 className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                        {group.label}
                      </h3>
                    </div>
                    <div className="space-y-1">
                      {group.items.map((notification) => (
                        <NotificationItem
                          key={notification.id}
                          notification={notification}
                          searchQuery={debouncedSearch}
                          onSelect={(item) => {
                            markAsRead(item.id)
                            if (item.href) {
                              navigate(item.href)
                            }
                          }}
                        />
                      ))}
                    </div>
                  </section>
                ))}

                {hasMore ? (
                  <div className="flex justify-center px-3 py-4">
                    <Button type="button" variant="outline" onClick={loadMore}>
                      Load more notifications
                    </Button>
                  </div>
                ) : null}
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      <Dialog open={clearDialogOpen} onOpenChange={setClearDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Clear all notifications?</DialogTitle>
            <DialogDescription>
              This removes your full alert history from this device. Live events
              will continue generating new notifications.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setClearDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={() => {
                clearAll()
                setClearDialogOpen(false)
              }}
            >
              Clear all
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </PageSection>
  )
}
