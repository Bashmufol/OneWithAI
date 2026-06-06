import { evoScoreRecommendationListSchema } from "@evocharge/types"

import { buildUrl, fetchJson, type ApiClientConfig } from "./client"

export interface EvoScoreParams {
  lat: number
  lng: number
  limit?: number
}

export function createRecommendationsApi(config: ApiClientConfig) {
  const base = buildUrl(config.baseUrl, "/recommendations/evo-score")

  return {
    getEvoScore: (params: EvoScoreParams) => {
      const search = new URLSearchParams({
        lat: String(params.lat),
        lng: String(params.lng),
        ...(params.limit != null ? { limit: String(params.limit) } : {}),
      })

      return fetchJson(`${base}?${search}`, evoScoreRecommendationListSchema)
    },
  }
}

export type RecommendationsApi = ReturnType<typeof createRecommendationsApi>
