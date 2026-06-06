import { handlers } from "@evocharge/api-client/mocks"
import { setupWorker } from "msw/browser"

let worker: ReturnType<typeof setupWorker> | undefined

function getWorker() {
  if (!worker) {
    worker = setupWorker(...handlers)
  }
  return worker
}

export async function startMockWorker() {
  const instance = getWorker()
  await instance.start({ onUnhandledRequest: "bypass" })
  return instance
}
