import { createApiClient } from "@evocharge/api-client"

const baseUrl = import.meta.env.VITE_API_BASE_URL ?? "/api"
const mode = import.meta.env.VITE_API_MODE === "live" ? "live" : "mock"

export const apiClient = createApiClient({ baseUrl, mode })
