const ERROR_ID_PREFIX = "EVO"

export function createErrorId(): string {
  const time = Date.now().toString(36).toUpperCase()
  const random = Math.random().toString(36).slice(2, 6).toUpperCase()
  return `${ERROR_ID_PREFIX}-${time}-${random}`
}

/** Logs full technical details to the console — never shown in UI. */
export function logAppError(
  scope: string,
  error: unknown,
  extra?: Record<string, unknown>,
): string {
  const errorId = createErrorId()

  if (import.meta.env.DEV) {
    console.error(`[${scope}] ${errorId}`, error, extra)
  } else {
    console.error(`[${scope}] ${errorId}`)
  }

  return errorId
}

export const FRIENDLY_ERROR = {
  title: "Something went wrong",
  description: "We're having trouble loading this screen. Please try again.",
} as const

export const FRIENDLY_NOT_FOUND = {
  title: "Page not found",
  description: "This route doesn't exist or may have moved.",
} as const

export const FRIENDLY_INLINE = {
  title: "Unable to load this section",
  description: "Something went wrong. Try again in a moment.",
} as const
