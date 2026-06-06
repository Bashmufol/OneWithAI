import { stationListSchema, stationSchema } from "@evocharge/types"

import { buildUrl, fetchJson, type ApiClientConfig } from "./client"

export interface StationBoundsParams {
  north: number
  south: number
  east: number
  west: number
}

export interface StationListParams {
  bounds?: StationBoundsParams
}

export function createStationsApi(config: ApiClientConfig) {
  const base = buildUrl(config.baseUrl, "/stations")

  return {
    list: (params?: StationListParams) => {
      const search = params?.bounds
        ? new URLSearchParams({
            north: String(params.bounds.north),
            south: String(params.bounds.south),
            east: String(params.bounds.east),
            west: String(params.bounds.west),
          })
        : null

      const url = search ? `${base}?${search.toString()}` : base
      return fetchJson(url, stationListSchema)
    },
    getById: (id: string) => fetchJson(`${base}/${id}`, stationSchema),
  }
}

export type StationsApi = ReturnType<typeof createStationsApi>
