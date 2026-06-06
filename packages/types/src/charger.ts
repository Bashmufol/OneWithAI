import { z } from "zod"

import { stationStatusSchema } from "./status"

export const connectorTypeSchema = z.enum(["CCS2", "CHAdeMO", "Type2", "GB/T"])
export type ConnectorType = z.infer<typeof connectorTypeSchema>

export const connectorSchema = z.object({
  id: z.string(),
  type: connectorTypeSchema,
  powerKw: z.number(),
  status: stationStatusSchema,
})

export type Connector = z.infer<typeof connectorSchema>
