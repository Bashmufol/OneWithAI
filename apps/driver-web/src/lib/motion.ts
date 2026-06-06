import type { Variants } from "framer-motion"

import { useSettingsStore } from "@/lib/settingsStore"

export const fadeIn: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.25, ease: "easeOut" } },
}

export const slideUp: Variants = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.3, ease: "easeOut" } },
}

export const staggerContainer: Variants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.07,
      delayChildren: 0.04,
    },
  },
}

export const pageTransition: Variants = {
  hidden: { opacity: 0, y: 8 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.28, ease: [0.25, 0.46, 0.45, 0.94] },
  },
  exit: {
    opacity: 0,
    y: -6,
    transition: { duration: 0.18, ease: "easeIn" },
  },
}

export const cardHover = {
  rest: { scale: 1, y: 0 },
  hover: {
    scale: 1.02,
    y: -2,
    transition: { duration: 0.2, ease: "easeOut" as const },
  },
} satisfies Variants

export const sidebarSlide: Variants = {
  hidden: { x: -16, opacity: 0 },
  visible: {
    x: 0,
    opacity: 1,
    transition: { duration: 0.25, ease: "easeOut" },
  },
}

export function isReduceMotionEnabled(): boolean {
  return useSettingsStore.getState().reduceMotion
}

export function getReducedMotionVariants(variants: Variants): Variants {
  if (!isReduceMotionEnabled()) return variants

  return {
    hidden: { opacity: 1 },
    visible: { opacity: 1, transition: { duration: 0 } },
    exit: { opacity: 1, transition: { duration: 0 } },
  }
}

export function getReducedHoverVariants(variants: Variants): Variants {
  if (!isReduceMotionEnabled()) return variants

  return {
    rest: { scale: 1, y: 0 },
    hover: { scale: 1, y: 0, transition: { duration: 0 } },
  }
}
