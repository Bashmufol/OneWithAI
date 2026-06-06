import { AnimatePresence, motion } from "framer-motion"
import { Outlet, useLocation } from "react-router-dom"

import { useSettings } from "@/hooks/useSettings"
import { getReducedMotionVariants, pageTransition } from "@/lib/motion"

export function AnimatedOutlet() {
  const location = useLocation()
  const { isReduceMotion } = useSettings()
  const variants = getReducedMotionVariants(pageTransition)

  if (isReduceMotion) {
    return (
      <div className="min-h-full">
        <Outlet />
      </div>
    )
  }

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={location.pathname}
        variants={variants}
        initial="hidden"
        animate="visible"
        exit="exit"
        className="min-h-full"
      >
        <Outlet />
      </motion.div>
    </AnimatePresence>
  )
}
