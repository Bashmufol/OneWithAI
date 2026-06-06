import { buildContext } from "@/lib/advisor/buildContext"
import { applyPolicy } from "@/lib/advisor/policies"
import { rankStations } from "@/lib/advisor/rankStations"
import { buildResponse } from "@/lib/advisor/responseBuilder"
import type { AdvisorInput, AdvisorResponse } from "@/lib/advisor/types"

export function getAdvisorRecommendation(input: AdvisorInput): AdvisorResponse {
  const context = buildContext(input)
  const ranked = rankStations(context)
  const selected = applyPolicy(context.intent, ranked, context)

  return buildResponse(context.intent, selected, context)
}

export type {
  AdvisorInput,
  AdvisorIntent,
  AdvisorResponse,
  RankedStation,
  StationReasoning,
} from "@/lib/advisor/types"

export { classifyIntent } from "@/lib/advisor/classifyIntent"
export { getAdvisorRecommendation as getChargeRecommendation }
