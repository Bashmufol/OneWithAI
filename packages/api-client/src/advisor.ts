import { z } from "zod"

import { buildUrl, fetchJson, type ApiClientConfig } from "./client"

export const advisorMessageSchema = z.object({
  id: z.string(),
  role: z.enum(["user", "assistant"]),
  content: z.string(),
  timestamp: z.string(),
})

export const advisorResponseSchema = z.object({
  message: advisorMessageSchema,
})

export type AdvisorMessage = z.infer<typeof advisorMessageSchema>

export function createAdvisorApi(config: ApiClientConfig) {
  const base = buildUrl(config.baseUrl, "/advisor/chat")

  return {
    sendMessage: (content: string) =>
      fetchJson(base, advisorResponseSchema, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content }),
      }),
  }
}

export type AdvisorApi = ReturnType<typeof createAdvisorApi>
