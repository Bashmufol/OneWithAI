import { motion } from "framer-motion"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { useSettings } from "@/hooks/useSettings"
import { cardHover, getReducedHoverVariants } from "@/lib/motion"
import { cn } from "@/lib/utils"

interface AnimatedCardProps {
  title: string
  description: string
  children?: React.ReactNode
  className?: string
}

export function AnimatedCard({
  title,
  description,
  children,
  className,
}: AnimatedCardProps) {
  const { isReduceMotion } = useSettings()
  const hoverVariants = getReducedHoverVariants(cardHover)

  return (
    <motion.div
      variants={hoverVariants}
      initial="rest"
      whileHover={isReduceMotion ? undefined : "hover"}
      className={cn("h-full", className)}
    >
      <Card className="settings-card h-full border-border/80 bg-card shadow-none ring-border/60 transition-shadow duration-200 hover:shadow-[0_8px_30px_oklch(0_0_0_/_35%)] hover:ring-primary/15">
        <CardHeader className="border-b border-border/60">
          <CardTitle>{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </CardHeader>
        {children ? <CardContent className="pt-4">{children}</CardContent> : null}
      </Card>
    </motion.div>
  )
}
