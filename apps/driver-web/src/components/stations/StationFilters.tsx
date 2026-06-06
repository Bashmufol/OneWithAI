import type { Station, StationStatus } from "@evocharge/types"
import { RotateCcw } from "lucide-react"
import { useMemo } from "react"

import { useStationFiltersStore } from "@/components/stations/store"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { getFilterOptions } from "@/lib/filterStations"
import { cn } from "@/lib/utils"

const STATUS_OPTIONS: { value: StationStatus; label: string; className: string }[] =
  [
    {
      value: "available",
      label: "Available",
      className:
        "data-[state=on]:bg-status-available/15 data-[state=on]:text-status-available data-[state=on]:ring-1 data-[state=on]:ring-status-available/30",
    },
    {
      value: "busy",
      label: "Busy",
      className:
        "data-[state=on]:bg-status-busy/15 data-[state=on]:text-status-busy data-[state=on]:ring-1 data-[state=on]:ring-status-busy/30",
    },
    {
      value: "offline",
      label: "Offline",
      className:
        "data-[state=on]:bg-status-offline/15 data-[state=on]:text-status-offline data-[state=on]:ring-1 data-[state=on]:ring-status-offline/30",
    },
  ]

interface StationFiltersProps {
  stations: Station[]
}

export function StationFilters({ stations }: StationFiltersProps) {
  const filters = useStationFiltersStore((state) => state.filters)
  const setFilter = useStationFiltersStore((state) => state.setFilter)
  const toggleFilterValue = useStationFiltersStore(
    (state) => state.toggleFilterValue,
  )
  const resetFilters = useStationFiltersStore((state) => state.resetFilters)

  const { operators, connectorTypes } = useMemo(
    () => getFilterOptions(stations),
    [stations],
  )

  const activeCount =
    filters.status.length +
    filters.operator.length +
    filters.connectorType.length

  return (
    <Card className="shrink-0 overflow-visible border-border/80 bg-card ring-border/60">
      <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-3">
        <CardTitle className="text-sm font-medium">Filters</CardTitle>
        {activeCount > 0 ? (
          <Button
            type="button"
            variant="ghost"
            size="xs"
            className="text-muted-foreground"
            onClick={resetFilters}
          >
            <RotateCcw className="size-3.5" />
            Reset
          </Button>
        ) : null}
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="space-y-2">
          <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
            Status
          </p>
          <ToggleGroup
            type="multiple"
            variant="outline"
            size="sm"
            value={filters.status}
            onValueChange={(value) =>
              setFilter("status", value as StationStatus[])
            }
            className="flex flex-wrap justify-start gap-1.5"
          >
            {STATUS_OPTIONS.map((option) => (
              <ToggleGroupItem
                key={option.value}
                value={option.value}
                className={cn("rounded-full px-3", option.className)}
              >
                {option.label}
              </ToggleGroupItem>
            ))}
          </ToggleGroup>
        </div>

        <div className="flex flex-wrap gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button type="button" variant="outline" size="sm">
                Operator
                {filters.operator.length > 0 ? (
                  <Badge variant="secondary" className="ml-1.5">
                    {filters.operator.length}
                  </Badge>
                ) : null}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-56">
              <DropdownMenuLabel>Operator</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {operators.map((operator) => (
                <DropdownMenuCheckboxItem
                  key={operator}
                  checked={filters.operator.includes(operator)}
                  onCheckedChange={() =>
                    toggleFilterValue("operator", operator)
                  }
                >
                  {operator}
                </DropdownMenuCheckboxItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button type="button" variant="outline" size="sm">
                Connector
                {filters.connectorType.length > 0 ? (
                  <Badge variant="secondary" className="ml-1.5">
                    {filters.connectorType.length}
                  </Badge>
                ) : null}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-48">
              <DropdownMenuLabel>Connector type</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {connectorTypes.map((connectorType) => (
                <DropdownMenuCheckboxItem
                  key={connectorType}
                  checked={filters.connectorType.includes(connectorType)}
                  onCheckedChange={() =>
                    toggleFilterValue("connectorType", connectorType)
                  }
                >
                  {connectorType}
                </DropdownMenuCheckboxItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardContent>
    </Card>
  )
}
