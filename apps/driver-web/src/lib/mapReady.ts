import type { Map as LeafletMap } from "leaflet"

export function isMapContainerReady(map: LeafletMap | null | undefined): boolean {
  if (!map?.getContainer) return false

  const container = map.getContainer()
  if (!container || !container.isConnected) return false

  const size = map.getSize?.()
  if (!size || size.x <= 0 || size.y <= 0) return false

  return true
}

export function isCanvasReady(
  canvas: HTMLCanvasElement | null | undefined,
): canvas is HTMLCanvasElement {
  return Boolean(canvas && canvas.width > 0 && canvas.height > 0)
}

export function runWhenMapReady(
  map: LeafletMap,
  callback: () => void,
): () => void {
  let cancelled = false

  const run = () => {
    if (cancelled || !isMapContainerReady(map)) return
    callback()
  }

  map.whenReady(run)

  if (isMapContainerReady(map)) {
    run()
  }

  map.on("resize", run)

  return () => {
    cancelled = true
    map.off("resize", run)
  }
}
