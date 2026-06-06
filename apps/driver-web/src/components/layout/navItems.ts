import type { LucideIcon } from "lucide-react"
import {
  Activity,
  Map,
  MessageSquare,
  Navigation,
  Zap,
} from "lucide-react"

export const navItems = [
  { to: "/", label: "Map", icon: Map, end: true },
  { to: "/near-me", label: "Near Me", icon: Navigation },
  { to: "/evo-score", label: "EvoScore", icon: Zap },
  { to: "/advisor", label: "Advisor", icon: MessageSquare },
  { to: "/network", label: "Network", icon: Activity },
] as const satisfies ReadonlyArray<{
  to: string
  label: string
  icon: LucideIcon
  end?: boolean
}>
