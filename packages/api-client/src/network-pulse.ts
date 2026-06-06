import type { NetworkPulseEvent } from "@evocharge/types"

import { buildUrl, type ApiClientConfig } from "./client"

export interface NetworkPulseStreamOptions {
  onEvent: (event: NetworkPulseEvent) => void
  onError?: (error: Error) => void
}

export function createNetworkPulseApi(config: ApiClientConfig) {
  const streamUrl = buildUrl(config.baseUrl, "/network-pulse/stream")

  return {
    connectStream: (_options: NetworkPulseStreamOptions) => {
      void streamUrl
      void config.mode
      return () => {}
    },
  }
}

export type NetworkPulseApi = ReturnType<typeof createNetworkPulseApi>
