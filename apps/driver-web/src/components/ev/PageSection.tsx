import { motion } from "framer-motion"

import { Badge } from "@/components/ui/badge"
import { useSettings } from "@/hooks/useSettings"
import {
  getReducedMotionVariants,
  slideUp,
  staggerContainer,
} from "@/lib/motion"
import { cn } from "@/lib/utils"

interface PageSectionProps {
  title: string
  description: string
  badge?: string
  badgeVariant?: "default" | "secondary" | "outline"
  children?: React.ReactNode
  className?: string
}

export function PageSection({
  title,
  description,
  badge,
  badgeVariant = "secondary",
  children,
  className,
}: PageSectionProps) {
  const { isReduceMotion } = useSettings()
  const containerVariants = getReducedMotionVariants(staggerContainer)
  const itemVariants = getReducedMotionVariants(slideUp)

  return (
    <motion.section
      className={cn("mx-auto w-full max-w-6xl p-4 md:p-6 lg:p-8", className)}
      variants={containerVariants}
      initial={isReduceMotion ? false : "hidden"}
      animate="visible"
    >
      <motion.header variants={itemVariants} className="mb-6 md:mb-8">
        <div className="flex flex-wrap items-center gap-3">
          <h2 className="text-2xl font-semibold tracking-tight md:text-3xl">
            {title}
          </h2>
          {badge ? <Badge variant={badgeVariant}>{badge}</Badge> : null}
        </div>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground md:text-base">
          {description}
        </p>
      </motion.header>

      {children ? (
        <motion.div
          variants={containerVariants}
          className="grid gap-4 md:grid-cols-2 lg:grid-cols-3"
        >
          {children}
        </motion.div>
      ) : null}
    </motion.section>
  )
}
