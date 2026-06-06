import { z } from "zod"

export const networkPulseEventTypeSchema = z.enum([
  "STATION_STATUS_CHANGED",
  "DEMAND_SPIKE",
])

export const networkPulseEventSchema = z.object({
  type: networkPulseEventTypeSchema,
  stationId: z.string(),
  payload: z.record(z.unknown()),
  timestamp: z.string(),
})

export type NetworkPulseEvent = z.infer<typeof networkPulseEventSchema>
