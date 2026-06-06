import type { Station } from "@evocharge/types"
import { Building2, MapPin, Zap } from "lucide-react"
import { useEffect, useMemo, useState } from "react"

import { useUserLocation } from "@/hooks/useUserLocation"
import { useDebouncedValue } from "@/hooks/useDebouncedValue"
import { useLiveStationsQuery } from "@/hooks/useLiveStationsQuery"
import { applyRouteDestination } from "@/lib/mapIntent"
import {
  formatDistanceLabel,
  sortStationsByDistance,
} from "@/lib/distance"
import {
  searchNigeriaLocations,
  type NigeriaLocation,
} from "@/lib/nigeriaLocations"
import { useMapIntentStore } from "@/store/mapIntentStore"
import type { RouteDestination } from "@/store/mapIntentStore"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"

const SEARCH_DEBOUNCE_MS = 250
const RESULT_LIMIT = 8

export type LocationSearchResult =
  | {
      id: string
      kind: "station"
      label: string
      subtitle: string
      distanceKm: number
      destination: RouteDestination
    }
  | {
      id: string
      kind: NigeriaLocation["kind"]
      label: string
      subtitle: string
      distanceKm: number
      destination: RouteDestination
    }

function stationToDestination(station: Station): RouteDestination {
  return {
    label: station.name,
    address: station.location.address,
    lat: station.location.lat,
    lng: station.location.lng,
    stationId: station.id,
    kind: "station",
  }
}

function locationToDestination(location: NigeriaLocation): RouteDestination {
  return {
    label: location.label,
    address: location.address,
    lat: location.lat,
    lng: location.lng,
    kind: location.kind,
  }
}

interface LocationSearchDropdownProps {
  className?: string
  placeholder?: string
}

export function LocationSearchDropdown({
  className,
  placeholder = "Search destination — station, city, or landmark",
}: LocationSearchDropdownProps) {
  const { safeLocation, usingFallback } = useUserLocation()
  const routeDestination = useMapIntentStore((state) => state.routeDestination)
  const { data: stations = [] } = useLiveStationsQuery()
  const [query, setQuery] = useState(routeDestination?.label ?? "")
  const [isFocused, setIsFocused] = useState(false)
  const debouncedQuery = useDebouncedValue(query, SEARCH_DEBOUNCE_MS)

  useEffect(() => {
    if (routeDestination?.label) {
      setQuery(routeDestination.label)
    }
  }, [routeDestination?.label])

  const results = useMemo(() => {
    const normalized = debouncedQuery.trim().toLowerCase()
    if (!normalized) return []

    const stationMatches = sortStationsByDistance(
      stations.filter(
        (station) =>
          station.name.toLowerCase().includes(normalized) ||
          station.operator.toLowerCase().includes(normalized) ||
          station.location.city.toLowerCase().includes(normalized) ||
          station.location.address.toLowerCase().includes(normalized),
      ),
      safeLocation.lat,
      safeLocation.lng,
    ).slice(0, RESULT_LIMIT)

    const cityMatches = searchNigeriaLocations(normalized)
      .map((location) => ({
        location,
        distanceKm:
          Math.abs(location.lat - safeLocation.lat) +
          Math.abs(location.lng - safeLocation.lng),
      }))
      .sort((left, right) => left.distanceKm - right.distanceKm)
      .slice(0, Math.max(2, RESULT_LIMIT - stationMatches.length))

    const merged: LocationSearchResult[] = [
      ...stationMatches.map((station) => ({
        id: station.id,
        kind: "station" as const,
        label: station.name,
        subtitle: `${station.location.city} · ${station.location.address}`,
        distanceKm: station.distanceKm,
        destination: stationToDestination(station),
      })),
      ...cityMatches.map(({ location, distanceKm }) => ({
        id: location.id,
        kind: location.kind,
        label: location.label,
        subtitle: location.address,
        distanceKm,
        destination: locationToDestination(location),
      })),
    ]

    return merged.slice(0, RESULT_LIMIT)
  }, [debouncedQuery, safeLocation.lat, safeLocation.lng, stations])

  const showResults = isFocused && debouncedQuery.trim().length > 0

  const handleSelect = (result: LocationSearchResult) => {
    setQuery(result.label)
    setIsFocused(false)
    applyRouteDestination(
      { lat: safeLocation.lat, lng: safeLocation.lng },
      result.destination,
    )
  }

  return (
    <div className={cn("relative", className)}>
      <MapPin className="pointer-events-none absolute top-1/2 left-3 z-10 size-4 -translate-y-1/2 text-muted-foreground" />
      <Input
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        onFocus={() => setIsFocused(true)}
        onBlur={() => {
          window.setTimeout(() => setIsFocused(false), 120)
        }}
        placeholder={placeholder}
        aria-label="Search route destination"
        aria-expanded={showResults}
        className="h-9 border-border bg-elevated/60 pl-9 text-sm"
      />

      {routeDestination?.address ? (
        <p className="mt-1.5 truncate text-[11px] text-muted-foreground">
          {routeDestination.address}
        </p>
      ) : null}

      {showResults ? (
        <div className="absolute top-[calc(100%+0.35rem)] z-20 max-h-72 w-full overflow-y-auto rounded-lg border border-border bg-card p-1 shadow-lg">
          {results.length === 0 ? (
            <p className="px-3 py-2 text-sm text-muted-foreground">
              No locations found for &quot;{debouncedQuery}&quot;
            </p>
          ) : (
            results.map((result) => (
              <button
                key={result.id}
                type="button"
                onMouseDown={(event) => event.preventDefault()}
                onClick={() => handleSelect(result)}
                className="flex w-full items-start gap-2.5 rounded-md px-3 py-2 text-left transition-colors hover:bg-elevated/70"
              >
                <span className="mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-md bg-brand-cyan/10 text-brand-cyan ring-1 ring-brand-cyan/20">
                  {result.kind === "station" ? (
                    <Zap className="size-3.5" />
                  ) : result.kind === "city" ? (
                    <Building2 className="size-3.5" />
                  ) : (
                    <MapPin className="size-3.5" />
                  )}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-medium">
                    {result.label}
                  </span>
                  <span className="block truncate text-xs text-muted-foreground">
                    {result.subtitle}
                  </span>
                </span>
                <span className="shrink-0 text-xs text-brand-cyan tabular-nums">
                  {formatDistanceLabel(result.distanceKm, {
                    approximate: usingFallback,
                  })}
                </span>
              </button>
            ))
          )}
        </div>
      ) : null}
    </div>
  )
}
