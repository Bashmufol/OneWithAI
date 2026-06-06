import { z } from "zod"

export const stationStatusSchema = z.enum(["available", "busy", "offline"])
export type StationStatus = z.infer<typeof stationStatusSchema>
