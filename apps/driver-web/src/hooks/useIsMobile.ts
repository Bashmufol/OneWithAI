import { useEffect, useState } from "react"

const MOBILE_MEDIA_QUERY = "(max-width: 767px)"

export function useIsMobile(): boolean {
  const [isMobile, setIsMobile] = useState(() => {
    if (typeof window === "undefined") return false
    return window.matchMedia(MOBILE_MEDIA_QUERY).matches
  })

  useEffect(() => {
    const media = window.matchMedia(MOBILE_MEDIA_QUERY)
    const sync = () => setIsMobile(media.matches)

    sync()
    media.addEventListener("change", sync)
    return () => media.removeEventListener("change", sync)
  }, [])

  return isMobile
}
