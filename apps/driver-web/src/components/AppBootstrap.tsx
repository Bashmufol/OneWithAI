import { useEffect } from "react"

let mockWorkerStarted = false

export function AppBootstrap() {
  useEffect(() => {
    if (import.meta.env.VITE_API_MODE === "live" || !import.meta.env.DEV) {
      return
    }

    if (mockWorkerStarted) return

    mockWorkerStarted = true

    void import("@/app/mocks/browser").then(({ startMockWorker }) =>
      startMockWorker(),
    )
  }, [])

  return null
}
