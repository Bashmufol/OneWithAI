import { z } from "zod"

import { connectorSchema } from "./charger"
import { stationStatusSchema } from "./status"

export const stationLocationSchema = z.object({
  lat: z.number(),
  lng: z.number(),
  address: z.string(),
  city: z.string(),
})

export const stationSchema = z.object({
  id: z.string(),
  name: z.string(),
  operator: z.string(),
  location: stationLocationSchema,
  connectors: z.array(connectorSchema),
  status: stationStatusSchema,
  evoScore: z.number().optional(),
  lastUpdated: z.string(),
})

export type Station = z.infer<typeof stationSchema>

export const stationListSchema = z.array(stationSchema)
export type StationList = z.infer<typeof stationListSchema>
