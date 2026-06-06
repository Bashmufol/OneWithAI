import type { PulseEvent } from "@/lib/networkPulseEngine"

type PulseListener = (event: PulseEvent) => void

const pulseListeners = new Set<PulseListener>()

export function emitPulseEvent(event: PulseEvent): void {
  pulseListeners.forEach((listener) => listener(event))
}

export function subscribeToPulseEvents(listener: PulseListener): () => void {
  pulseListeners.add(listener)
  return () => {
    pulseListeners.delete(listener)
  }
}
