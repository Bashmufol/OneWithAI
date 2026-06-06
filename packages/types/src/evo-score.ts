import { z } from "zod"

import { stationSchema } from "./station"

export const evoScoreFactorSchema = z.object({
  label: z.string(),
  weight: z.number(),
  value: z.number(),
})

export const evoScoreRecommendationSchema = z.object({
  station: stationSchema,
  score: z.number(),
  factors: z.array(evoScoreFactorSchema),
})

export type EvoScoreRecommendation = z.infer<typeof evoScoreRecommendationSchema>

export const evoScoreRecommendationListSchema = z.array(evoScoreRecommendationSchema)
export type EvoScoreRecommendationList = z.infer<typeof evoScoreRecommendationListSchema>
