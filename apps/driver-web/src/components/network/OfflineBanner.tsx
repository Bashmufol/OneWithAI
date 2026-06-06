import { WifiOff } from "lucide-react"
import { AnimatePresence, motion } from "framer-motion"

import { useNetworkStore } from "@/store/networkStore"
import { cn } from "@/lib/utils"

interface OfflineBannerProps {
  className?: string
}

export function OfflineBanner({ className }: OfflineBannerProps) {
  const isOnline = useNetworkStore((state) => state.isOnline)

  return (
    <AnimatePresence>
      {!isOnline ? (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: "auto", opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.2 }}
          className={cn("overflow-hidden", className)}
        >
          <div
            role="status"
            aria-live="polite"
            className="flex items-center justify-center gap-2 border-b border-status-offline/30 bg-status-offline/10 px-4 py-2 text-sm text-status-offline"
          >
            <WifiOff className="size-4 shrink-0" />
            <span>You are offline</span>
            <span className="hidden text-status-offline/80 sm:inline">
              · Live updates paused · Cached data remains available
            </span>
          </div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  )
}
