import type { AdvisorIntent } from "@/lib/advisor/types"

const LOW_BATTERY_PATTERN =
  /\b(low|urgent|critical|dying|almost empty|running low|need charge|need to charge|\d{1,2}%)\b/i

const NEAREST_PATTERN =
  /\b(nearest|closest|close by|close to|near me|nearby|around me)\b/i

const BEST_PATTERN =
  /\b(best|top|recommend|recommended|highest rated|good charger|great charger)\b/i

const ROUTE_PATTERN =
  /\b(route|on my way|along my route|on the way|corridor|heading to|driving to)\b/i

export function classifyIntent(query: string): AdvisorIntent {
  const normalized = query.trim().toLowerCase()
  if (!normalized) return "general"

  if (LOW_BATTERY_PATTERN.test(normalized)) return "low_battery"
  if (ROUTE_PATTERN.test(normalized)) return "route_based"
  if (NEAREST_PATTERN.test(normalized)) return "nearest"
  if (BEST_PATTERN.test(normalized)) return "best"

  return "general"
}
