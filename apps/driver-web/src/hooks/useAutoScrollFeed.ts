import { useEffect, useRef, type RefObject } from "react"

const DEFAULT_THRESHOLD_PX = 64

function getScrollViewport(container: HTMLElement): HTMLElement {
  return (
    container.querySelector<HTMLElement>(
      '[data-slot="scroll-area-viewport"]',
    ) ?? container
  )
}

export function useAutoScrollFeed(
  containerRef: RefObject<HTMLElement | null>,
  itemCount: number,
  thresholdPx = DEFAULT_THRESHOLD_PX,
) {
  const isUserAtBottomRef = useRef(true)
  const hasInitialScrollRef = useRef(false)

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const viewport = getScrollViewport(container)

    const syncScrollPosition = () => {
      const distanceFromBottom =
        viewport.scrollHeight - viewport.scrollTop - viewport.clientHeight
      isUserAtBottomRef.current = distanceFromBottom <= thresholdPx
    }

    viewport.addEventListener("scroll", syncScrollPosition, { passive: true })
    syncScrollPosition()

    return () => {
      viewport.removeEventListener("scroll", syncScrollPosition)
    }
  }, [containerRef, thresholdPx])

  useEffect(() => {
    const container = containerRef.current
    if (!container || itemCount === 0) return

    const shouldAutoScroll =
      !hasInitialScrollRef.current || isUserAtBottomRef.current
    if (!shouldAutoScroll) return

    const viewport = getScrollViewport(container)
    viewport.scrollTo({
      top: viewport.scrollHeight,
      behavior: hasInitialScrollRef.current ? "smooth" : "auto",
    })
    hasInitialScrollRef.current = true
    isUserAtBottomRef.current = true
  }, [containerRef, itemCount])
}
