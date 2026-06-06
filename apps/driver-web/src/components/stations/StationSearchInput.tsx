import type { Station } from "@evocharge/types"
import { Search, X } from "lucide-react"
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type KeyboardEvent,
} from "react"
import { useNavigate } from "react-router-dom"

import { requestMapFocus } from "@/lib/mapIntent"
import { StationSearchSuggestions } from "@/components/stations/StationSearchSuggestions"
import { useStationFiltersStore } from "@/components/stations/store"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useDebouncedValue } from "@/hooks/useDebouncedValue"
import { useStationSearchSuggestions } from "@/hooks/useStationSearchSuggestions"
import { cn } from "@/lib/utils"

const SEARCH_DEBOUNCE_MS = 300

interface StationSearchInputProps {
  className?: string
}

export function StationSearchInput({ className }: StationSearchInputProps) {
  const navigate = useNavigate()
  const searchQuery = useStationFiltersStore((state) => state.searchQuery)
  const setSearchQuery = useStationFiltersStore((state) => state.setSearchQuery)

  const [inputValue, setInputValue] = useState(searchQuery)
  const [isFocused, setIsFocused] = useState(false)
  const [activeIndex, setActiveIndex] = useState(-1)
  const containerRef = useRef<HTMLDivElement>(null)

  const debouncedValue = useDebouncedValue(inputValue, SEARCH_DEBOUNCE_MS)
  const suggestions = useStationSearchSuggestions(searchQuery)

  const showSuggestions =
    isFocused && searchQuery.trim().length > 0 && suggestions.length > 0

  useEffect(() => {
    setSearchQuery(debouncedValue)
  }, [debouncedValue, setSearchQuery])

  useEffect(() => {
    setInputValue(searchQuery)
  }, [searchQuery])

  useEffect(() => {
    setActiveIndex(-1)
  }, [searchQuery, suggestions.length])

  useEffect(() => {
    if (!isFocused) return

    const handlePointerDown = (event: MouseEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) {
        setIsFocused(false)
      }
    }

    document.addEventListener("mousedown", handlePointerDown)
    return () => document.removeEventListener("mousedown", handlePointerDown)
  }, [isFocused])

  const handleSelectStation = useCallback(
    (station: Station) => {
      setInputValue(station.name)
      setSearchQuery(station.name)
      setIsFocused(false)
      setActiveIndex(-1)
      requestMapFocus(station.id, {
        lat: station.location.lat,
        lng: station.location.lng,
      })
      navigate("/")
    },
    [navigate, setSearchQuery],
  )

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (!showSuggestions) {
      if (event.key === "Escape") {
        setIsFocused(false)
      }
      return
    }

    switch (event.key) {
      case "ArrowDown":
        event.preventDefault()
        setActiveIndex((current) =>
          current < suggestions.length - 1 ? current + 1 : 0,
        )
        break
      case "ArrowUp":
        event.preventDefault()
        setActiveIndex((current) =>
          current > 0 ? current - 1 : suggestions.length - 1,
        )
        break
      case "Enter":
        event.preventDefault()
        if (activeIndex >= 0 && suggestions[activeIndex]) {
          handleSelectStation(suggestions[activeIndex])
        }
        break
      case "Escape":
        event.preventDefault()
        setIsFocused(false)
        setActiveIndex(-1)
        break
    }
  }

  return (
    <div ref={containerRef} className={cn("relative w-full", className)}>
      <Search className="pointer-events-none absolute top-1/2 left-3 z-10 size-4 -translate-y-1/2 text-muted-foreground" />
      <Input
        type="text"
        value={inputValue}
        onChange={(event) => setInputValue(event.target.value)}
        onFocus={() => setIsFocused(true)}
        onBlur={(event) => {
          const nextTarget = event.relatedTarget as Node | null
          if (!nextTarget || !containerRef.current?.contains(nextTarget)) {
            setIsFocused(false)
          }
        }}
        onKeyDown={handleKeyDown}
        placeholder="Search stations..."
        role="searchbox"
        aria-label="Search stations"
        aria-expanded={showSuggestions}
        aria-autocomplete="list"
        aria-controls={showSuggestions ? "station-search-suggestions" : undefined}
        aria-activedescendant={
          showSuggestions && activeIndex >= 0
            ? `station-suggestion-${suggestions[activeIndex]?.id}`
            : undefined
        }
        className="h-9 border-border bg-elevated/60 pl-9 pr-9 text-sm placeholder:text-muted-foreground"
      />
      {inputValue ? (
        <Button
          type="button"
          variant="ghost"
          size="icon-xs"
          className="absolute top-1/2 right-1.5 z-10 -translate-y-1/2 text-muted-foreground"
          onClick={() => {
            setInputValue("")
            setSearchQuery("")
            setActiveIndex(-1)
          }}
          aria-label="Clear search"
        >
          <X className="size-3.5" />
        </Button>
      ) : null}

      {showSuggestions ? (
        <div id="station-search-suggestions">
          <StationSearchSuggestions
            suggestions={suggestions}
            query={searchQuery}
            activeIndex={activeIndex}
            onSelect={handleSelectStation}
            onHover={setActiveIndex}
          />
        </div>
      ) : null}
    </div>
  )
}
