import { createAdvisorApi } from "./advisor"
import type { ApiClientConfig } from "./client"
import { createNetworkPulseApi } from "./network-pulse"
import { createRecommendationsApi } from "./recommendations"
import { createStationsApi } from "./stations"

export function createApiClient(config: ApiClientConfig) {
  return {
    stations: createStationsApi(config),
    recommendations: createRecommendationsApi(config),
    advisor: createAdvisorApi(config),
    networkPulse: createNetworkPulseApi(config),
  }
}

export type ApiClient = ReturnType<typeof createApiClient>

export { ApiError, fetchJson, buildUrl } from "./client"
export type { ApiClientConfig, ApiMode } from "./client"
export type { StationsApi, StationListParams, StationBoundsParams } from "./stations"
export type { RecommendationsApi, EvoScoreParams } from "./recommendations"
export type { AdvisorApi, AdvisorMessage } from "./advisor"
export type { NetworkPulseApi, NetworkPulseStreamOptions } from "./network-pulse"
